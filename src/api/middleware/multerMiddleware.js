
import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp'); // Destination folder for storing uploaded files
    },
    filename: function (req, file, cb) {
        // Ensure unique filenames by adding a timestamp prefix
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Original filename with timestamp prefix
    }
});
export const upload = multer({ storage: storage });
