const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Generate a career guidance report for a user
router.post('/generate', async (req, res) => {
  try {
    const { userId, assessmentResultIds } = req.body;
    
    if (!userId || !assessmentResultIds || !Array.isArray(assessmentResultIds)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get assessment results
    const assessmentResults = [];
    for (const resultId of assessmentResultIds) {
      const resultDoc = await db.collection('assessment_results').doc(resultId).get();
      if (resultDoc.exists) {
        assessmentResults.push({
          id: resultDoc.id,
          ...resultDoc.data()
        });
      }
    }
    
    // Generate report
    const report = {
      userId,
      generatedAt: new Date().toISOString(),
      assessmentResults: assessmentResultIds,
      summary: generateSummary(assessmentResults),
      careerRecommendations: await generateCareerRecommendations(assessmentResults),
      skillGapAnalysis: generateSkillGapAnalysis(assessmentResults),
      learningPathways: await generateLearningPathways(assessmentResults),
      marketInsights: await generateMarketInsights(assessmentResults)
    };
    
    // Save report to database
    const reportRef = await db.collection('reports').add(report);
    
    res.status(201).json({ 
      message: 'Report generated successfully',
      reportId: reportRef.id
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get a specific report by ID
router.get('/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    const reportDoc = await db.collection('reports').doc(reportId).get();
    
    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = {
      id: reportDoc.id,
      ...reportDoc.data()
    };
    
    res.status(200).json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Get all reports for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const reportsSnapshot = await db.collection('reports')
      .where('userId', '==', userId)
      .orderBy('generatedAt', 'desc')
      .get();
    
    const reports = [];
    reportsSnapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ error: 'Failed to fetch user reports' });
  }
});

// Helper functions for report generation
function generateSummary(assessmentResults) {
  // Create a summary based on assessment results
  const summary = {
    personalityProfile: extractPersonalityProfile(assessmentResults),
    skillsOverview: extractSkillsOverview(assessmentResults),
    interestsOverview: extractInterestsOverview(assessmentResults),
    strengthsAndWeaknesses: identifyStrengthsAndWeaknesses(assessmentResults)
  };
  
  return summary;
}

async function generateCareerRecommendations(assessmentResults) {
  // Get top career matches based on assessment results
  const careerMatches = [];
  
  // Get all careers from database
  const careersSnapshot = await db.collection('careers').limit(50).get();
  const allCareers = [];
  
  careersSnapshot.forEach(doc => {
    allCareers.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  // Simple matching algorithm (in a real app, this would be more sophisticated)
  const personalityTraits = extractPersonalityProfile(assessmentResults);
  const skills = extractSkillsOverview(assessmentResults);
  const interests = extractInterestsOverview(assessmentResults);
  
  // Match careers based on personality, skills, and interests
  for (const career of allCareers) {
    let matchScore = 0;
    
    // Personality match
    if (career.personalityTraits) {
      for (const trait in personalityTraits) {
        if (career.personalityTraits.includes(trait)) {
          matchScore += 1;
        }
      }
    }
    
    // Skills match
    if (career.requiredSkills) {
      for (const skill in skills) {
        if (career.requiredSkills.includes(skill)) {
          matchScore += 2;
        }
      }
    }
    
    // Interests match
    if (career.interestAreas) {
      for (const interest in interests) {
        if (career.interestAreas.includes(interest)) {
          matchScore += 1.5;
        }
      }
    }
    
    if (matchScore > 0) {
      careerMatches.push({
        career: {
          id: career.id,
          title: career.title,
          description: career.description
        },
        matchScore,
        matchReason: generateMatchReason(career, personalityTraits, skills, interests)
      });
    }
  }
  
  // Sort by match score and return top 5
  return careerMatches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

function generateSkillGapAnalysis(assessmentResults) {
  // Identify skill gaps based on assessment results and career interests
  const currentSkills = extractSkillsOverview(assessmentResults);
  
  // Mock skill gaps (in a real app, this would compare against required skills for recommended careers)
  const skillGaps = {
    technical: ['Advanced data analysis', 'Cloud computing', 'Machine learning'],
    soft: ['Leadership', 'Public speaking', 'Negotiation'],
    industry: ['Industry-specific regulations', 'Market analysis', 'Competitive intelligence']
  };
  
  return {
    currentSkills,
    skillGaps,
    developmentPriorities: ['Leadership', 'Advanced data analysis', 'Cloud computing']
  };
}

async function generateLearningPathways(assessmentResults) {
  // Create learning pathways based on skill gaps and career goals
  const pathways = [
    {
      name: 'Technical Skills Development',
      description: 'Enhance your technical capabilities to meet industry demands',
      steps: [
        {
          title: 'Fundamentals',
          resources: [
            { type: 'course', title: 'Introduction to Data Analysis', provider: 'Coursera', url: 'https://example.com/course1' },
            { type: 'video', title: 'Cloud Computing Basics', provider: 'YouTube', url: 'https://example.com/video1' }
          ]
        },
        {
          title: 'Intermediate',
          resources: [
            { type: 'course', title: 'Advanced Data Analysis Techniques', provider: 'edX', url: 'https://example.com/course2' },
            { type: 'book', title: 'Cloud Architecture Patterns', author: 'John Smith', url: 'https://example.com/book1' }
          ]
        },
        {
          title: 'Advanced',
          resources: [
            { type: 'certification', title: 'Certified Data Analyst', provider: 'Data Science Association', url: 'https://example.com/cert1' },
            { type: 'project', title: 'Build a Cloud-Based Application', description: 'Hands-on project to apply your skills' }
          ]
        }
      ]
    },
    {
      name: 'Leadership Development',
      description: 'Build your leadership and management capabilities',
      steps: [
        {
          title: 'Fundamentals',
          resources: [
            { type: 'course', title: 'Leadership Essentials', provider: 'LinkedIn Learning', url: 'https://example.com/course3' },
            { type: 'book', title: 'The Leadership Challenge', author: 'James Kouzes', url: 'https://example.com/book2' }
          ]
        },
        {
          title: 'Intermediate',
          resources: [
            { type: 'workshop', title: 'Effective Team Management', provider: 'Management Institute', url: 'https://example.com/workshop1' },
            { type: 'video', title: 'Conflict Resolution Strategies', provider: 'YouTube', url: 'https://example.com/video2' }
          ]
        },
        {
          title: 'Advanced',
          resources: [
            { type: 'certification', title: 'Certified Project Manager', provider: 'PMI', url: 'https://example.com/cert2' },
            { type: 'mentorship', title: 'Leadership Mentorship Program', description: 'Connect with experienced leaders in your field' }
          ]
        }
      ]
    }
  ];
  
  return pathways;
}

async function generateMarketInsights(assessmentResults) {
  // Provide market insights for recommended careers
  const insights = {
    industryTrends: [
      { trend: 'Remote work adoption', impact: 'High', description: 'Increasing opportunities for remote positions across industries' },
      { trend: 'Automation and AI', impact: 'Medium', description: 'Growing need for workers who can collaborate with AI systems' },
      { trend: 'Sustainability focus', impact: 'Medium', description: 'Rising demand for professionals with sustainability expertise' }
    ],
    salaryData: {
      entryLevel: '$50,000 - $70,000',
      midLevel: '$70,000 - $100,000',
      seniorLevel: '$100,000 - $150,000',
      factors: ['Location', 'Industry', 'Company size', 'Experience level']
    },
    growthAreas: [
      { area: 'Data Science', growthRate: '22%', timeframe: '5 years' },
      { area: 'Cybersecurity', growthRate: '31%', timeframe: '5 years' },
      { area: 'Healthcare Technology', growthRate: '15%', timeframe: '5 years' }
    ]
  };
  
  return insights;
}

// Helper functions for data extraction
function extractPersonalityProfile(assessmentResults) {
  // Extract personality traits from assessment results
  const personalityResults = assessmentResults.find(result => 
    result.results && result.results.openness !== undefined
  );
  
  if (personalityResults) {
    return personalityResults.results;
  }
  
  // Default personality profile if not found
  return {
    openness: 0.5,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    neuroticism: 0.5
  };
}

function extractSkillsOverview(assessmentResults) {
  // Extract skills from assessment results
  const skillsResults = assessmentResults.find(result => 
    result.results && result.results.technical !== undefined
  );
  
  if (skillsResults) {
    return skillsResults.results;
  }
  
  // Default skills overview if not found
  return {
    technical: 0.5,
    communication: 0.5,
    leadership: 0.5,
    creativity: 0.5,
    analytical: 0.5
  };
}

function extractInterestsOverview(assessmentResults) {
  // Extract interests from assessment results
  const interestsResults = assessmentResults.find(result => 
    result.results && result.results.realistic !== undefined
  );
  
  if (interestsResults) {
    return interestsResults.results;
  }
  
  // Default interests overview if not found
  return {
    realistic: 0.5,
    investigative: 0.5,
    artistic: 0.5,
    social: 0.5,
    enterprising: 0.5,
    conventional: 0.5
  };
}

function identifyStrengthsAndWeaknesses(assessmentResults) {
  // Identify strengths and weaknesses based on assessment results
  const skills = extractSkillsOverview(assessmentResults);
  
  // Identify top 2 skills as strengths
  const strengths = Object.entries(skills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);
  
  // Identify bottom 2 skills as weaknesses
  const weaknesses = Object.entries(skills)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(entry => entry[0]);
  
  return { strengths, weaknesses };
}

function generateMatchReason(career, personalityTraits, skills, interests) {
  // Generate a reason for why this career matches the user's profile
  const reasons = [];
  
  // Check personality match
  if (career.personalityTraits) {
    for (const trait in personalityTraits) {
      if (career.personalityTraits.includes(trait)) {
        reasons.push(`Your ${trait} personality trait aligns well with this career`);
        break;
      }
    }
  }
  
  // Check skills match
  if (career.requiredSkills) {
    for (const skill in skills) {
      if (career.requiredSkills.includes(skill)) {
        reasons.push(`Your ${skill} skills are valuable in this field`);
        break;
      }
    }
  }
  
  // Check interests match
  if (career.interestAreas) {
    for (const interest in interests) {
      if (career.interestAreas.includes(interest)) {
        reasons.push(`Your interest in ${interest} activities matches this career`);
        break;
      }
    }
  }
  
  return reasons.join('. ');
}

module.exports = router;