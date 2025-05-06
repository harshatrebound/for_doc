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

const logFile = path.join(LOG_DIR, `fix-duplicates-${new Date().toISOString().replace(/:/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

// Define canonical doctor IDs
const CANONICAL_DOCTORS = {
  // Keep the active Dr. Naveen & Team entry as canonical
  'Dr. Naveen & Team': '2e3de056-4948-4038-982f-74338d1f1e62',
  // Keep one of the Dr. Naveen entries (preferring the one with dot)
  'Dr. Naveen': '426f57a5-b2cd-4027-a790-a77e960a7703',
};

// Map of duplicate IDs to canonical IDs
const ID_MAPPINGS = {
  'other-doctors': '2e3de056-4948-4038-982f-74338d1f1e62',
  '531a972a-3ead-4356-91d5-0cbd0f8f10cc': '2e3de056-4948-4038-982f-74338d1f1e62',
  '6a6d2933-665c-4863-8a4c-1ba1e089273a': '2e3de056-4948-4038-982f-74338d1f1e62',
  '8134c5a1-aad1-4f98-9dde-3335077f2290': '426f57a5-b2cd-4027-a790-a77e960a7703', // "Dr Naveen" -> "Dr. Naveen"
};

async function fixDuplicateDoctors() {
  log('Starting to fix duplicate doctors...');
  
  // Get all doctors to verify our mappings
  const doctors = await prisma.doctor.findMany();
  log(`Found ${doctors.length} doctors in database`);
  
  for (const doctor of doctors) {
    log(`Doctor: ${doctor.id} - ${doctor.name} (${doctor.isActive ? 'Active' : 'Inactive'})`);
  }
  
  // First, update all appointments to use canonical doctor IDs
  for (const [duplicateId, canonicalId] of Object.entries(ID_MAPPINGS)) {
    try {
      // Count appointments with duplicate doctor ID
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) FROM "Appointment" WHERE "doctorId" = ${duplicateId}
      `;
      const count = parseInt(countResult[0].count, 10);
      
      if (count > 0) {
        log(`Updating ${count} appointments from doctor ${duplicateId} to ${canonicalId}...`);
        
        // Update appointments to use canonical doctor ID
        const updateResult = await prisma.$executeRaw`
          UPDATE "Appointment" 
          SET "doctorId" = ${canonicalId} 
          WHERE "doctorId" = ${duplicateId}
        `;
        
        log(`Updated ${updateResult} appointments for doctor ${duplicateId}`);
      } else {
        log(`No appointments found for doctor ${duplicateId}`);
      }
    } catch (error) {
      log(`Error updating appointments for duplicate doctor ${duplicateId}: ${error.message}`);
    }
  }
  
  // Now update DoctorSchedule entries if they exist
  for (const [duplicateId, canonicalId] of Object.entries(ID_MAPPINGS)) {
    try {
      // Count schedules with duplicate doctor ID
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) FROM "DoctorSchedule" WHERE "doctorId" = ${duplicateId}
      `;
      const count = parseInt(countResult[0].count, 10);
      
      if (count > 0) {
        log(`Updating ${count} schedules from doctor ${duplicateId} to ${canonicalId}...`);
        
        // Update schedules to use canonical doctor ID
        const updateResult = await prisma.$executeRaw`
          UPDATE "DoctorSchedule" 
          SET "doctorId" = ${canonicalId} 
          WHERE "doctorId" = ${duplicateId}
        `;
        
        log(`Updated ${updateResult} schedules for doctor ${duplicateId}`);
      } else {
        log(`No schedules found for doctor ${duplicateId}`);
      }
    } catch (error) {
      log(`Error updating schedules for duplicate doctor ${duplicateId}: ${error.message}`);
    }
  }

  // Check for SpecialDate entries
  for (const [duplicateId, canonicalId] of Object.entries(ID_MAPPINGS)) {
    try {
      // Count special dates with duplicate doctor ID
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) FROM "SpecialDate" WHERE "doctorId" = ${duplicateId}
      `;
      const count = parseInt(countResult[0].count, 10);
      
      if (count > 0) {
        log(`Updating ${count} special dates from doctor ${duplicateId} to ${canonicalId}...`);
        
        // Update special dates to use canonical doctor ID
        const updateResult = await prisma.$executeRaw`
          UPDATE "SpecialDate" 
          SET "doctorId" = ${canonicalId} 
          WHERE "doctorId" = ${duplicateId}
        `;
        
        log(`Updated ${updateResult} special dates for doctor ${duplicateId}`);
      } else {
        log(`No special dates found for doctor ${duplicateId}`);
      }
    } catch (error) {
      log(`Error updating special dates for duplicate doctor ${duplicateId}: ${error.message}`);
    }
  }
  
  // Finally, delete the duplicate doctor entries
  for (const duplicateId of Object.keys(ID_MAPPINGS)) {
    try {
      log(`Deleting duplicate doctor ${duplicateId}...`);
      
      // Delete the duplicate doctor
      await prisma.doctor.delete({
        where: { id: duplicateId }
      });
      
      log(`Successfully deleted duplicate doctor ${duplicateId}`);
    } catch (error) {
      log(`Error deleting duplicate doctor ${duplicateId}: ${error.message}`);
    }
  }
  
  log('Finished fixing duplicate doctors');
}

async function checkForDuplicateAppointments() {
  log('Checking for duplicate appointments...');
  
  // Find appointments with the same patient, doctor, date, and time
  const duplicateAppointments = await prisma.$queryRaw`
    SELECT 
      "patientName", 
      "doctorId", 
      "date"::date as appointment_date, 
      "time", 
      COUNT(*) as count, 
      ARRAY_AGG("id") as appointment_ids
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
      COUNT(*) DESC,
      "date"::date
  `;
  
  if (duplicateAppointments.length === 0) {
    log('No duplicate appointments found');
    return;
  }
  
  log(`Found ${duplicateAppointments.length} sets of duplicate appointments`);
  
  for (const dupSet of duplicateAppointments) {
    log(`Duplicate set: ${dupSet.patientName} with ${dupSet.doctorId} on ${dupSet.appointment_date} at ${dupSet.time} (${dupSet.count} duplicates)`);
    log(`  Appointment IDs: ${dupSet.appointment_ids.join(', ')}`);
    
    // Keep the first appointment and delete the rest
    const [keepId, ...deleteIds] = dupSet.appointment_ids;
    
    log(`  Keeping appointment ${keepId}`);
    
    for (const deleteId of deleteIds) {
      try {
        log(`  Deleting duplicate appointment ${deleteId}...`);
        
        await prisma.appointment.delete({
          where: { id: deleteId }
        });
        
        log(`  Successfully deleted duplicate appointment ${deleteId}`);
      } catch (error) {
        log(`  Error deleting duplicate appointment ${deleteId}: ${error.message}`);
      }
    }
  }
  
  log('Finished fixing duplicate appointments');
}

async function main() {
  try {
    log('Starting duplicate fixing process...');
    
    // Fix duplicate doctors and update references
    await fixDuplicateDoctors();
    
    // Check and fix duplicate appointments
    await checkForDuplicateAppointments();
    
    log('All duplicate fixing operations completed successfully');
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