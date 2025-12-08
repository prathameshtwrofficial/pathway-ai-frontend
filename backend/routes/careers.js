const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get career recommendations based on assessment results
router.get('/recommendations', async (req, res) => {
  try {
    const { userId, assessmentResultId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    let recommendations = [];
    
    // If assessment result ID is provided, use it for personalized recommendations
    if (assessmentResultId) {
      const resultDoc = await db.collection('assessment_results').doc(assessmentResultId).get();
      
      if (!resultDoc.exists) {
        return res.status(404).json({ error: 'Assessment result not found' });
      }
      
      const resultData = resultDoc.data();
      recommendations = await generateRecommendationsFromResults(resultData);
    } else {
      // Get user's latest assessment results
      const resultsSnapshot = await db.collection('assessment_results')
        .where('userId', '==', userId)
        .orderBy('completedAt', 'desc')
        .limit(1)
        .get();
      
      if (resultsSnapshot.empty) {
        // If no assessment results, provide general recommendations
        recommendations = await getGeneralRecommendations();
      } else {
        const resultData = resultsSnapshot.docs[0].data();
        recommendations = await generateRecommendationsFromResults(resultData);
      }
    }
    
    res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Error getting career recommendations:', error);
    res.status(500).json({ error: 'Failed to get career recommendations' });
  }
});

// Get career details by ID
router.get('/:id', async (req, res) => {
  try {
    const careerId = req.params.id;
    const careerDoc = await db.collection('careers').doc(careerId).get();
    
    if (!careerDoc.exists) {
      return res.status(404).json({ error: 'Career not found' });
    }
    
    const career = {
      id: careerDoc.id,
      ...careerDoc.data()
    };
    
    res.status(200).json({ career });
  } catch (error) {
    console.error('Error fetching career details:', error);
    res.status(500).json({ error: 'Failed to fetch career details' });
  }
});

// Get learning resources for a specific career
router.get('/:id/resources', async (req, res) => {
  try {
    const careerId = req.params.id;
    
    // Get resources related to this career
    const resourcesSnapshot = await db.collection('resources')
      .where('careerIds', 'array-contains', careerId)
      .get();
    
    const resources = [];
    resourcesSnapshot.forEach(doc => {
      resources.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({ resources });
  } catch (error) {
    console.error('Error fetching career resources:', error);
    res.status(500).json({ error: 'Failed to fetch career resources' });
  }
});

// Helper functions
async function generateRecommendationsFromResults(resultData) {
  const { results, assessmentId } = resultData;
  
  // Get assessment type
  const assessmentDoc = await db.collection('assessments').doc(assessmentId).get();
  const assessmentType = assessmentDoc.data().type;
  
  // Get careers from database
  const careersSnapshot = await db.collection('careers').get();
  const allCareers = [];
  
  careersSnapshot.forEach(doc => {
    allCareers.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  // Match careers based on assessment type and results
  let matchedCareers = [];
  
  switch (assessmentType) {
    case 'personality':
      matchedCareers = matchPersonalityToCareers(results, allCareers);
      break;
    case 'skills':
      matchedCareers = matchSkillsToCareers(results, allCareers);
      break;
    case 'interests':
      matchedCareers = matchInterestsToCareers(results, allCareers);
      break;
    default:
      // Basic matching for other assessment types
      matchedCareers = allCareers.slice(0, 5); // Just return top 5 careers
  }
  
  return matchedCareers;
}

function matchPersonalityToCareers(personalityResults, careers) {
  // Find top personality traits
  const sortedTraits = Object.entries(personalityResults)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);
  
  // Match careers that align with top personality traits
  return careers
    .filter(career => {
      const matchCount = career.personalityTraits?.filter(trait => 
        sortedTraits.includes(trait)
      ).length || 0;
      
      return matchCount > 0;
    })
    .sort((a, b) => {
      const aMatch = a.personalityTraits?.filter(trait => 
        sortedTraits.includes(trait)
      ).length || 0;
      
      const bMatch = b.personalityTraits?.filter(trait => 
        sortedTraits.includes(trait)
      ).length || 0;
      
      return bMatch - aMatch;
    })
    .slice(0, 10);
}

function matchSkillsToCareers(skillResults, careers) {
  // Find top skill categories
  const sortedSkills = Object.entries(skillResults)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);
  
  // Match careers that require these skills
  return careers
    .filter(career => {
      const matchCount = career.requiredSkills?.filter(skill => 
        sortedSkills.includes(skill)
      ).length || 0;
      
      return matchCount > 0;
    })
    .sort((a, b) => {
      const aMatch = a.requiredSkills?.filter(skill => 
        sortedSkills.includes(skill)
      ).length || 0;
      
      const bMatch = b.requiredSkills?.filter(skill => 
        sortedSkills.includes(skill)
      ).length || 0;
      
      return bMatch - aMatch;
    })
    .slice(0, 10);
}

function matchInterestsToCareers(interestResults, careers) {
  // Find top interests (RIASEC)
  const sortedInterests = Object.entries(interestResults)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);
  
  // Match careers that align with these interests
  return careers
    .filter(career => {
      const matchCount = career.interestAreas?.filter(interest => 
        sortedInterests.includes(interest)
      ).length || 0;
      
      return matchCount > 0;
    })
    .sort((a, b) => {
      const aMatch = a.interestAreas?.filter(interest => 
        sortedInterests.includes(interest)
      ).length || 0;
      
      const bMatch = b.interestAreas?.filter(interest => 
        sortedInterests.includes(interest)
      ).length || 0;
      
      return bMatch - aMatch;
    })
    .slice(0, 10);
}

async function getGeneralRecommendations() {
  // Get popular or trending careers
  const careersSnapshot = await db.collection('careers')
    .orderBy('popularity', 'desc')
    .limit(10)
    .get();
  
  const recommendations = [];
  careersSnapshot.forEach(doc => {
    recommendations.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return recommendations;
}

module.exports = router;