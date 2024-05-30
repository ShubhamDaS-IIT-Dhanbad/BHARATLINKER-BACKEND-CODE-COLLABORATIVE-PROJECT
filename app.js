import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(helmet());

const allowedOrigins = [
  'https://www.bharatlinker.shop', 
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Include credentials such as cookies, authorization headers, etc.
};

app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Routes import
import userRouter from './src/api/routes/userRoutes.js';
import retailerRouter from './src/api/routes/retailerRoutes.js';
import productRouter from './src/api/routes/productRoutes.js';
import shopRouter from './src/api/routes/shopRoutes.js';
import mailRouter from './src/api/routes/mailRoutes.js';

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1/account', userRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/retailer', retailerRouter);
app.use('/api/v1/shop', shopRouter);
app.use('/api/v1/otp', mailRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export { app };
