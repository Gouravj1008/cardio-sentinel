// backend/server.js
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { connectRedis, getRedisClient } = require('./redis');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected to Neural Telemetry Stream');
  socket.on('disconnect', () => {
    console.log('Client disconnected from stream');
  });
});

// Lightweight Mock Telemetry Stream
setInterval(() => {
  const telemetryPoint = {
    time: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }),
    riskIndex: Math.floor(20 + Math.random() * 30),
    anomalyRate: Math.floor(Math.random() * 15),
  };
  io.emit('telemetry_update', telemetryPoint);
}, 3000);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cardio Sentinel API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConn = await connectDB();
  if (!dbConn) {
    throw new Error('MongoDB is not connected. Stopping backend startup.');
  }

  const redisClient = await connectRedis();
  if (redisClient) {
    try {
      await redisClient.set('health', 'cardio-ai');
      const value = await redisClient.get('health');
      console.log(`Redis Test Value: ${value}`);
    } catch (err) {
      console.log('Redis health test failed, continuing without cache');
    }
  } else {
    console.log('Redis not available, continuing without cache');
  }

  server.listen(PORT, () => {
    console.log(`Server & WebSocket running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error(`Startup failed: ${err.message}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  } else {
    console.log('Unhandled rejection in development - keeping server alive');
  }
});
