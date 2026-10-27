const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('./db/mysql');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Test MySQL Database Connection on Startup
mysql.testConnection().then(res => {
  if (res.success) {
    console.log('====================================================');
    console.log('🟢 REAL MYSQL DATABASE CONNECTED!');
    console.log(` Database: ${res.database} on ${res.host}:${res.port}`);
    console.log(` Server Time: ${res.currentTime}`);
    console.log('====================================================');
  } else {
    console.log('====================================================');
    console.log('⚠️  MySQL Database Notice:', res.error);
    console.log(' Operating in resilient database mode with cached records.');
    console.log(' Run `node server/db/migrate.js` once MySQL Server is active.');
    console.log('====================================================');
  }
}).catch(err => {
  console.warn('MySQL init note:', err.message);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads route for uploaded food images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const foodRoutes = require('./routes/foods');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Real Database Status API
app.get('/api/db/status', async (req, res) => {
  const result = await mysql.testConnection();
  res.json({
    ...mysql.getStatus(),
    testResult: result
  });
});

// System Health Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await mysql.testConnection();
  res.json({
    status: 'online',
    system: 'SVKM College Canteen Management System API',
    database: {
      type: 'MySQL Server (Relational Database)',
      connected: dbStatus.isConnected,
      host: dbStatus.host,
      port: dbStatus.port,
      database: dbStatus.database,
      error: dbStatus.error || null
    },
    timestamp: new Date().toISOString()
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `API route '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: err.message || 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  const status = mysql.getStatus();
  console.log(`====================================================`);
  console.log(` Campus Food Ordering System API Server Ready!`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Static Uploads: http://localhost:${PORT}/uploads/`);
  console.log(` Database: ${status.dbType} (${status.database})`);
  console.log(`====================================================`);
});
