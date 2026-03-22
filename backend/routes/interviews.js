const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load interview questions
const questionsPath = path.join(__dirname, '../data/interviewQuestions.json');
let interviewQuestions = {};

try {
  const data = fs.readFileSync(questionsPath, 'utf8');
  interviewQuestions = JSON.parse(data);
} catch (error) {
  console.error('Error loading interview questions:', error);
}

// Get questions for a specific role
router.get('/questions/:role', (req, res) => {
  try {
    const role = req.params.role.toLowerCase();
    const type = req.query.type; // 'technical' or 'behavioral'

    if (!interviewQuestions[role]) {
      return res.status(404).json({ error: 'Questions not found for this role' });
    }

    let questions = interviewQuestions[role];

    if (type && (type === 'technical' || type === 'behavioral')) {
      questions = { [type]: questions[type] };
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get all available roles
router.get('/roles', (req, res) => {
  try {
    const roles = Object.keys(interviewQuestions);
    res.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get random questions for practice
router.get('/practice/:role', (req, res) => {
  try {
    const role = req.params.role.toLowerCase();
    const count = parseInt(req.query.count) || 5;

    if (!interviewQuestions[role]) {
      return res.status(404).json({ error: 'Questions not found for this role' });
    }

    const allQuestions = [
      ...interviewQuestions[role].technical,
      ...interviewQuestions[role].behavioral
    ];

    // Shuffle and select random questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(count, allQuestions.length));

    res.json({ questions: selectedQuestions });
  } catch (error) {
    console.error('Error fetching practice questions:', error);
    res.status(500).json({ error: 'Failed to fetch practice questions' });
  }
});

module.exports = router;