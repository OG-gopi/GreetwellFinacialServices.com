import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { CONFIG } from './config';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(CONFIG.UPLOAD_DIR));

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Centralized error handler
app.use(errorHandler);

export default app;
