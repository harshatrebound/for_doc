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

const logFile = path.join(LOG_DIR, `prevent-duplicates-${new Date().toISOString().replace(/:/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

async function addDatabaseConstraints() {
  log('Adding database constraints to prevent duplicates...');
  
  try {
    // 1. Create a unique index on Doctor table to prevent duplicate names
    log('Creating unique index on Doctor(name)...');
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Doctor_name_unique"
      ON "Doctor" ("name")
      WHERE "isActive" = true
    `;
    log('Successfully created unique index on Doctor(name)');
    
    // 2. Create a unique index on Appointment table to prevent duplicate appointments
    log('Creating unique index on Appointment(patientName, doctorId, date, time)...');
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_patient_doctor_date_time_unique"
      ON "Appointment" ("patientName", "doctorId", date_trunc('day', "date"), "time")
    `;
    log('Successfully created unique index on Appointment table');
    
    // 3. Create a trigger function to standardize doctor names and patient names
    log('Creating trigger function to standardize names...');
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION standardize_names()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Standardize doctor name
        IF TG_TABLE_NAME = 'Doctor' THEN
          NEW."name" = trim(NEW."name");
        END IF;
        
        -- Standardize patient name and check for duplicates
        IF TG_TABLE_NAME = 'Appointment' THEN
          NEW."patientName" = trim(NEW."patientName");
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    log('Successfully created standardize_names trigger function');
    
    // 4. Create triggers for Doctor and Appointment tables
    log('Creating trigger for Doctor table...');
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS doctor_standardize_names ON "Doctor";
      CREATE TRIGGER doctor_standardize_names
      BEFORE INSERT OR UPDATE ON "Doctor"
      FOR EACH ROW
      EXECUTE FUNCTION standardize_names();
    `;
    log('Successfully created trigger for Doctor table');
    
    log('Creating trigger for Appointment table...');
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS appointment_standardize_names ON "Appointment";
      CREATE TRIGGER appointment_standardize_names
      BEFORE INSERT OR UPDATE ON "Appointment"
      FOR EACH ROW
      EXECUTE FUNCTION standardize_names();
    `;
    log('Successfully created trigger for Appointment table');
    
    log('All database constraints successfully added');
    
    return true;
  } catch (error) {
    log(`Error adding database constraints: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function createBackupFunction() {
  log('Creating backup function to run periodically...');
  
  try {
    // Create a function to backup data
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION backup_tables()
      RETURNS void AS $$
      DECLARE
        backup_dir text := 'database_backups';
        timestamp text := to_char(now(), 'YYYY_MM_DD_HH24_MI_SS');
        doctor_file text := backup_dir || '/doctor_' || timestamp || '.json';
        appointment_file text := backup_dir || '/appointment_' || timestamp || '.json';
        doctor_data json;
        appointment_data json;
      BEGIN
        -- Create backup directory if it doesn't exist
        EXECUTE format('CREATE DIRECTORY IF NOT EXISTS %L', backup_dir);
        
        -- Export Doctor table to JSON
        SELECT json_agg(d) INTO doctor_data FROM "Doctor" d;
        EXECUTE format('COPY (SELECT %L) TO %L', doctor_data::text, doctor_file);
        
        -- Export Appointment table to JSON
        SELECT json_agg(a) INTO appointment_data FROM "Appointment" a;
        EXECUTE format('COPY (SELECT %L) TO %L', appointment_data::text, appointment_file);
        
        RAISE NOTICE 'Backup completed to %', backup_dir;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Backup failed: %', SQLERRM;
      END;
      $$ LANGUAGE plpgsql;
    `;
    log('Successfully created backup_tables function');
    
    // Note: Scheduling is typically handled by cron jobs or similar
    log('Note: To schedule regular backups, use a cron job or scheduler to run the backup_tables() function');
    
    return true;
  } catch (error) {
    log(`Error creating backup function: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function main() {
  try {
    log('Starting duplicate prevention setup...');
    
    // Add database constraints to prevent duplicates
    const constraintsAdded = await addDatabaseConstraints();
    
    // Create backup function
    const backupFunctionCreated = await createBackupFunction();
    
    if (constraintsAdded && backupFunctionCreated) {
      log('Successfully set up duplicate prevention mechanisms');
      
      // Provide recommendations for application-level changes
      log('RECOMMENDATIONS FOR APPLICATION CODE:');
      log('1. Add validation in the frontend to detect potential duplicates before submission');
      log('2. Add a confirmation step when booking appointments with similar details');
      log('3. Implement fuzzy matching in the backend appointment creation API to detect similar names');
      log('4. Add a de-duplication step in the appointment creation workflow');
      log('5. Update the doctor creation form to check for similar names before submission');
    } else {
      log('Some duplicate prevention mechanisms could not be set up');
    }
    
    log('Duplicate prevention setup completed');
  } catch (error) {
    log(`Error during setup: ${error.message}`);
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