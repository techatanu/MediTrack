import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import doctorRoutes from './routes/doctors.js';

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB
connectDB();


app.use(cors({
  origin: '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});


app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/doctors', doctorRoutes);


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
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;