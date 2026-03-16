import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import memberRoutes from './routes/members.js';
import messageRoutes from './routes/messages.js';

dotenv.config();
connectDB();

const app = express();

// ✅ Allow Localhost + Live Netlify
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://chruch-grafam20.netlify.app'
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GRAFAM API is running',
    church: 'Grace Faith Mission (GRAFAM) Soppo'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GRAFAM Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default app;