import fs from 'fs';
import multer from 'multer';
import path from 'path';

const tempDir = path.join(__dirname, '../../../public/temp');

// Ensure the directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });

// Example route handler
app.post('/api/v1/product/addproduct', upload.single('file'), (req, res) => {
    const filePath = path.join(tempDir, req.file.filename);

    // Process the file (e.g., save file path to database)
    // Assuming the process is synchronous for simplicity
    try {
        // Simulating a file processing task
        console.log('File uploaded and saved:', filePath);

        // Respond to the client
        res.status(200).json({ message: 'File uploaded successfully', filePath });

        // Delete the file after processing if necessary
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Failed to delete file:', err);
            } else {
                console.log('File deleted successfully:', filePath);
            }
        });
    } catch (error) {
        // Handle error
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Error processing file' });

        // Optionally delete the file in case of error
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Failed to delete file:', err);
            } else {
                console.log('File deleted successfully:', filePath);
            }
        });
    }
});
