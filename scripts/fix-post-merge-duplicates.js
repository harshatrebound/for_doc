import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Initialize Prisma client
const prisma = new PrismaClient();
const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFile = path.join(LOG_DIR, `fix-post-merge-duplicates-${new Date().toISOString().replace(/:/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

async function fixPostMergeDuplicates() {
  log('Finding duplicate appointments caused by doctor merges...');
  
  // Find appointments for the same patient on the same day at the same time with the same doctor
  const duplicates = await prisma.$queryRaw`
    SELECT 
      "patientName", 
      "date"::date as appointment_date,
      "time",
      COUNT(*) as count, 
      ARRAY_AGG("id") as appointment_ids,
      ARRAY_AGG("createdAt") as created_at_times,
      ARRAY_AGG("updatedAt") as updated_at_times,
      ARRAY_AGG("status") as statuses,
      ARRAY_AGG("notes") as notes
    FROM 
      "Appointment"
    GROUP BY 
      "patientName", 
      "date"::date,
      "time"
    HAVING 
      COUNT(*) > 1
    ORDER BY 
      appointment_date,
      "time"
  `;
  
  if (duplicates.length === 0) {
    log('No duplicate appointments found');
    return 0;
  }
  
  log(`Found ${duplicates.length} sets of duplicate appointments`);
  
  let removedCount = 0;
  let mergedCount = 0;
  
  for (const dupSet of duplicates) {
    log(`Processing set: ${dupSet.patientname} on ${dupSet.appointment_date} at ${dupSet.time} (${dupSet.count} appointments)`);
    log(`  IDs: ${dupSet.appointment_ids.join(', ')}`);
    
    // Map appointments with all their data
    const appointments = dupSet.appointment_ids.map((id, index) => ({
      id,
      createdAt: new Date(dupSet.created_at_times[index]),
      updatedAt: new Date(dupSet.updated_at_times[index]),
      status: dupSet.statuses[index],
      notes: dupSet.notes[index]
    }));
    
    // Sort by status first (keeping non-pending), then by updatedAt (most recent)
    appointments.sort((a, b) => {
      const aIsNonPending = a.status !== 'Pending' ? 1 : 0;
      const bIsNonPending = b.status !== 'Pending' ? 1 : 0;
      
      if (aIsNonPending !== bIsNonPending) {
        return bIsNonPending - aIsNonPending;
      }
      
      return b.updatedAt - a.updatedAt;
    });
    
    // The appointment to keep
    const keepAppointment = appointments[0];
    
    // Appointments to remove or merge
    const otherAppointments = appointments.slice(1);
    
    // Check if we can merge notes from the other appointments
    let mergedNotes = keepAppointment.notes || '';
    let shouldMergeNotes = false;
    
    for (const appt of otherAppointments) {
      if (appt.notes && appt.notes.trim() && (!mergedNotes || !mergedNotes.includes(appt.notes.trim()))) {
        mergedNotes = mergedNotes 
          ? `${mergedNotes}\n[Merged note] ${appt.notes.trim()}`
          : `[Merged note] ${appt.notes.trim()}`;
        shouldMergeNotes = true;
      }
    }
    
    // If we have notes to merge, update the kept appointment
    if (shouldMergeNotes) {
      log(`  Merging notes into appointment ${keepAppointment.id}`);
      
      await prisma.appointment.update({
        where: { id: keepAppointment.id },
        data: { notes: mergedNotes }
      });
      
      mergedCount++;
    }
    
    log(`  Keeping appointment ${keepAppointment.id} with status ${keepAppointment.status}`);
    
    // Delete the other appointments
    for (const appt of otherAppointments) {
      try {
        log(`  Deleting duplicate appointment ${appt.id}...`);
        
        await prisma.appointment.delete({
          where: { id: appt.id }
        });
        
        log(`  Successfully deleted duplicate appointment ${appt.id}`);
        removedCount++;
      } catch (error) {
        log(`  Error deleting duplicate appointment ${appt.id}: ${error.message}`);
      }
    }
  }
  
  log(`Removed ${removedCount} duplicate appointments after merging notes where needed (${mergedCount} appointments had notes merged)`);
  return removedCount;
}

async function fixSpecificDuplicates() {
  log('Checking for specific duplicates from the screenshot...');
  
  const specificDuplicates = [
    { name: "Pompapathi V Gadad", time: "09:05" }
  ];
  
  let removedCount = 0;
  
  for (const { name, time } of specificDuplicates) {
    log(`Checking for duplicates of patient "${name}" at time ${time}`);
    
    const matchingAppointments = await prisma.appointment.findMany({
      where: {
        patientName: name,
        time: time
      },
      include: {
        doctor: {
          select: {
            name: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });
    
    log(`  Found ${matchingAppointments.length} appointments`);
    
    // Group by date and doctor
    const groupedAppointments = {};
    
    for (const appt of matchingAppointments) {
      const dateStr = appt.date.toISOString().split('T')[0];
      const key = `${dateStr}|${appt.doctorId}`;
      
      if (!groupedAppointments[key]) {
        groupedAppointments[key] = [];
      }
      
      groupedAppointments[key].push(appt);
    }
    
    // Process each group with multiple appointments
    for (const [key, appts] of Object.entries(groupedAppointments)) {
      if (appts.length <= 1) continue;
      
      const [dateStr, doctorId] = key.split('|');
      log(`  Found ${appts.length} duplicates on ${dateStr} with doctor ${doctorId}`);
      
      // Keep the appointment with the most recent status or creation date
      appts.sort((a, b) => {
        const aIsNonPending = a.status !== 'Pending' ? 1 : 0;
        const bIsNonPending = b.status !== 'Pending' ? 1 : 0;
        
        if (aIsNonPending !== bIsNonPending) {
          return bIsNonPending - aIsNonPending;
        }
        
        return b.createdAt - a.createdAt;
      });
      
      const keepAppointment = appts[0];
      const deleteAppointments = appts.slice(1);
      
      log(`  Keeping appointment ${keepAppointment.id} with status ${keepAppointment.status}`);
      
      for (const appt of deleteAppointments) {
        try {
          log(`  Deleting duplicate appointment ${appt.id}...`);
          
          await prisma.appointment.delete({
            where: { id: appt.id }
          });
          
          log(`  Successfully deleted duplicate appointment ${appt.id}`);
          removedCount++;
        } catch (error) {
          log(`  Error deleting duplicate appointment ${appt.id}: ${error.message}`);
        }
      }
    }
  }
  
  log(`Removed ${removedCount} specific duplicates`);
  return removedCount;
}

async function main() {
  try {
    log('Starting cleanup of post-merge duplicate appointments...');
    
    // First fix specific cases from the screenshot
    const specificDuplicatesRemoved = await fixSpecificDuplicates();
    
    // Then fix all general cases
    const postMergeDuplicatesRemoved = await fixPostMergeDuplicates();
    
    const totalRemoved = specificDuplicatesRemoved + postMergeDuplicatesRemoved;
    
    log(`Summary of post-merge duplicate removal:`);
    log(`  - Specific duplicates removed: ${specificDuplicatesRemoved}`);
    log(`  - General post-merge duplicates removed: ${postMergeDuplicatesRemoved}`);
    log(`  - Total appointments removed: ${totalRemoved}`);
    
    if (totalRemoved > 0) {
      log('Successfully resolved duplicate appointments caused by doctor merges');
    } else {
      log('No doctor-merge-related duplicate appointments were found');
    }
  } catch (error) {
    log(`Error during fix operation: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    logStream.end();
  }
}

main()
  .catch(e => {
    console.error('Unhandled error:', e);
    logStream.end();
    process.exit(1);
  }); 