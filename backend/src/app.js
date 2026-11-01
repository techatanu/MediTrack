import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import doctorRoutes from './routes/doctors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Defence in depth against query-operator injection: any `$`-key object reaching a
// filter is treated as a literal value unless wrapped in mongoose.trusted().
mongoose.set('sanitizeFilter', true);

const app = express();
app.set('trust proxy', env.TRUST_PROXY);

const allowedOrigins = new Set(['http://localhost:5173', env.FRONTEND_URL].filter(Boolean));
const previewOrigin = new RegExp(env.CORS_PREVIEW_ORIGIN_REGEX);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Requests without an Origin (curl, server-to-server) aren't subject to CORS.
    if (!origin || allowedOrigins.has(origin) || previewOrigin.test(origin)) {
      return callback(null, true);
    }
    console.warn('Blocked by CORS:', origin);
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));


app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/doctors', doctorRoutes);

const health = (req, res) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
};
app.get('/', health);
app.get('/api/health', health);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
