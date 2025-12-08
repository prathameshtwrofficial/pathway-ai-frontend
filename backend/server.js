// backend/server.js
const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessments');
const careerRoutes = require('./routes/careers');
const jobsRoutes = require('./routes/jobs');
const resourcesRoutes = require('./routes/resources');
const reportsRoutes = require('./routes/reports');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/reports', reportsRoutes);

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
