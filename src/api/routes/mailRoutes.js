
// routes/mailRoutes.js
import { Router } from 'express';
import sendMail from '../controllers/mailController.js';

const router = Router();

// Define the route to send mail
router.route('/mail').get(sendMail);

export default router;
