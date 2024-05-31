import multer from "multer";
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage
export const upload = multer({ 
    storage
});

