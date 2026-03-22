const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Extract text from uploaded file
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (ext === '.txt') {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from file');
  }
}

// Analyze resume with ML
async function analyzeResume(text) {
  try {
    const response = await axios.post('http://localhost:3000/api/ml/analyze-resume', {
      text: text.substring(0, 5000) // Limit text length
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      skills: ['Analysis unavailable'],
      summary: 'Resume analysis is currently unavailable. Please try again later.',
      entities: []
    };
  }
}

// Upload and analyze resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // Extract text from file
    const text = await extractText(filePath);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    // Analyze with ML
    const analysis = await analyzeResume(text);

    res.json({
      success: true,
      text: text.substring(0, 1000) + (text.length > 1000 ? '...' : ''), // Preview
      analysis,
      wordCount: text.split(/\s+/).length
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process resume' });
  }
});

// Analyze resume text directly (for manual input)
router.post('/analyze-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const analysis = await analyzeResume(text);

    res.json({
      success: true,
      analysis,
      wordCount: text.split(/\s+/).length
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

module.exports = router;