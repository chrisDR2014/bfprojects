import express from 'express';
import { exec } from 'child_process';
import os from 'os';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { handleUpload } from './autoSortPendingPuroClaims/uploadHandler.js'; // Import the upload handler


const app = express();
app.use(express.json());

dotenv.config();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(`Directory Path: ${__dirname} `)

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'frontend', 'public')));
app.use('/autoSortPendingPuroClaims', express.static(path.join(__dirname, 'autoSortPendingPuroClaims')));

// Helper function to read files
const readFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
const headerPath = path.join(__dirname, 'frontend', 'views', 'header.html');
const footerPath = path.join(__dirname, 'frontend', 'views', 'footer.html');
const header = await readFile(headerPath);
const footer = await readFile(footerPath);

// Route for the home page
app.get('/', async (req, res) => {
    try {

        const mainContentPath = path.join(__dirname, 'frontend', 'public', 'html', 'index.html');
        const mainContent = await readFile(mainContentPath);

        res.send(header + mainContent + footer);
    } catch (error) {
        console.error('Error loading page:', error); // Log the error
        res.status(500).send('Error loading page');
    }
});

// Route for Project 1
app.get('/autoSortPendingPuroClaims', async (req, res) => {
    try {
        const projectContentPath = path.join(__dirname, 'autoSortPendingPuroClaims', 'project1.html');
        const projectContent = await readFile(projectContentPath);
        res.send(header + projectContent + footer);
    } catch (error) {
        console.error('Error loading page:', error);
        res.status(500).send('Error loading Project 1 page');
    }
});

// Use the separated upload handler route
app.post('/autoSortPendingPuroClaims', express.json(), handleUpload);  // Use the uploadHandler for the '/upload' route


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});