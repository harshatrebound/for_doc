import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

// Define a type for appointment row
interface AppointmentRow {
  'Booking ID': string;
  'Customer Full Name': string;
  'Customer Email Address'?: string;
  'Customer Phone Number'?: string;
  'Created Date': string;
  'Service'?: string;
  'Start Time'?: string;
  'End Time'?: string;
  'Appointment Status'?: string;
  'Note'?: string;
  [key: string]: any; // For any other fields
}

// Function to parse date strings from the CSV format
function parseDate(dateString: string | undefined): Date | null {
  try {
    if (!dateString) return null;

    // Format example: "May 5, 2025 09:40"
    console.log(`Parsing date: ${dateString}`);
    
    // Manual parsing for our specific format
    const months: Record<string, number> = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 
      'May': 4, 'June': 5, 'July': 6, 'August': 7, 
      'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    
    // Extract parts from the date string
    const parts = dateString.match(/([A-Za-z]+) (\d+), (\d+) (\d+):(\d+)/);
    if (!parts) {
      console.error(`Date format not recognized: ${dateString}`);
      return null;
    }
    
    const month = months[parts[1]];
    const day = parseInt(parts[2], 10);
    const year = parseInt(parts[3], 10);
    const hour = parseInt(parts[4], 10);
    const minute = parseInt(parts[5], 10);
    
    // Use current year if needed
    const actualYear = year > 2100 ? new Date().getFullYear() : year;
    
    // Create a new date with the parsed values
    const date = new Date(actualYear, month, day, hour, minute);
    
    console.log(`Parsed date: ${date.toISOString()}`);
    return date;
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return null;
  }
}

// Function to extract doctor information and create if needed
async function getOrCreateDoctor(doctorName: string): Promise<string> {
  try {
    // Normalize doctor name
    let normalizedName = doctorName.replace(' & Team', '').trim();
    
    // Check if doctor exists
    let doctor = await prisma.doctor.findFirst({
      where: { name: normalizedName }
    });
    
    // Create doctor if not exists
    if (!doctor) {
      console.log(`Creating new doctor: ${normalizedName}`);
      doctor = await prisma.doctor.create({
        data: {
          name: normalizedName,
          fee: doctorName.includes('Sameer') ? 700 : 1000, // Based on CSV data
          speciality: 'Orthopedic',
          image: null,
        }
      });
    }
    
    return doctor.id;
  } catch (error) {
    console.error(`Error creating/finding doctor: ${doctorName}`, error);
    throw error;
  }
}

// Main function to import appointments
async function importAppointments() {
  try {
    console.log('Starting appointment import...');
    
    // Read the CSV file
    const filePath = path.join(process.cwd(), 'Bookingpress-export-appointment (2) (1).csv');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Debug: Let's inspect the first few lines of the CSV
    console.log("First 200 characters of CSV:", fileContent.substring(0, 200));
    
    // Parse CSV
    const parsedCsv = Papa.parse<AppointmentRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    
    console.log(`Found ${parsedCsv.data.length} appointments in CSV`);
    
    // Debug: Let's inspect the first row to see its structure
    if (parsedCsv.data.length > 0) {
      console.log("First row keys:", Object.keys(parsedCsv.data[0]));
      console.log("First row:", JSON.stringify(parsedCsv.data[0], null, 2));
    }
    
    // Process each appointment
    let processed = 0;
    for (const row of parsedCsv.data) {
      // Skip if missing essential data
      if (!row['Booking ID'] || !row['Customer Full Name'] || !row['Created Date']) {
        console.log(`Skipping row due to missing essential data: ${JSON.stringify(row)}`);
        continue;
      }
      
      // For debugging
      if (processed < 2) {
        console.log(`Appointment row data:`, JSON.stringify(row, null, 2));
      }
      
      // Extract doctor name and get/create doctor record
      const doctorName = row['Service'] || 'Dr Naveen & Team';
      const doctorId = await getOrCreateDoctor(doctorName);
      
      // Full debug dump of the appointment data
      if (processed < 2) {
        console.log("Start Time:", row['Start Time']);
      }
      
      // Force create some sample appointments for testing
      if (processed < 5) {
        try {
          const appointment = await prisma.appointment.create({
            data: {
              doctorId,
              patientName: row['Customer Full Name'],
              phone: row['Customer Phone Number'] ? row['Customer Phone Number'].replace(/\s+/g, '') : null,
              email: row['Customer Email Address'] || null,
              date: new Date(), // Use current date for testing
              time: "10:00",
              timeSlot: "10:00 - 10:15",
              status: row['Appointment Status'] || 'Pending',
              notes: row['Note'] || null,
              createdAt: new Date(),
            }
          });
          
          console.log(`Created test appointment for ${row['Customer Full Name']}`);
          processed++;
          continue; // Skip the normal flow for these test records
        } catch (error) {
          console.error(`Error creating test appointment:`, error);
        }
      }
      
      // Parse appointment date and time
      const appointmentDate = parseDate(row['Start Time']);
      
      if (!appointmentDate) {
        console.warn(`Skipping appointment ${row['Booking ID']} due to invalid date`);
        continue;
      }
      
      // Extract time
      let appointmentTime = null;
      if (row['Start Time']) {
        const timePart = row['Start Time'].split(' ');
        if (timePart.length > 2) {
          appointmentTime = timePart[timePart.length - 1];
        }
      }
      
      try {
        // Create appointment
        const appointment = await prisma.appointment.create({
          data: {
            doctorId,
            patientName: row['Customer Full Name'],
            phone: row['Customer Phone Number'] ? row['Customer Phone Number'].replace(/\s+/g, '') : null,
            email: row['Customer Email Address'] || null,
            date: appointmentDate,
            time: appointmentTime,
            timeSlot: `${appointmentTime || ''} - ${row['End Time']?.split(' ').pop() || ''}`,
            status: row['Appointment Status'] || 'Pending',
            notes: row['Note'] || null,
            createdAt: parseDate(row['Created Date']) || new Date(),
          }
        });
        
        console.log(`Imported appointment ${row['Booking ID']} for ${row['Customer Full Name']}`);
      } catch (error) {
        console.error(`Error creating appointment for ${row['Customer Full Name']}:`, error);
      }
    }
    
    console.log('Appointment import completed successfully');
  } catch (error) {
    console.error('Error importing appointments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importAppointments(); 