import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';

// Define the directory for file uploads using __dirname
const tempDir = path.join(/public/temp, '../../public/temp');

// Ensure the directory exists
fs.ensureDirSync(tempDir);

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });
