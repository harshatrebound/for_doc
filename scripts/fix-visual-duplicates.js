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

const logFile = path.join(LOG_DIR, `fix-visual-duplicates-${new Date().toISOString().replace(/:/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

async function findSameDayPatientDuplicates() {
  log('Checking for visual duplicates (same patient name on same day)...');
  
  // This query focuses on finding appointments with the same patient name
  // on the same day, regardless of other fields like exact time or phone number
  const visualDuplicates = await prisma.$queryRaw`
    SELECT 
      "patientName", 
      "doctorId", 
      "date"::date as appointment_date,
      COUNT(*) as count, 
      ARRAY_AGG("id" ORDER BY "createdAt") as appointment_ids,
      ARRAY_AGG("time" ORDER BY "createdAt") as times,
      ARRAY_AGG("timeSlot" ORDER BY "createdAt") as timeSlots,
      ARRAY_AGG("createdAt" ORDER BY "createdAt") as created_at_times
    FROM 
      "Appointment"
    GROUP BY 
      "patientName", 
      "doctorId", 
      "date"::date
    HAVING 
      COUNT(*) > 1
    ORDER BY 
      appointment_date,
      "patientName"
  `;
  
  if (visualDuplicates.length === 0) {
    log('No visual duplicates found');
    return 0;
  }
  
  log(`Found ${visualDuplicates.length} sets of potential visual duplicates`);
  
  let removedCount = 0;
  
  for (const dupSet of visualDuplicates) {
    log(`Duplicate set: ${dupSet.patientname} with doctor ${dupSet.doctorid} on ${dupSet.appointment_date} (${dupSet.count} appointments)`);
    log(`  Times: ${dupSet.times.join(', ')}`);
    log(`  Time slots: ${dupSet.timeslots.map(t => t || 'none').join(', ')}`);
    log(`  IDs: ${dupSet.appointment_ids.join(', ')}`);
    
    // Check for exact same time duplicates
    const timeGroups = {};
    for (let i = 0; i < dupSet.appointment_ids.length; i++) {
      const time = dupSet.times[i];
      if (!timeGroups[time]) {
        timeGroups[time] = [];
      }
      timeGroups[time].push({
        id: dupSet.appointment_ids[i],
        timeSlot: dupSet.timeslots[i],
        createdAt: new Date(dupSet.created_at_times[i])
      });
    }
    
    // Process each time group with multiple appointments
    for (const [time, appointments] of Object.entries(timeGroups)) {
      if (appointments.length > 1) {
        log(`  Found ${appointments.length} duplicates at time ${time}`);
        
        // Sort by creation time (earliest first)
        appointments.sort((a, b) => a.createdAt - b.createdAt);
        
        const keepId = appointments[0].id;
        const deleteIds = appointments.slice(1).map(a => a.id);
        
        log(`  Keeping the earliest appointment ${keepId} (created at ${appointments[0].createdAt.toISOString()})`);
        
        for (const deleteId of deleteIds) {
          try {
            log(`  Deleting visual duplicate appointment ${deleteId}...`);
            
            await prisma.appointment.delete({
              where: { id: deleteId }
            });
            
            log(`  Successfully deleted visual duplicate appointment ${deleteId}`);
            removedCount++;
          } catch (error) {
            log(`  Error deleting visual duplicate appointment ${deleteId}: ${error.message}`);
          }
        }
      }
    }
  }
  
  log(`Removed ${removedCount} visual duplicate appointments`);
  return removedCount;
}

async function findExactTimeDuplicates() {
  log('Checking for duplicates with exactly the same time but different timeSlots...');
  
  // This query focuses specifically on the issue in the calendar where same name + same time
  // might show up multiple times, even if timeSlots are different
  const duplicates = await prisma.$queryRaw`
    SELECT 
      "patientName", 
      "doctorId", 
      "date"::date as appointment_date,
      "time",
      COUNT(*) as count, 
      ARRAY_AGG("id" ORDER BY "createdAt") as appointment_ids,
      ARRAY_AGG("timeSlot" ORDER BY "createdAt") as timeSlots,
      ARRAY_AGG("createdAt" ORDER BY "createdAt") as created_at_times
    FROM 
      "Appointment"
    GROUP BY 
      "patientName", 
      "doctorId", 
      "date"::date,
      "time"
    HAVING 
      COUNT(*) > 1
    ORDER BY 
      appointment_date,
      "time"
  `;
  
  if (duplicates.length === 0) {
    log('No exact time duplicates found');
    return 0;
  }
  
  log(`Found ${duplicates.length} sets of exact time duplicates`);
  
  let removedCount = 0;
  
  for (const dupSet of duplicates) {
    log(`Duplicate set: ${dupSet.patientname} with doctor ${dupSet.doctorid} on ${dupSet.appointment_date} at ${dupSet.time} (${dupSet.count} duplicates)`);
    log(`  Time slots: ${dupSet.timeslots.map(t => t || 'none').join(', ')}`);
    log(`  IDs: ${dupSet.appointment_ids.join(', ')}`);
    
    // Sort by creation time (earliest first)
    const appointments = dupSet.appointment_ids.map((id, index) => ({
      id,
      timeSlot: dupSet.timeslots[index],
      createdAt: new Date(dupSet.created_at_times[index])
    })).sort((a, b) => a.createdAt - b.createdAt);
    
    const keepId = appointments[0].id;
    const deleteIds = appointments.slice(1).map(a => a.id);
    
    log(`  Keeping the earliest appointment ${keepId} (created at ${appointments[0].createdAt.toISOString()})`);
    
    for (const deleteId of deleteIds) {
      try {
        log(`  Deleting duplicate appointment ${deleteId}...`);
        
        await prisma.appointment.delete({
          where: { id: deleteId }
        });
        
        log(`  Successfully deleted duplicate appointment ${deleteId}`);
        removedCount++;
      } catch (error) {
        log(`  Error deleting duplicate appointment ${deleteId}: ${error.message}`);
      }
    }
  }
  
  log(`Removed ${removedCount} exact time duplicate appointments`);
  return removedCount;
}

async function fixSpecificVisualDuplicates() {
  // Based on the screenshot, manually fix the specific duplicates we can see
  const specificDuplicates = [
    { name: "nishi prem", date: "2025-05-01", time: "09:00" },
    { name: "THIPPESHA M N", date: "2025-05-01", time: "09:05" },
    { name: "monalin m", date: "2025-05-03", time: "09:00" },
    { name: "Vijaya Ratnam N", date: "2025-05-03", time: "09:05" },
    { name: "Vijaya Ratnam N", date: "2025-05-05", time: "09:00" },
    { name: "Harsha Mudumba", date: "2025-05-07", time: "09:20" }
  ];
  
  log('Checking for specific visual duplicates identified in the calendar...');
  
  let removedCount = 0;
  
  for (const { name, date, time } of specificDuplicates) {
    log(`Checking for duplicates of patient "${name}" on ${date} at ${time}`);
    
    const matchingAppointments = await prisma.appointment.findMany({
      where: {
        patientName: name,
        date: {
          gte: new Date(`${date}T00:00:00Z`),
          lt: new Date(`${date}T23:59:59Z`)
        },
        time: time
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (matchingAppointments.length <= 1) {
      log(`  No duplicates found (found ${matchingAppointments.length} appointments)`);
      continue;
    }
    
    log(`  Found ${matchingAppointments.length} duplicate appointments`);
    
    // Keep the first (earliest created) appointment, delete the rest
    const keepAppointment = matchingAppointments[0];
    const deleteAppointments = matchingAppointments.slice(1);
    
    log(`  Keeping appointment ${keepAppointment.id} (created ${keepAppointment.createdAt})`);
    
    for (const appointment of deleteAppointments) {
      try {
        log(`  Deleting duplicate appointment ${appointment.id}...`);
        
        await prisma.appointment.delete({
          where: { id: appointment.id }
        });
        
        log(`  Successfully deleted duplicate appointment ${appointment.id}`);
        removedCount++;
      } catch (error) {
        log(`  Error deleting duplicate appointment ${appointment.id}: ${error.message}`);
      }
    }
  }
  
  log(`Removed ${removedCount} specific visual duplicate appointments`);
  return removedCount;
}

async function main() {
  try {
    log('Starting advanced visual duplicate appointment check...');
    
    // First try to fix the specific duplicates we can see in the screenshot
    const specificDuplicatesRemoved = await fixSpecificVisualDuplicates();
    
    // Then do a more general check for exact time duplicates (most likely to appear in UI)
    const exactTimeDuplicatesRemoved = await findExactTimeDuplicates();
    
    // Finally check for same day + patient duplicates that might have different times
    const visualDuplicatesRemoved = await findSameDayPatientDuplicates();
    
    const totalRemoved = specificDuplicatesRemoved + exactTimeDuplicatesRemoved + visualDuplicatesRemoved;
    
    log(`Summary of visual duplicate appointment removal:`);
    log(`  - Specific duplicates removed: ${specificDuplicatesRemoved}`);
    log(`  - Exact time duplicates removed: ${exactTimeDuplicatesRemoved}`);
    log(`  - Same day patient duplicates removed: ${visualDuplicatesRemoved}`);
    log(`  - Total appointments removed: ${totalRemoved}`);
    
    log('All visual duplicate fixing operations completed successfully');
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