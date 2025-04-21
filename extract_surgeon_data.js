const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const htmlFilePath = path.join(__dirname, 'old_templates', 'naveen.html');
const csvFilePath = path.join(__dirname, 'surgeons_data.csv');

// Function to extract data
const extractData = (filePath) => {
    try {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(htmlContent);
        const records = [];

        // Extract surgeon slug from filename (adjust if naming convention differs)
        const surgeonSlug = path.basename(filePath, '.html');

        // Find relevant sections (adjust selector if structure varies)
        const sectionHeaders = $('.module.module-text .tb_text_wrap h2');

        sectionHeaders.each((index, headerElement) => {
            const sectionTitle = $(headerElement).text().trim();

            // Find the parent module-text div
            const moduleTextDiv = $(headerElement).closest('.module.module-text');

            // Find the next module-icon sibling
            const moduleIconDiv = moduleTextDiv.nextAll('.module.module-icon').first();


            if (moduleIconDiv.length > 0) {
                moduleIconDiv.find('.module-icon-item').each((i, itemElement) => {
                    const itemText = $(itemElement).find('span').text().trim();
                    if (itemText) {
                        records.push({
                            surgeon_slug: surgeonSlug,
                            section_title: sectionTitle, // Use the plain text title for CSV
                            item_text: itemText,
                        });
                    }
                });
            } else {
                 console.warn(`WARN: Could not find .module.module-icon after section "${sectionTitle}" in ${filePath}`);
            }
        });

        return records;

    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        return [];
    }
};

// Define CSV writer
const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        { id: 'surgeon_slug', title: 'Surgeon Slug' },
        { id: 'section_title', title: 'Section Title' },
        { id: 'item_text', title: 'Item Text' },
    ],
    append: false // Always overwrite for this script
});

// --- Main Execution ---
console.log(`Processing ${htmlFilePath}...`);
const extractedRecords = extractData(htmlFilePath);

if (extractedRecords.length > 0) {
    csvWriter.writeRecords(extractedRecords)
        .then(() => console.log(`Successfully wrote ${extractedRecords.length} records to ${csvFilePath}`))
        .catch(err => console.error(`Error writing to CSV ${csvFilePath}:`, err));
} else {
    console.log(`No relevant records found in ${htmlFilePath}.`);
}

// Add processing for other HTML files here if needed
// Example:
// const otherHtmlFiles = ['old_templates/other_surgeon.html', ...];
// otherHtmlFiles.forEach(file => {
//     const records = extractData(path.join(__dirname, file));
//     if (records.length > 0) {
//         csvWriter.writeRecords(records)
//             .then(() => console.log(`Successfully appended records from ${file} to ${csvFilePath}`))
//             .catch(err => console.error(`Error appending to CSV from ${file}:`, err));
//     }
// }); 