const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Try to load PDF and DOCX parsers, with fallbacks
let pdfParse, mammoth;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse not available:', e.message);
}
try {
  mammoth = require('mammoth');
} catch (e) {
  console.warn('mammoth not available:', e.message);
}

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
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  }
});

// Extract text from uploaded file with multiple fallback methods
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let text = '';
  let error = null;
  let errors = [];

  // Try PDF extraction with pdf-parse
  if (ext === '.pdf') {
    if (pdfParse) {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        text = data.text || '';
        console.log('pdf-parse extracted:', text.substring(0, 100), '...');
        if (text.trim().length > 50) {
          return text;
        }
      } catch (e) {
        errors.push('pdf-parse: ' + e.message);
        console.error('PDF extraction error:', e.message);
      }
    } else {
      console.warn('pdf-parse not available, trying fallback methods');
    }
    
    // Try using pdf2json as another fallback
    try {
      const pdf2json = require('pdf2json');
      const pdfParser = new pdf2json(null, 1, false);
      const data = await new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataReady', resolve);
        pdfParser.on('pdfParser_error', reject);
        pdfParser.loadPDF(filePath);
      });
      
      if (data && data.formImage && data.formImage.Pages) {
        let fullText = '';
        data.formImage.Pages.forEach(page => {
          page.Texts.forEach(textItem => {
            textItem.R.forEach(r => {
              fullText += decodeURIComponent(r.T) + ' ';
            });
          });
        });
        if (fullText.trim().length > 50) {
          return fullText;
        }
      }
    } catch (e) {
      errors.push('pdf2json: ' + e.message);
      console.error('pdf2json error:', e.message);
    }
    
    // Try PDF.js as another fallback
    try {
      const pdfjsLib = require('pdfjs');
      const pdfjs = require('pdf-parse/node12');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfjs(dataBuffer);
      for (let i = 1; i <= data.numPages; i++) {
        const page = await data.getPage(i);
        const content = await page.getTextContent();
        content.items.forEach(item => {
          text += item.str + ' ';
        });
      }
      if (text.trim().length > 50) {
        return text;
      }
    } catch (e) {
      errors.push('pdfjs: ' + e.message);
      console.error('pdfjs error:', e.message);
    }
    
    // Try PDF as raw text as last resort
    try {
      text = fs.readFileSync(filePath, 'utf8');
      // Clean up binary content
      text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x80-\xFF]/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 100 && !text.includes('%PDF')) {
        console.log('Raw PDF extraction, length:', text.length);
        return text;
      }
    } catch (e) {
      errors.push('raw PDF: ' + e.message);
      console.error('PDF raw extraction error:', e.message);
    }
  }

  // Try DOCX extraction with mammoth
  if ((ext === '.docx' || ext === '.doc') && mammoth) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value || '';
      if (text.trim().length > 0) {
        return text;
      }
    } catch (e) {
      errors.push('mammoth: ' + e.message);
      console.error('DOCX extraction error:', e.message);
    }
  }

  // Try plain text
  if (ext === '.txt') {
    try {
      text = fs.readFileSync(filePath, 'utf8');
      if (text.trim().length > 0) {
        return text;
      }
    } catch (e) {
      errors.push('txt: ' + e.message);
      console.error('TXT extraction error:', e.message);
    }
  }

  console.error('All extraction methods failed. Errors:', errors);
  if (!text || text.trim().length === 0) {
    throw new Error(`Could not extract text from ${ext} file. Tried methods: ${errors.join(', ')}. Please try converting to a different format or copy-paste the text directly.`);
  }

  return text;
}

// Analyze resume with ML
async function analyzeResume(text) {
  try {
    const response = await axios.post('http://localhost:3000/api/ml/analyze-resume', {
      text: text.substring(0, 5000)
    }, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error.message);
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
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Could not delete temp file:', e.message);
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from file. Please try a different file format or paste text directly.' });
    }

    // Analyze with ML (non-blocking, we don't wait for this)
    analyzeResume(text).catch(e => console.warn('Background analysis error:', e));

    res.json({
      success: true,
      text: text,
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
      charCount: text.length
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process resume' });
  }
});

// Extract text from file only (used by ResumeAnalyzer)
router.post('/extract-text', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Show progress
    console.log(`Extracting text from ${ext} file: ${req.file.originalname}`);

    // Extract text from file
    const text = await extractText(filePath);

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Could not delete temp file:', e.message);
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Could not extract text from file',
        suggestion: 'Please try converting your file to a different format (PDF or TXT) or paste the text directly.'
      });
    }

    console.log(`Successfully extracted ${text.split(/\s+/).length} words from ${req.file.originalname}`);

    res.json({
      success: true,
      text: text,
      fileName: req.file.originalname,
      fileType: ext,
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
      charCount: text.length
    });

  } catch (error) {
    console.error('Text extraction error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to extract text from file',
      suggestion: 'Please try pasting the text directly or use a different file format.'
    });
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

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    pdfParser: !!pdfParse,
    docxParser: !!mammoth,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;