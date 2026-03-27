// backend/server.js
const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400
};

// Import routes
const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessments');
const careerRoutes = require('./routes/careers');
const jobsRoutes = require('./routes/jobs');
const resourcesRoutes = require('./routes/resources');
const reportsRoutes = require('./routes/reports');
const mlRoutes = require('./routes/ml');
const interviewRoutes = require('./routes/interviews');
const resumeRoutes = require('./routes/resume');
const atsRoutes = require('./routes/ats');
const chatbotRoutes = require('./routes/chatbot');

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Test API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Start server
app.get("/", (req, res) => {
  res.send("Career Guidance API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
