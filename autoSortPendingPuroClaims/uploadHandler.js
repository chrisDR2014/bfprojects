import { google } from 'googleapis';
import { uploadToMongoDB } from './helperFunctions/mongoDBHelpers.js'; // MongoDB helper functions
import { copyFirstSheetHeader, createNewSheetWithData } from './helperFunctions/googleSheetHelpers.js'; // Google Sheets helper functions

// Setup Google API authentication
const auth = new google.auth.GoogleAuth({
    keyFile: './project1/rainloop_creds.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

const sheets = google.sheets({ version: 'v4', auth });

// Handle file upload POST request
export const handleUpload = async (req, res) => {
    const { sheetName, data } = req.body;

    console.log('Incoming sheetName:', sheetName);
    console.log('Incoming data:', data);

    // Check if data is undefined or null
    if (!data) {
        return res.status(400).send('Data is required.');  // Respond with an error
    }

    // Split the input data by lines and process
    const lines = data.split('\n').map(line => line.trim());
    let currentBusiness = null;
    const results = [];

    lines.forEach(line => {
        if (isNaN(line) && !line.includes('🔍')) {
            // Treat non-numeric lines (that are not search symbols) as business names
            currentBusiness = line;
        } else if (!isNaN(line)) {
            // Treat numeric lines as tracking numbers and pair them with the current business
            if (currentBusiness) {
                results.push([currentBusiness, line]);  // Pair business and tracking number
            }
        }
    });

    try {
        const spreadsheetId = process.env.SPREADSHEET_ID;  // Replace with your Google Sheets ID

        // Copy the header row from the first sheet
        const headerRow = await copyFirstSheetHeader(sheets, spreadsheetId);

        // Create a new sheet and write the header and business-tracking data
        await createNewSheetWithData(sheets, spreadsheetId, sheetName, headerRow, results);

        const businesses = results.map(result => result[0]);
        const trackingNumbers = results.map(result => result[1]);

        // Upload data to MongoDB
        await uploadToMongoDB(businesses, trackingNumbers);

        res.sendStatus(200);  // Respond with success
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send('Error processing data.');
    }
};