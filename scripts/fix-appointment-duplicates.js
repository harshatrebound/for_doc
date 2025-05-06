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

const logFile = path.join(LOG_DIR, `fix-appointment-duplicates-${new Date().toISOString().replace(/:/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

async function findExactDuplicates() {
  log('Checking for exact duplicate appointments...');
  
  // Find appointments with the exact same patient, doctor, date, time, and timeSlot
  const duplicateAppointments = await prisma.$queryRaw`
    SELECT 
      "patientName", 
      "doctorId", 
      "date"::date as appointment_date, 
      "time", 
      "timeSlot",
      "phone",
      "email",
      COUNT(*) as count, 
      ARRAY_AGG("id") as appointment_ids,
      ARRAY_AGG("createdAt") as created_at_times
    FROM 
      "Appointment"
    GROUP BY 
      "patientName", 
      "doctorId", 
      "date"::date, 
      "time",
      "timeSlot",
      "phone",
      "email"
    HAVING 
      COUNT(*) > 1
    ORDER BY 
      COUNT(*) DESC,
      "date"::date
  `;
  
  if (duplicateAppointments.length === 0) {
    log('No exact duplicate appointments found');
    return 0;
  }
  
  log(`Found ${duplicateAppointments.length} sets of exact duplicate appointments`);
  
  let removedCount = 0;
  
  for (const dupSet of duplicateAppointments) {
    log(`Duplicate set: ${dupSet.patientName} with doctor ${dupSet.doctorId} on ${dupSet.appointment_date} at ${dupSet.time} (${dupSet.count} duplicates)`);
    log(`  Phone: ${dupSet.phone}, Email: ${dupSet.email}`);
    log(`  Appointment IDs: ${dupSet.appointment_ids.join(', ')}`);
    
    // Keep the earliest created appointment and delete the rest
    // First, create pairs of id and createdAt time
    const appointments = dupSet.appointment_ids.map((id, index) => ({
      id,
      createdAt: new Date(dupSet.created_at_times[index])
    }));
    
    // Sort by creation time (earliest first)
    appointments.sort((a, b) => a.createdAt - b.createdAt);
    
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
  
  log(`Removed ${removedCount} exact duplicate appointments`);
  return removedCount;
}

async function findSimilarPatientNameDuplicates() {
  log('Checking for duplicate appointments with similar patient names...');
  
  // Get all appointments ordered by date and time
  const appointments = await prisma.appointment.findMany({
    orderBy: [
      { date: 'asc' },
      { time: 'asc' }
    ]
  });
  
  log(`Found ${appointments.length} total appointments`);
  
  // Group appointments by date, doctor, and time slot
  const groupedByDateDoctorTime = {};
  
  for (const appt of appointments) {
    const dateStr = appt.date.toISOString().split('T')[0];
    const key = `${dateStr}|${appt.doctorId}|${appt.time}`;
    
    if (!groupedByDateDoctorTime[key]) {
      groupedByDateDoctorTime[key] = [];
    }
    
    groupedByDateDoctorTime[key].push(appt);
  }
  
  // Check for similar names within each group
  const similarNameDuplicates = [];
  
  for (const [key, appts] of Object.entries(groupedByDateDoctorTime)) {
    if (appts.length <= 1) continue;
    
    // Check each pair of appointments in this group
    for (let i = 0; i < appts.length; i++) {
      for (let j = i + 1; j < appts.length; j++) {
        const appt1 = appts[i];
        const appt2 = appts[j];
        
        // Check for similar names or matching phone numbers or emails
        if (isSimilarName(appt1.patientName, appt2.patientName) || 
            (appt1.phone && appt1.phone === appt2.phone) ||
            (appt1.email && appt1.email === appt2.email)) {
          similarNameDuplicates.push({
            group: key,
            appt1,
            appt2,
            similarity: getSimilarity(appt1.patientName, appt2.patientName)
          });
        }
      }
    }
  }
  
  if (similarNameDuplicates.length === 0) {
    log('No similar-name duplicate appointments found');
    return 0;
  }
  
  log(`Found ${similarNameDuplicates.length} pairs of appointments with similar patient names`);
  
  let removedCount = 0;
  
  // Sort by similarity score (highest first)
  similarNameDuplicates.sort((a, b) => b.similarity - a.similarity);
  
  // Create a set to track already processed appointment IDs
  const processedIds = new Set();
  
  for (const { group, appt1, appt2, similarity } of similarNameDuplicates) {
    // Skip if we've already processed either of these appointments
    if (processedIds.has(appt1.id) || processedIds.has(appt2.id)) {
      continue;
    }
    
    const [date, doctorId, time] = group.split('|');
    log(`Potential duplicate pair: ${similarity.toFixed(2)} similarity`);
    log(`  1: ${appt1.patientName} (ID: ${appt1.id}, Created: ${appt1.createdAt.toISOString()})`);
    log(`  2: ${appt2.patientName} (ID: ${appt2.id}, Created: ${appt2.createdAt.toISOString()})`);
    log(`  Date: ${date}, Doctor: ${doctorId}, Time: ${time}`);
    log(`  Phone: ${appt1.phone} vs ${appt2.phone}, Email: ${appt1.email} vs ${appt2.email}`);
    
    // If high similarity or matching contact info, treat as duplicate
    if (similarity > 0.7 || (appt1.phone && appt1.phone === appt2.phone) || (appt1.email && appt1.email === appt2.email)) {
      // Keep the earlier created appointment
      const [keepAppt, deleteAppt] = appt1.createdAt < appt2.createdAt ? [appt1, appt2] : [appt2, appt1];
      
      log(`  Confirmed as duplicate. Keeping ${keepAppt.id} (created earlier)`);
      
      try {
        log(`  Deleting duplicate appointment ${deleteAppt.id}...`);
        
        await prisma.appointment.delete({
          where: { id: deleteAppt.id }
        });
        
        log(`  Successfully deleted duplicate appointment ${deleteAppt.id}`);
        removedCount++;
        
        // Mark both IDs as processed
        processedIds.add(appt1.id);
        processedIds.add(appt2.id);
      } catch (error) {
        log(`  Error deleting duplicate appointment ${deleteAppt.id}: ${error.message}`);
      }
    } else {
      log(`  Not similar enough to confirm as duplicate (similarity: ${similarity.toFixed(2)})`);
    }
  }
  
  log(`Removed ${removedCount} similar-name duplicate appointments`);
  return removedCount;
}

async function findOverlappingAppointments() {
  log('Checking for overlapping appointments...');
  
  // Get all appointments ordered by date and time
  const appointments = await prisma.appointment.findMany({
    orderBy: [
      { date: 'asc' },
      { time: 'asc' }
    ]
  });
  
  // Group appointments by date and doctor
  const groupedByDateDoctor = {};
  
  for (const appt of appointments) {
    const dateStr = appt.date.toISOString().split('T')[0];
    const key = `${dateStr}|${appt.doctorId}`;
    
    if (!groupedByDateDoctor[key]) {
      groupedByDateDoctor[key] = [];
    }
    
    groupedByDateDoctor[key].push(appt);
  }
  
  let overlappingCount = 0;
  let removedCount = 0;
  
  // Check for overlapping time slots within each date/doctor group
  for (const [key, appts] of Object.entries(groupedByDateDoctor)) {
    if (appts.length <= 1) continue;
    
    // Sort by time
    appts.sort((a, b) => {
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;
      return 0;
    });
    
    const [date, doctorId] = key.split('|');
    const overlappingPairs = [];
    
    // Check for overlapping time slots
    for (let i = 0; i < appts.length - 1; i++) {
      const appt1 = appts[i];
      const appt2 = appts[i + 1];
      
      // Skip if different patients
      if (!isSimilarName(appt1.patientName, appt2.patientName) && 
          (!appt1.phone || appt1.phone !== appt2.phone) && 
          (!appt1.email || appt1.email !== appt2.email)) {
        continue;
      }
      
      // Check time slot overlap
      if (isTimeOverlap(appt1.time, appt1.timeSlot, appt2.time, appt2.timeSlot)) {
        overlappingPairs.push({ appt1, appt2 });
        overlappingCount++;
      }
    }
    
    // Process overlapping pairs
    for (const { appt1, appt2 } of overlappingPairs) {
      log(`Found overlapping appointments for ${appt1.patientName}:`);
      log(`  1: ${appt1.id}, Time: ${appt1.time}, Slot: ${appt1.timeSlot}, Created: ${appt1.createdAt.toISOString()}`);
      log(`  2: ${appt2.id}, Time: ${appt2.time}, Slot: ${appt2.timeSlot}, Created: ${appt2.createdAt.toISOString()}`);
      
      // Keep the earlier created appointment
      const [keepAppt, deleteAppt] = appt1.createdAt < appt2.createdAt ? [appt1, appt2] : [appt2, appt1];
      
      log(`  Keeping ${keepAppt.id} (created earlier)`);
      
      try {
        log(`  Deleting overlapping appointment ${deleteAppt.id}...`);
        
        await prisma.appointment.delete({
          where: { id: deleteAppt.id }
        });
        
        log(`  Successfully deleted overlapping appointment ${deleteAppt.id}`);
        removedCount++;
      } catch (error) {
        log(`  Error deleting overlapping appointment ${deleteAppt.id}: ${error.message}`);
      }
    }
  }
  
  log(`Found ${overlappingCount} overlapping appointments, removed ${removedCount}`);
  return removedCount;
}

// Helper function to check if two strings are similar
function isSimilarName(name1, name2) {
  if (!name1 || !name2) return false;
  
  // Convert to lowercase and remove extra spaces
  const clean1 = name1.toLowerCase().trim().replace(/\s+/g, ' ');
  const clean2 = name2.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Exact match
  if (clean1 === clean2) return true;
  
  // Check if one is a subset of the other
  if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
  
  // Calculate Levenshtein distance similarity
  return getSimilarity(clean1, clean2) > 0.7;
}

// Calculate similarity based on Levenshtein distance
function getSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // Create matrix
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return dp[m][n];
}

// Check if two time slots overlap
function isTimeOverlap(time1, timeSlot1, time2, timeSlot2) {
  // Convert time strings to minutes for easier comparison
  const getMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Parse time slots into start and end minutes
  const parseTimeSlot = (timeSlot) => {
    if (!timeSlot) return null;
    
    const times = timeSlot.split(' - ');
    if (times.length !== 2) return null;
    
    const start = getMinutes(times[0]);
    const end = getMinutes(times[1]);
    
    return { start, end };
  };
  
  const t1 = getMinutes(time1);
  const t2 = getMinutes(time2);
  
  // If the exact times match, they overlap
  if (t1 === t2) return true;
  
  // Check time slot overlap if available
  const slot1 = parseTimeSlot(timeSlot1);
  const slot2 = parseTimeSlot(timeSlot2);
  
  if (slot1 && slot2) {
    // Check for overlap: one range starts before the other ends
    return slot1.start < slot2.end && slot2.start < slot1.end;
  }
  
  // Default to false if we can't determine
  return false;
}

async function main() {
  try {
    log('Starting comprehensive duplicate appointment check...');
    
    // Strategy 1: Find exact duplicates (same patient, doctor, date, time)
    const exactDuplicatesRemoved = await findExactDuplicates();
    
    // Strategy 2: Find duplicates with similar patient names
    const similarNameDuplicatesRemoved = await findSimilarPatientNameDuplicates();
    
    // Strategy 3: Find overlapping appointments
    const overlappingAppointmentsRemoved = await findOverlappingAppointments();
    
    const totalRemoved = exactDuplicatesRemoved + similarNameDuplicatesRemoved + overlappingAppointmentsRemoved;
    
    log(`Summary of duplicate appointment removal:`);
    log(`  - Exact duplicates removed: ${exactDuplicatesRemoved}`);
    log(`  - Similar name duplicates removed: ${similarNameDuplicatesRemoved}`);
    log(`  - Overlapping appointments removed: ${overlappingAppointmentsRemoved}`);
    log(`  - Total appointments removed: ${totalRemoved}`);
    
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