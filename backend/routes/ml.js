const express = require('express');
const router = express.Router();
const axios = require('axios');

// Hugging Face Inference API endpoint
const HF_API_URL = 'https://api-inference.huggingface.co/models';

// Models to use
const MODELS = {
  NER: 'dbmdz/bert-large-cased-finetuned-conll03-english', // Named Entity Recognition
  TEXT_CLASSIFICATION: 'cardiffnlp/twitter-roberta-base-sentiment-latest', // For sentiment analysis
  TEXT_GENERATION: 'microsoft/DialoGPT-medium', // For question generation
  SUMMARIZATION: 'facebook/bart-large-cnn' // For resume summarization
};

// Helper function to call Hugging Face API
async function callHuggingFaceAPI(model, inputs, token = null) {
  try {
    const response = await axios.post(`${HF_API_URL}/${model}`, {
      inputs,
      options: { wait_for_model: true }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    return response.data;
  } catch (error) {
    console.error('Hugging Face API error:', error.response?.data || error.message);
    throw new Error('ML service temporarily unavailable');
  }
}

// Extract skills and entities from resume text
router.post('/analyze-resume', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    // Use NER model to extract entities
    const nerResult = await callHuggingFaceAPI(MODELS.NER, text);

    // Extract skills (simplified - in reality would need custom model)
    const skills = extractSkillsFromText(text);

    // Summarize resume
    const summaryResult = await callHuggingFaceAPI(MODELS.SUMMARIZATION, text);

    res.json({
      entities: nerResult,
      skills,
      summary: summaryResult[0]?.summary_text || 'Summary not available'
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// Generate interview questions based on role
router.post('/generate-questions', async (req, res) => {
  try {
    const { role, skills } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const prompt = `Generate 5 professional interview questions for a ${role} position. Focus on technical skills, experience, and behavioral questions. Questions should be appropriate for mid-level candidates.`;

    const generationResult = await callHuggingFaceAPI(MODELS.TEXT_GENERATION, prompt);

    // Parse generated text into questions
    const questions = parseGeneratedQuestions(generationResult);

    res.json({ questions });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// Career recommendations based on skills and interests
router.post('/career-recommendations', async (req, res) => {
  try {
    const { skills, interests, experience } = req.body;

    // This would use a more sophisticated model in production
    // For now, use simple matching
    const recommendations = generateCareerRecommendations(skills, interests, experience);

    res.json({ recommendations });
  } catch (error) {
    console.error('Career recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Helper functions
function extractSkillsFromText(text) {
  // Simple keyword extraction - in production, use ML model
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
    'kubernetes', 'machine learning', 'data analysis', 'project management',
    'leadership', 'communication', 'problem solving'
  ];

  const foundSkills = [];
  const lowerText = text.toLowerCase();

  skillKeywords.forEach(skill => {
    if (lowerText.includes(skill)) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}

function parseGeneratedQuestions(generationResult) {
  // Parse the generated text into individual questions
  const text = generationResult[0]?.generated_text || '';
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  // Extract questions (assuming they start with numbers or bullets)
  const questions = lines
    .filter(line => /^\d+\.|^- /.test(line))
    .map(line => line.replace(/^\d+\.\s*|^-\s*/, '').trim())
    .slice(0, 5); // Limit to 5 questions

  return questions.length > 0 ? questions : ['Tell me about your experience in this field.'];
}

function generateCareerRecommendations(skills, interests, experience) {
  // Simplified recommendation logic
  const recommendations = [];

  if (skills.includes('javascript') || skills.includes('react')) {
    recommendations.push({
      title: 'Frontend Developer',
      match: 85,
      reason: 'Strong match based on JavaScript and React skills'
    });
  }

  if (skills.includes('python') || skills.includes('machine learning')) {
    recommendations.push({
      title: 'Data Scientist',
      match: 80,
      reason: 'Good fit with Python and ML experience'
    });
  }

  if (skills.includes('project management') || skills.includes('leadership')) {
    recommendations.push({
      title: 'Project Manager',
      match: 75,
      reason: 'Management and leadership skills align well'
    });
  }

  // Add more logic based on interests and experience
  return recommendations.slice(0, 3);
}

module.exports = router;