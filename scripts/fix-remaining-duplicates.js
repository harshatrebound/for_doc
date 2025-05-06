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

const logFile = path.join(LOG_DIR, `fix-remaining-duplicates-${new Date().toISOString().replace(/:/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

async function fixAllExactDuplicates() {
  log('Checking for all exact duplicate appointments (same patient, date, time)...');
  
  // Comprehensive query to find ALL duplicates with same patient name, date, and time
  const duplicates = await prisma.$queryRaw`
    SELECT 
      "patientName", 
      "doctorId", 
      "date"::date as appointment_date,
      "time",
      COUNT(*) as count, 
      ARRAY_AGG("id") as appointment_ids,
      ARRAY_AGG("createdAt") as created_at_times,
      ARRAY_AGG("updatedAt") as updated_at_times,
      ARRAY_AGG("status") as statuses
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
    log('No exact duplicate appointments found');
    return 0;
  }
  
  log(`Found ${duplicates.length} sets of exact duplicate appointments`);
  
  let removedCount = 0;
  
  for (const dupSet of duplicates) {
    log(`Duplicate set: ${dupSet.patientname} on ${dupSet.appointment_date} at ${dupSet.time} (${dupSet.count} duplicates)`);
    log(`  IDs: ${dupSet.appointment_ids.join(', ')}`);
    log(`  Statuses: ${dupSet.statuses.join(', ')}`);
    
    // If one of the appointments has a status other than "Pending", keep that one
    let appointmentsWithIndices = dupSet.appointment_ids.map((id, index) => ({
      id,
      createdAt: new Date(dupSet.created_at_times[index]),
      updatedAt: new Date(dupSet.updated_at_times[index]),
      status: dupSet.statuses[index]
    }));
    
    // First priority: Keep completed appointments
    const nonPendingAppointments = appointmentsWithIndices.filter(a => a.status !== 'Pending');
    
    if (nonPendingAppointments.length > 0) {
      // If there are multiple non-pending appointments, keep the most recently updated one
      nonPendingAppointments.sort((a, b) => b.updatedAt - a.updatedAt);
      const keepAppointment = nonPendingAppointments[0];
      const deleteAppointments = appointmentsWithIndices.filter(a => a.id !== keepAppointment.id);
      
      log(`  Keeping appointment ${keepAppointment.id} with status ${keepAppointment.status} (most recently updated)`);
      
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
    } else {
      // If all are pending, keep the earliest created one
      appointmentsWithIndices.sort((a, b) => a.createdAt - b.createdAt);
      const keepAppointment = appointmentsWithIndices[0];
      const deleteAppointments = appointmentsWithIndices.slice(1);
      
      log(`  Keeping the earliest appointment ${keepAppointment.id} (created at ${keepAppointment.createdAt.toISOString()})`);
      
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
  }
  
  log(`Removed ${removedCount} exact duplicate appointments`);
  return removedCount;
}

async function fixSpecificVisualDuplicates() {
  // Based on the latest screenshot, manually fix the specific duplicates we can see
  const specificDuplicates = [
    { name: "Sanjay Thomas", date: "2025-05-01", time: "09:30" },
    { name: "Jose M P", date: "2025-05-03", time: "11:00" },
    { name: "Ayush Ayus", date: "2025-05-03", time: "09:00" },
    { name: "Karthik d Karthik d", date: "2025-05-05", time: "10:40" },
    { name: "deiva sigamani", date: "2025-05-05", time: "10:50" },
    { name: "Biraj Bora", date: "2025-05-08", time: "11:00" },
    { name: "Rohan Kumar", date: "2025-05-10", time: "11:00" }
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

async function enablePostgreSQLConstraints() {
  log('Adding PostgreSQL constraints to prevent future duplicates...');
  
  try {
    // Create partial unique index for active doctors
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Doctor_name_active_unique" 
      ON "Doctor" ("name") 
      WHERE "isActive" = true;
    `;
    log('Created unique index for active doctor names');
    
    // Create unique index for appointments (same patient, doctor, date, time)
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_patient_doctor_datetime_unique" 
      ON "Appointment" ("patientName", "doctorId", date_trunc('day', "date"), "time");
    `;
    log('Created unique index for appointments to prevent exact duplicates');
    
    return true;
  } catch (error) {
    log(`Error creating database constraints: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function main() {
  try {
    log('Starting cleanup of remaining duplicate appointments...');
    
    // First try to fix the specific duplicates we can see in the screenshot
    const specificDuplicatesRemoved = await fixSpecificVisualDuplicates();
    
    // Then do a comprehensive check for all exact duplicates
    const exactDuplicatesRemoved = await fixAllExactDuplicates();
    
    // Add database constraints to prevent future duplicates
    const constraintsEnabled = await enablePostgreSQLConstraints();
    
    const totalRemoved = specificDuplicatesRemoved + exactDuplicatesRemoved;
    
    log(`Summary of duplicate appointment removal:`);
    log(`  - Specific duplicates removed: ${specificDuplicatesRemoved}`);
    log(`  - All other exact duplicates removed: ${exactDuplicatesRemoved}`);
    log(`  - Total appointments removed: ${totalRemoved}`);
    log(`  - Database constraints created: ${constraintsEnabled ? 'Yes' : 'No'}`);
    
    if (totalRemoved > 0) {
      log('Successfully removed all duplicate appointments');
    } else {
      log('No duplicate appointments found to remove');
    }
    
    log('Duplicate fixing operations completed');
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