import { env } from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';

await connectDB();

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`CORS enabled for: ${env.FRONTEND_URL || 'http://localhost:5173'}`);
});
