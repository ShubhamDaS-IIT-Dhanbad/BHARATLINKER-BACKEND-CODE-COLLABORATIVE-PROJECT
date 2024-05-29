
import multer from "multer";
console.log("jiji")
const filePath = path.join(__dirname, 'public', 'temp', '51Zjp5fq1EL._SX679_.jpg');
console.log(filePath); // Outputs the absolute path to file.txt in the public/temp directory
const storage = multer.diskStorage({
  
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
console.log("jiji")
export const upload = multer({ 
    storage
});

