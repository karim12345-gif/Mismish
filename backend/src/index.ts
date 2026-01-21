import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import routes
import customerAuthRoutes from './routes/customer/authRoutes';
import vendorAuthRoutes from './routes/vendor/authRoutes';
import listingRoutes from './routes/customer/listingRoutes';
import orderRoutes from './routes/customer/orderRoutes';
import { errorHandler } from './api/shared/middlewares/errorHandler';

dotenv.config();

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});
const PORT = process.env.PORT || 3000;

const app = express();

// Security Headers
app.use(helmet());

// Body Parser
app.use(express.json());

// Request Logging
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(cors({
  origin: '*', // Allow all for development, restrict in production
}));

// Customer API Routes
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api/customer/listings', listingRoutes);
app.use('/api/customer/orders', orderRoutes);

// Vendor API Routes
app.use('/api/vendor/auth', vendorAuthRoutes);

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    // Test the connection via Prisma
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to PostgreSQL database');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();
