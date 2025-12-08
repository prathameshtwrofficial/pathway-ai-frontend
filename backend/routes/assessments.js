const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all assessment types
router.get('/', async (req, res) => {
  try {
    const assessmentsSnapshot = await db.collection('assessments').get();
    const assessments = [];
    
    assessmentsSnapshot.forEach(doc => {
      assessments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({ assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Get a specific assessment by ID
router.get('/:id', async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const assessmentDoc = await db.collection('assessments').doc(assessmentId).get();
    
    if (!assessmentDoc.exists) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const assessment = {
      id: assessmentDoc.id,
      ...assessmentDoc.data()
    };
    
    res.status(200).json({ assessment });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Submit assessment answers
router.post('/:id/submit', async (req, res) => {
  try {
    const { userId, answers } = req.body;
    const assessmentId = req.params.id;
    
    if (!userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid submission data' });
    }
    
    // Save user's assessment results
    const resultRef = await db.collection('assessment_results').add({
      userId,
      assessmentId,
      answers,
      completedAt: new Date().toISOString(),
    });
    
    // Calculate results based on the assessment type
    const assessmentDoc = await db.collection('assessments').doc(assessmentId).get();
    const assessmentType = assessmentDoc.data().type;
    
    let results = {};
    
    // Different calculation logic based on assessment type
    switch (assessmentType) {
      case 'personality':
        results = calculatePersonalityResults(answers);
        break;
      case 'skills':
        results = calculateSkillsResults(answers);
        break;
      case 'interests':
        results = calculateInterestsResults(answers);
        break;
      default:
        results = { score: calculateBasicScore(answers) };
    }
    
    // Update the result with calculated data
    await db.collection('assessment_results').doc(resultRef.id).update({
      results
    });
    
    res.status(201).json({ 
      message: 'Assessment submitted successfully',
      resultId: resultRef.id,
      results
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// Helper functions for calculating results
function calculateBasicScore(answers) {
  // Simple scoring mechanism
  return answers.reduce((score, answer) => score + (answer.value || 0), 0);
}

function calculatePersonalityResults(answers) {
  // Simplified personality assessment calculation
  const traits = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0
  };
  
  // Map answers to traits
  answers.forEach(answer => {
    if (answer.trait && traits.hasOwnProperty(answer.trait)) {
      traits[answer.trait] += answer.value;
    }
  });
  
  return traits;
}

function calculateSkillsResults(answers) {
  // Group skills by category
  const skillCategories = {
    technical: 0,
    communication: 0,
    leadership: 0,
    creativity: 0,
    analytical: 0
  };
  
  answers.forEach(answer => {
    if (answer.category && skillCategories.hasOwnProperty(answer.category)) {
      skillCategories[answer.category] += answer.value;
    }
  });
  
  return skillCategories;
}

function calculateInterestsResults(answers) {
  // Based on Holland Code (RIASEC)
  const interests = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0
  };
  
  answers.forEach(answer => {
    if (answer.interest && interests.hasOwnProperty(answer.interest)) {
      interests[answer.interest] += answer.value;
    }
  });
  
  return interests;
}

module.exports = router;