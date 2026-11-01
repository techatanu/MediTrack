import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import doctorRoutes from './routes/doctors.js';

const app = express();

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

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MediTrack Backend is running',
    timestamp: new Date().toISOString()
  });
});


app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MediTrack API is running',
    timestamp: new Date().toISOString()
  });
});


app.use((req, res) => {
  res.status(404).json({
    error: { message: 'Route not found' }
  });
});


// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  // Log the error type and stack frames only: messages can echo request data
  // (e.g. a duplicate-key error contains the email), and this is health data.
  console.error(
    `[${req.method} ${req.path}] ${err.name}${err.code ? ` (${err.code})` : ''} -> ${status}` +
      (status >= 500 && err.stack ? `\n${err.stack.split('\n').slice(1, 6).join('\n')}` : '')
  );

  res.status(status).json({
    error: { message: status < 500 && err.expose !== false ? err.message : 'Internal Server Error' }
  });
});

export default app;
