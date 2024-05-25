import dotenv from 'dotenv';
import connectDB from "./src/config/db.js";
import { app } from './app.js';

dotenv.config({
    path: './.env'
});

const port = process.env.PORT || 12000; // Default port 12000 if PORT environment variable is not provided

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at port: ${port}`);
    });
}).catch((err) => {
    console.log("MongoDB connection failed:", err);
});
