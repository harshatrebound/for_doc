# Doctor Data Structure Documentation

This document outlines the structured approach for storing and retrieving doctor profile information, particularly focusing on how we handle complex nested data such as qualifications, awards, and other list-based information.

## Overview

We've implemented a hybrid data model that combines:

1. **CSV Data** (`surgeons_data_v2.csv`): For basic, flat data about doctors
2. **JSON Files** (in `surgeon_details/`): For complex, structured list data

This separation provides both scalability and maintainability while keeping data organized.

## Data Structure

### CSV Structure (`surgeons_data_v2.csv`)

The CSV file contains basic doctor information with the following columns:

- `Surgeon Slug`: Unique identifier for the doctor
- `Section Title`: Category of information (e.g., "Expertise")
- `Item Text`: The actual text content
- `Details File Path`: Path to the JSON file containing detailed information

### JSON Structure (`surgeon_details/<slug>.json`)

Each doctor has a dedicated JSON file containing structured lists of information organized by category:

```json
{
  "Awards & Distinction": [
    "Award 1",
    "Award 2"
  ],
  "Qualifications": [
    "Qualification 1",
    "Qualification 2"
  ],
  "Additional Credentials": [],
  "Professional Visits": [],
  "Faculty & Guest Lectures": [],
  "Conferences": [],
  "Poster Presentations": [],
  "Podium Presentations": [],
  "Courses": [],
  "Continued Medical Education (Cmes)": [],
  "Publications": [],
  "Executive & Management Experience": [],
  "Affiliations & Memberships": [],
  "Expertise": []
}
```

## Supported Data Categories

We support the following data categories for each doctor:

1. Awards & Distinction
2. Qualifications
3. Additional Credentials
4. Professional Visits
5. Faculty & Guest Lectures
6. Conferences
7. Poster Presentations
8. Podium Presentations
9. Courses
10. Continued Medical Education (CMEs)
11. Publications
12. Executive & Management Experience
13. Affiliations & Memberships
14. Expertise

## How to Use the System

### Reading Doctor Data

To display information about doctors:

1. First, load the basic information from the CSV file.
2. If detailed information is needed (e.g., when viewing a specific doctor's profile), load the corresponding JSON file referenced in the `Details File Path` column.

Example code for loading data is available in `scripts/load_surgeon_details.js`.

### Updating Doctor Data

To add or update information for a doctor:

1. To update basic information, modify the appropriate rows in the CSV file.
2. To update detailed information (awards, qualifications, etc.), use the helper functions in `scripts/update_surgeon_details.js`.

Example usage:

```javascript
// Import the update functions
const { addItemToSection } = require('./scripts/update_surgeon_details');

// Add a new award
await addItemToSection(
  'naveen',
  'Awards & Distinction',
  'New Award Title - Organization - Date'
);

// Add a new qualification
await addItemToSection(
  'naveen',
  'Qualifications',
  'Degree - Institution - Year'
);
```

### Adding a New Doctor

To add a completely new doctor:

1. Add basic information rows to the CSV file with a unique `Surgeon Slug`.
2. Create a new JSON file in the `surgeon_details/` directory named `<slug>.json`.
3. You can use the `update_surgeon_details.js` script to easily create and populate the new JSON file.

## Frontend Display

When displaying doctor information on the frontend:

1. Always show the basic information loaded from the CSV.
2. For detailed sections, only display sections that have content in the JSON file.
3. This ensures that empty sections are not shown on the doctor's profile.

## Benefits of This Approach

1. **Scalability**: Easy to add new doctors without restructuring existing data.
2. **Maintainability**: Separate files make it easier to update information without disturbing other data.
3. **Performance**: Basic information can be loaded quickly for listings, with detailed information loaded only when needed.
4. **Flexibility**: The JSON structure easily accommodates lists of varying lengths.
5. **Organization**: Clear separation between basic and detailed information.

## Migration Notes

When migrating from the old system:

1. Create the new `surgeons_data_v2.csv` with the added `Details File Path` column.
2. Extract the detailed information from the original CSV and create JSON files for each doctor.
3. Update any code that loads doctor information to use the new hybrid approach.

## Technical Implementation

The implementation includes:

- CSV parsing and writing using Node.js
- JSON file handling with standard fs/path modules
- Helper functions for data management
- Example code demonstrating how to use the system

For full implementation details, see the helper scripts in the `scripts/` directory. 