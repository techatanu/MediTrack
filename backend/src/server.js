import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import doctorRoutes from './routes/doctors.js';

const app = express();
const PORT = process.env.PORT || 5050;


connectDB();


const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


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


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});


app.use((req, res) => {
  res.status(404).json({
    error: { message: 'Route not found' }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS enabled for: ${frontendUrl}`);
});

export default app;