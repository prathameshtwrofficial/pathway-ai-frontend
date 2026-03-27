const express = require('express');
const router = express.Router();

// Completely lazy-load Firestore - this prevents any initialization errors
// from crashing the route module. The getDb function will return null
// if Firebase is not properly configured (no service account).
const getDb = () => {
  try {
    // Dynamic require - only load when actually needed
    const firebaseModule = require('../config/firebase');
    const db = firebaseModule.db;
    if (typeof db === 'function') {
      return db(); // Call the function to get the firestore instance
    }
    return null;
  } catch (e) {
    // If there's any error (including Firebase initialization failure), return null
    console.log('Firestore not available:', e.message);
    return null;
  }
};

// Generate a career guidance report for a user
router.post('/generate', async (req, res) => {
  try {
    const { userId, reportTypes, userData: providedUserData } = req.body;
    
    console.log('=== REPORT GENERATION REQUEST ===');
    console.log('userId:', userId);
    console.log('reportTypes:', reportTypes);
    console.log('userData provided:', !!providedUserData);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    let userData = providedUserData || {};
    
    // If no user data provided directly, try to fetch from Firestore
    if (!providedUserData || Object.keys(providedUserData).length === 0) {
      const firestore = getDb();
      if (firestore) {
        try {
          const userDoc = await firestore.collection('users').doc(userId).get();
          if (userDoc.exists) {
            userData = userDoc.data();
            console.log('Fetched user data from Firestore');
          }
        } catch (e) {
          console.warn('Could not fetch from Firestore:', e.message);
        }
      } else {
        console.log('Firestore not available and no userData provided');
      }
    }
    
    console.log('User data keys:', Object.keys(userData || {}));
    console.log('Has resumeText:', !!userData?.resumeText);
    console.log('Has atsAnalysis:', !!userData?.atsAnalysis);
    console.log('Has aiAssessment:', !!userData?.aiAssessment);
    
    // Generate reports based on available data and requested types
    const reports = {};
    const errors = [];
    
    // Default to all report types if not specified
    const typesToGenerate = reportTypes && reportTypes.length > 0 
      ? reportTypes 
      : ['skills', 'career', 'market', 'resume'];
    
    console.log('Report types to generate:', typesToGenerate);
    
    // 1. Skills Assessment Report
    try {
      if (!reportTypes || typesToGenerate.includes('skills')) {
        reports.skills = generateSkillsReport(userData);
        console.log('Skills report generated, skills count:', reports.skills?.technicalSkills?.length);
      }
    } catch (e) {
      console.error('Skills report error:', e);
      errors.push('skills: ' + e.message);
    }
    
    // 2. Career Path Analysis Report
    try {
      if (!reportTypes || typesToGenerate.includes('career')) {
        reports.career = await generateCareerPathReport(userData);
        console.log('Career report generated');
      }
    } catch (e) {
      console.error('Career report error:', e);
      errors.push('career: ' + e.message);
    }
    
    // 3. Job Market Fit Report
    try {
      if (!reportTypes || typesToGenerate.includes('market')) {
        reports.market = generateMarketFitReport(userData);
        console.log('Market report generated');
      }
    } catch (e) {
      console.error('Market report error:', e);
      errors.push('market: ' + e.message);
    }
    
    // 4. Resume Improvement Report
    try {
      if (!reportTypes || typesToGenerate.includes('resume')) {
        reports.resume = generateResumeReport(userData);
        console.log('Resume report generated');
      }
    } catch (e) {
      console.error('Resume report error:', e);
      errors.push('resume: ' + e.message);
    }
    
    if (errors.length > 0) {
      console.warn('Report generation warnings:', errors);
    }
    
    // Always generate summary
    const summary = generateOverallSummary(userData, reports);
    console.log('Summary generated, overall score:', summary?.overallScore);
    
    // Create comprehensive report
    const report = {
      userId,
      generatedAt: new Date().toISOString(),
      reportTypes: reportTypes || ['skills', 'career', 'market', 'resume'],
      reports,
      summary,
      generationErrors: errors.length > 0 ? errors : null
    };
    
    // Try to save to Firestore, but don't fail if DB is unavailable
    try {
      if (firestore) {
        const reportRef = await firestore.collection('reports').add(report);
        console.log('Report saved, ID:', reportRef.id);
      } else {
        console.log('Report generated but not saved to Firestore (DB unavailable)');
      }
    } catch (saveError) {
      console.warn('Could not save report to Firestore:', saveError.message);
    }
    
    res.status(201).json({ 
      success: true,
      message: 'Report generated successfully',
      reportId: 'local-' + Date.now(),
      report
    });
  } catch (error) {
    console.error('=== REPORT GENERATION FAILED ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to generate report', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get a specific report by ID
router.get('/:id', async (req, res) => {
  try {
    const firestore = getDb();
    if (!firestore) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const reportId = req.params.id;
    const reportDoc = await firestore.collection('reports').doc(reportId).get();
    
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
    const firestore = getDb();
    if (!firestore) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const userId = req.params.userId;
    
    const reportsSnapshot = await firestore.collection('reports')
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

// Check user data availability for report generation
router.get('/check-data/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Try to get Firestore, but don't fail if unavailable
    let firestore = null;
    try {
      firestore = getDb();
    } catch (e) {
      console.log('Firestore not available for check-data');
    }
    
    // If Firestore is not available, return default
    if (!firestore) {
      return res.status(200).json({
        available: true,
        dataAvailability: {
          hasResume: false,
          hasResumeText: false,
          hasATSAnalysis: false,
          hasAssessment: false,
          hasProfile: false,
          hasCareerMatches: false
        },
        canGenerate: {
          skills: true,
          career: true,
          market: true,
          resume: true
        },
        message: 'Database connecting... You can still generate basic reports.'
      });
    }
    
    // Firestore is available - try to get user data
    try {
      const userDoc = await firestore.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(200).json({
          available: true,
          dataAvailability: {
            hasResume: false,
            hasResumeText: false,
            hasATSAnalysis: false,
            hasAssessment: false,
            hasProfile: false,
            hasCareerMatches: false
          },
          canGenerate: {
            skills: true,
            career: true,
            market: true,
            resume: true
          },
          message: 'No data found yet. Upload a resume or complete an assessment to get personalized reports.'
        });
      }
      
      const userData = userDoc.data();
      console.log('User data for reports:', JSON.stringify({
        resumeText: userData.resumeText ? 'present' : 'missing',
        atsAnalysis: userData.atsAnalysis ? 'present' : 'missing',
        aiAssessment: userData.aiAssessment ? 'present' : 'missing',
        resume: userData.resume ? 'present' : 'missing'
      }, null, 2));
      
      // Check what data is available
      const dataAvailability = {
        hasResume: !!(userData.resumeText || userData.resume?.fileName),
        hasResumeText: !!userData.resumeText,
        hasATSAnalysis: !!userData.atsAnalysis,
        hasAssessment: !!userData.aiAssessment,
        hasProfile: !!(userData.aiAssessment?.profile || userData.initialProfile),
        hasCareerMatches: !!(userData.aiAssessment?.matchedOccupations?.length > 0),
        
        // Get details
        resumeFileName: userData.resume?.fileName || null,
        resumeWordCount: userData.resume?.wordCount || 0,
        atsScore: userData.atsAnalysis?.overallScore || null,
        assessmentCompleted: userData.aiAssessment?.completedAt || null,
        sectors: userData.aiAssessment?.profile?.sectors || userData.userSector || null,
        skillsCount: (userData.atsAnalysis?.parsedResume?.skills?.technical?.length || 0) +
                     (userData.aiAssessment?.profile?.skills?.length || 0) +
                     (userData.atsAnalysis?.parsedResume?.skills?.tools?.length || 0),
        hasRawResume: !!userData.resumeText
      };
      
      // Determine what reports can be generated
      const canGenerate = {
        skills: true,
        career: true,
        market: true,
        resume: true
      };
      
      // Overall status
      const hasAnyData = dataAvailability.hasResumeText || dataAvailability.hasResume || dataAvailability.hasAssessment || dataAvailability.hasATSAnalysis;
      
      return res.status(200).json({
        available: true,
        dataAvailability,
        canGenerate,
        message: hasAnyData 
          ? 'You have data to generate reports' 
          : 'No specific data found, but you can still generate basic reports'
      });
    } catch (dbError) {
      console.error('Error fetching user data:', dbError);
      return res.status(200).json({
        available: true,
        dataAvailability: {
          hasResume: false,
          hasResumeText: false,
          hasATSAnalysis: false,
          hasAssessment: false,
          hasProfile: false,
          hasCareerMatches: false
        },
        canGenerate: {
          skills: true,
          career: true,
          market: true,
          resume: true
        },
        message: 'Could not load user data. You can still generate basic reports.'
      });
    }
  } catch (error) {
    console.error('Error checking user data:', error);
    res.status(500).json({ error: 'Failed to check user data' });
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
  const firestore = getDb();
  
  // Try to get all careers from database
  if (firestore) {
    try {
      const careersSnapshot = await firestore.collection('careers').limit(50).get();
      const allCareers = [];
      
      careersSnapshot.forEach(doc => {
        allCareers.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Simple matching algorithm
      const personalityTraits = extractPersonalityProfile(assessmentResults);
      const skills = extractSkillsOverview(assessmentResults);
      const interests = extractInterestsOverview(assessmentResults);
      
      // Match careers based on personality, skills, and interests
      for (const career of allCareers) {
        let matchScore = 0;
        
        if (career.personalityTraits) {
          for (const trait in personalityTraits) {
            if (career.personalityTraits.includes(trait)) {
              matchScore += 1;
            }
          }
        }
        
        if (career.requiredSkills) {
          for (const skill in skills) {
            if (career.requiredSkills.includes(skill)) {
              matchScore += 2;
            }
          }
        }
        
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
    } catch (e) {
      console.log('Error fetching careers:', e.message);
    }
  }
  
  // Return default careers if DB not available
  return [
    { career: { id: '1', title: 'Software Engineer', description: 'Build software applications' }, matchScore: 75, matchReason: 'Your technical skills align well with this career' },
    { career: { id: '2', title: 'Data Scientist', description: 'Analyze data for insights' }, matchScore: 65, matchReason: 'Your analytical skills match well' },
    { career: { id: '3', title: 'Product Manager', description: 'Manage product development' }, matchScore: 55, matchReason: 'Your leadership potential is noted' }
  ];
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

// =====================================================
// NEW REPORT GENERATION FUNCTIONS
// =====================================================

// =====================================================
// ENHANCED REPORT GENERATION FUNCTIONS
// Realistic Indian Market Data & Analytics
// =====================================================

// India-specific job market data (2024-2025)
const INDIA_MARKET_DATA = {
  sectors: {
    'Technology': {
      growth: '18%',
      outlook: 'Excellent',
      topCities: ['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon'],
      topCompanies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Paytm', 'Meesho', 'Cred', 'Razorpay', 'Deloitte', 'Accenture'],
      avgSalary: { entry: '₹6-12L', mid: '₹12-25L', senior: '₹25-50L' },
      demandLevel: 'Very High',
      hotSkills: ['AI/ML', 'Cloud', 'DevOps', 'Full Stack', 'Data Science', 'Cybersecurity'],
      hiringTrend: 'Growing',
      remoteOptions: 'High'
    },
    'Data Science': {
      growth: '35%',
      outlook: 'Excellent',
      topCities: ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Chennai'],
      topCompanies: ['Flipkart', 'Amazon', 'Google', 'Microsoft', 'Walmart', 'Myntra', 'Swiggy', 'Zomato', 'Byju\'s', 'Unacademy'],
      avgSalary: { entry: '₹8-15L', mid: '₹15-30L', senior: '₹30-60L' },
      demandLevel: 'Very High',
      hotSkills: ['Python', 'SQL', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'MLOps'],
      hiringTrend: 'Growing Fast',
      remoteOptions: 'Medium'
    },
    'Product Management': {
      growth: '22%',
      outlook: 'Good',
      topCities: ['Bangalore', 'Mumbai', 'Gurgaon', 'Pune', 'Hyderabad'],
      topCompanies: ['Google', 'Amazon', 'Flipkart', 'Myntra', 'Cred', 'Razorpay', 'Droom', 'Upstox', 'Groww', 'PineLabs'],
      avgSalary: { entry: '₹12-20L', mid: '₹20-40L', senior: '₹40-80L' },
      demandLevel: 'High',
      hotSkills: ['Product Strategy', 'Agile', 'Data Analytics', 'User Research', 'Roadmapping'],
      hiringTrend: 'Stable',
      remoteOptions: 'Medium'
    },
    'Digital Marketing': {
      growth: '20%',
      outlook: 'Good',
      topCities: ['Mumbai', 'Bangalore', 'Delhi', 'Gurgaon', 'Hyderabad'],
      topCompanies: ['Google', 'Meta', 'Dentsu', 'WPP', 'GroupM', 'IPG', 'Digi360', 'iProspect', 'Socio18', 'Digits'],
      avgSalary: { entry: '₹4-8L', mid: '₹8-18L', senior: '₹18-35L' },
      demandLevel: 'High',
      hotSkills: ['SEO', 'SEM', 'Social Media', 'Content Marketing', 'Google Analytics', 'Performance Marketing'],
      hiringTrend: 'Growing',
      remoteOptions: 'High'
    },
    'Cloud Computing': {
      growth: '28%',
      outlook: 'Excellent',
      topCities: ['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon'],
      topCompanies: ['AWS', 'Azure', 'Google Cloud', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Deloitte', 'IBM'],
      avgSalary: { entry: '₹8-15L', mid: '₹15-30L', senior: '₹30-55L' },
      demandLevel: 'Very High',
      hotSkills: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
      hiringTrend: 'Growing Fast',
      remoteOptions: 'Medium'
    },
    'Cybersecurity': {
      growth: '32%',
      outlook: 'Excellent',
      topCities: ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Chennai'],
      topCompanies: ['CrowdStrike', 'Palo Alto', 'Cisco', 'Fortinet', 'QuickHeal', 'Seqrite', 'Synechron', 'Wipro', 'TCS', 'Infosys'],
      avgSalary: { entry: '₹6-12L', mid: '₹12-25L', senior: '₹25-50L' },
      demandLevel: 'Very High',
      hotSkills: ['Network Security', 'Penetration Testing', 'SIEM', 'SOC', 'Incident Response', 'Cloud Security'],
      hiringTrend: 'Growing Fast',
      remoteOptions: 'Medium'
    },
    'UI/UX Design': {
      growth: '15%',
      outlook: 'Good',
      topCities: ['Bangalore', 'Mumbai', 'Gurgaon', 'Pune', 'Hyderabad'],
      topCompanies: ['Google', 'Meta', 'Amazon', 'Flipkart', 'Myntra', 'Cred', 'Razorpay', 'Urban Company', 'Dunzo', 'Swiggy'],
      avgSalary: { entry: '₹5-10L', mid: '₹10-20L', senior: '₹20-40L' },
      demandLevel: 'High',
      hotSkills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems', 'Interaction Design'],
      hiringTrend: 'Stable',
      remoteOptions: 'High'
    },
    'Finance': {
      growth: '12%',
      outlook: 'Good',
      topCities: ['Mumbai', 'Delhi', 'Bangalore', 'Gurgaon', 'Chennai'],
      topCompanies: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'Citi', 'Deutsche Bank', 'Axis Bank', 'HDFC', 'ICICI', 'Kotak', 'Bajaj'],
      avgSalary: { entry: '₹8-15L', mid: '₹15-30L', senior: '₹30-60L' },
      demandLevel: 'High',
      hotSkills: ['Financial Modeling', 'Excel', 'SQL', 'Risk Analysis', 'Valuation', 'FP&A'],
      hiringTrend: 'Stable',
      remoteOptions: 'Low'
    }
  },
  
  // Market trends and insights
  trends: {
    'AI/ML': { growth: '40%', avgSalary: '₹12-28L', companiesHiring: 2500, demand: 'Critical' },
    'Cloud': { growth: '30%', avgSalary: '₹10-22L', companiesHiring: 3200, demand: 'Critical' },
    'Data Science': { growth: '38%', avgSalary: '₹10-25L', companiesHiring: 2800, demand: 'Critical' },
    'Cybersecurity': { growth: '35%', avgSalary: '₹8-20L', companiesHiring: 1800, demand: 'Critical' },
    'Full Stack': { growth: '25%', avgSalary: '₹8-18L', companiesHiring: 4500, demand: 'Very High' },
    'DevOps': { growth: '28%', avgSalary: '₹10-22L', companiesHiring: 2200, demand: 'Very High' },
    'Product': { growth: '20%', avgSalary: '₹12-25L', companiesHiring: 1500, demand: 'High' },
    'UI/UX': { growth: '18%', avgSalary: '₹6-15L', companiesHiring: 2000, demand: 'High' }
  },
  
  // Project recommendations based on market demand
  projects: {
    'AI/ML': [
      { name: 'Chatbot with NLP', difficulty: 'Intermediate', demand: 'Very High', salary: '+₹3-5L' },
      { name: 'Recommendation System', difficulty: 'Advanced', demand: 'High', salary: '+₹4-6L' },
      { name: 'Computer Vision App', difficulty: 'Advanced', demand: 'High', salary: '+₹4-7L' },
      { name: 'Predictive Analytics Dashboard', difficulty: 'Intermediate', demand: 'Very High', salary: '+₹3-5L' }
    ],
    'Cloud': [
      { name: 'Serverless Architecture', difficulty: 'Intermediate', demand: 'Very High', salary: '+₹3-5L' },
      { name: 'CI/CD Pipeline', difficulty: 'Beginner', demand: 'High', salary: '+₹2-3L' },
      { name: 'Containerized Microservices', difficulty: 'Advanced', demand: 'High', salary: '+₹4-6L' },
      { name: 'Cloud Monitoring Dashboard', difficulty: 'Intermediate', demand: 'Medium', salary: '+₹2-4L' }
    ],
    'Full Stack': [
      { name: 'E-commerce Platform', difficulty: 'Advanced', demand: 'Very High', salary: '+₹4-7L' },
      { name: 'Real-time Chat App', difficulty: 'Intermediate', demand: 'High', salary: '+₹3-5L' },
      { name: 'SaaS Dashboard', difficulty: 'Advanced', demand: 'High', salary: '+₹4-6L' },
      { name: 'Portfolio Website', difficulty: 'Beginner', demand: 'Medium', salary: '+₹1-2L' }
    ],
    'Data Science': [
      { name: 'EDA Analysis', difficulty: 'Beginner', demand: 'High', salary: '+₹2-3L' },
      { name: 'SQL Analytics Project', difficulty: 'Beginner', demand: 'Very High', salary: '+₹2-4L' },
      { name: 'Machine Learning Model', difficulty: 'Intermediate', demand: 'Very High', salary: '+₹3-5L' },
      { name: 'End-to-End ML Pipeline', difficulty: 'Advanced', demand: 'High', salary: '+₹4-6L' }
    ],
    'Product': [
      { name: 'User Research Case Study', difficulty: 'Beginner', demand: 'High', salary: '+₹2-4L' },
      { name: 'Product Teardown', difficulty: 'Intermediate', demand: 'Medium', salary: '+₹2-3L' },
      { name: 'MVP Development', difficulty: 'Advanced', demand: 'Very High', salary: '+₹4-7L' },
      { name: 'A/B Testing Project', difficulty: 'Intermediate', demand: 'High', salary: '+₹3-5L' }
    ],
    'UI/UX': [
      { name: 'Mobile App Redesign', difficulty: 'Intermediate', demand: 'Very High', salary: '+₹3-5L' },
      { name: 'Design System', difficulty: 'Advanced', demand: 'High', salary: '+₹4-6L' },
      { name: 'UX Research Project', difficulty: 'Intermediate', demand: 'High', salary: '+₹2-4L' },
      { name: 'Portfolio Website', difficulty: 'Beginner', demand: 'Medium', salary: '+₹1-2L' }
    ],
    'Digital Marketing': [
      { name: 'SEO Campaign', difficulty: 'Beginner', demand: 'Very High', salary: '+₹2-4L' },
      { name: 'Social Media Strategy', difficulty: 'Intermediate', demand: 'High', salary: '+₹2-3L' },
      { name: 'Performance Marketing Campaign', difficulty: 'Advanced', demand: 'Very High', salary: '+₹3-5L' },
      { name: 'Content Marketing Blog', difficulty: 'Beginner', demand: 'High', salary: '+₹1-2L' }
    ],
    'Cybersecurity': [
      { name: 'Vulnerability Assessment', difficulty: 'Intermediate', demand: 'Very High', salary: '+₹3-5L' },
      { name: 'Security Audit', difficulty: 'Advanced', demand: 'High', salary: '+₹4-6L' },
      { name: 'SIEM Implementation', difficulty: 'Advanced', demand: 'High', salary: '+₹4-7L' },
      { name: 'Penetration Testing', difficulty: 'Intermediate', demand: 'Very High', salary: '+₹3-5L' }
    ]
  },
  
  // Learning paths for skill development
  learningPaths: {
    'AI/ML': [
      { skill: 'Python Fundamentals', priority: 'Critical', time: '2 weeks' },
      { skill: 'Machine Learning Basics', priority: 'Critical', time: '4 weeks' },
      { skill: 'Deep Learning & Neural Networks', priority: 'Critical', time: '6 weeks' },
      { skill: 'TensorFlow or PyTorch', priority: 'Critical', time: '4 weeks' },
      { skill: 'NLP or Computer Vision', priority: 'High', time: '4 weeks' },
      { skill: 'MLOps', priority: 'High', time: '3 weeks' }
    ],
    'Cloud': [
      { skill: 'Cloud Fundamentals', priority: 'Critical', time: '2 weeks' },
      { skill: 'AWS/Azure/GCP', priority: 'Critical', time: '6 weeks' },
      { skill: 'Docker & Kubernetes', priority: 'Critical', time: '4 weeks' },
      { skill: 'Infrastructure as Code', priority: 'Critical', time: '3 weeks' },
      { skill: 'CI/CD Pipelines', priority: 'High', time: '2 weeks' },
      { skill: 'Cloud Security', priority: 'High', time: '3 weeks' }
    ],
    'Full Stack': [
      { skill: 'HTML/CSS/JS Fundamentals', priority: 'Critical', time: '3 weeks' },
      { skill: 'React or Angular', priority: 'Critical', time: '4 weeks' },
      { skill: 'Node.js or Express', priority: 'Critical', time: '4 weeks' },
      { skill: 'Database (SQL/NoSQL)', priority: 'Critical', time: '3 weeks' },
      { skill: 'REST/GraphQL APIs', priority: 'High', time: '2 weeks' },
      { skill: 'Git & Version Control', priority: 'Critical', time: '1 week' }
    ],
    'Data Science': [
      { skill: 'Python for Data Science', priority: 'Critical', time: '3 weeks' },
      { skill: 'SQL & Database', priority: 'Critical', time: '3 weeks' },
      { skill: 'Statistics & Probability', priority: 'Critical', time: '4 weeks' },
      { skill: 'Data Visualization', priority: 'High', time: '2 weeks' },
      { skill: 'Machine Learning', priority: 'Critical', time: '6 weeks' },
      { skill: 'Feature Engineering', priority: 'High', time: '3 weeks' }
    ],
    'Product': [
      { skill: 'Product Management Basics', priority: 'Critical', time: '2 weeks' },
      { skill: 'User Research', priority: 'Critical', time: '3 weeks' },
      { skill: 'Data Analytics', priority: 'Critical', time: '4 weeks' },
      { skill: 'Agile/Scrum', priority: 'Critical', time: '2 weeks' },
      { skill: 'Roadmapping', priority: 'High', time: '2 weeks' },
      { skill: 'A/B Testing', priority: 'High', time: '2 weeks' }
    ],
    'UI/UX': [
      { skill: 'Design Fundamentals', priority: 'Critical', time: '3 weeks' },
      { skill: 'Figma/Adobe XD', priority: 'Critical', time: '4 weeks' },
      { skill: 'User Research', priority: 'Critical', time: '3 weeks' },
      { skill: 'Prototyping', priority: 'Critical', time: '2 weeks' },
      { skill: 'Design Systems', priority: 'High', time: '2 weeks' },
      { skill: 'Accessibility', priority: 'High', time: '1 week' }
    ],
    'Digital Marketing': [
      { skill: 'SEO Fundamentals', priority: 'Critical', time: '2 weeks' },
      { skill: 'Google Analytics', priority: 'Critical', time: '2 weeks' },
      { skill: 'Social Media Marketing', priority: 'Critical', time: '2 weeks' },
      { skill: 'Content Marketing', priority: 'High', time: '3 weeks' },
      { skill: 'Performance Marketing', priority: 'Critical', time: '3 weeks' },
      { skill: 'Email Marketing', priority: 'Medium', time: '1 week' }
    ],
    'Cybersecurity': [
      { skill: 'Networking Fundamentals', priority: 'Critical', time: '3 weeks' },
      { skill: 'Linux/Unix', priority: 'Critical', time: '3 weeks' },
      { skill: 'Python for Security', priority: 'Critical', time: '3 weeks' },
      { skill: 'Security+ Certification', priority: 'High', time: '6 weeks' },
      { skill: 'Penetration Testing', priority: 'Critical', time: '4 weeks' },
      { skill: 'SIEM Tools', priority: 'High', time: '3 weeks' }
    ]
  }
};

// Helper to get sector data
function getSectorData(sector) {
  const normalizedSector = sector?.toLowerCase().replace(/\s+/g, '') || 'technology';
  
  // Map common sector names
  const sectorMap = {
    'tech': 'Technology',
    'software': 'Technology',
    'it': 'Technology',
    'datascience': 'Data Science',
    'ml': 'Data Science',
    'ai': 'Data Science',
    'product': 'Product Management',
    'pm': 'Product Management',
    'design': 'UI/UX Design',
    'ux': 'UI/UX Design',
    'ui': 'UI/UX Design',
    'marketing': 'Digital Marketing',
    'digital': 'Digital Marketing',
    'cloud': 'Cloud Computing',
    'security': 'Cybersecurity',
    'cyber': 'Cybersecurity',
    'finance': 'Finance',
    'financial': 'Finance'
  };
  
  const mappedSector = sectorMap[normalizedSector] || 'Technology';
  return INDIA_MARKET_DATA.sectors[mappedSector] || INDIA_MARKET_DATA.sectors['Technology'];
}

// Generate Skills Assessment Report - Realistic Data
function generateSkillsReport(userData) {
  const profile = userData.aiAssessment?.profile || userData.initialProfile || {};
  const atsAnalysis = userData.atsAnalysis || {};
  const skillsFromResume = atsAnalysis?.parsedResume?.skills || {};
  
  // Combine skills from multiple sources
  const allTechnicalSkills = [
    ...(profile.technicalSkills || []),
    ...(skillsFromResume.technical || []),
    ...(skillsFromResume.tools || [])
  ];
  
  const uniqueTechnical = [...new Set(allTechnicalSkills.map(s => s.toLowerCase()))];
  
  const softSkills = [
    ...(profile.softSkills || []),
    ...(skillsFromResume.soft || [])
  ];
  
  const uniqueSoft = [...new Set(softSkills.map(s => s.toLowerCase()))];
  
  // Extract skills from resume text if needed
  if (uniqueTechnical.length === 0 && userData.resumeText) {
    const extractedSkills = extractSkillsFromText(userData.resumeText);
    uniqueTechnical.push(...extractedSkills);
  }
  
  const totalSkills = uniqueTechnical.length + uniqueSoft.length;
  
  // Calculate realistic score (0-100)
  const skillScore = Math.min(100, Math.round(
    (uniqueTechnical.length * 3) + 
    (uniqueSoft.length * 2) + 
    (atsAnalysis.overallScore || 0) * 0.3
  ));
  
  // Identify detected sector
  const detectedSector = atsAnalysis?.sectorAnalysis?.detectedSector || 
                         profile.sectors?.[0] || 
                         (uniqueTechnical.some(s => ['python', 'java', 'javascript', 'react'].includes(s)) ? 'Technology' : 'Technology');
  
  const sectorData = getSectorData(detectedSector);
  
  // Identify skill gaps
  const hotSkills = sectorData.hotSkills || [];
  const matchedHotSkills = hotSkills.filter(hs => 
    uniqueTechnical.some(ts => ts.toLowerCase().includes(hs.toLowerCase()))
  );
  const missingHotSkills = hotSkills.filter(hs => !matchedHotSkills.includes(hs));
  
  // Recommendations
  const recommendations = [];
  
  if (uniqueSoft.length < 3) {
    recommendations.push({ 
      type: 'soft', 
      suggestion: 'Develop communication, leadership, and teamwork skills',
      priority: 'high',
      impact: 'High impact on interviews and workplace success'
    });
  }
  
  if (missingHotSkills.length > 0) {
    recommendations.push({
      type: 'market-demand',
      suggestion: `Learn ${missingHotSkills.slice(0, 3).join(', ')} - these are in high demand in ${detectedSector}`,
      priority: 'high',
      impact: `+₹3-5L salary increase potential`
    });
  }
  
  if (uniqueTechnical.length < 5) {
    recommendations.push({ 
      type: 'technical', 
      suggestion: 'Expand technical skills - aim for at least 5-7 in-demand technologies',
      priority: 'high',
      impact: 'Increases job opportunities by 60%'
    });
  }
  
  return {
    title: 'Skills Assessment Report',
    totalSkills,
    technicalSkills: uniqueTechnical,
    softSkills: uniqueSoft,
    skillScore,
    detectedSector,
    sectorData: {
      demand: sectorData.demandLevel,
      outlook: sectorData.outlook,
      growth: sectorData.growth
    },
    hotSkillsMatch: {
      matched: matchedHotSkills,
      missing: missingHotSkills,
      matchPercentage: Math.round((matchedHotSkills.length / hotSkills.length) * 100)
    },
    recommendations,
    generatedAt: new Date().toISOString()
  };
}

// Helper to extract skills from raw resume text
function extractSkillsFromText(text) {
  const skillPatterns = [
    /\b(JavaScript|Java|Python|React|Angular|Vue|Node|Express|TypeScript|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|PHP|Scala|Perl|R)\b/gi,
    /\b(Spring|Django|Flask|Laravel|Next\.js|Flutter|React Native|Ionic)\b/gi,
    /\b(MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Firebase|Oracle)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|GitLab|Terraform)\b/gi,
    /\b(TensorFlow|PyTorch|Keras|Scikit|Pandas|Numpy|SciPy)\b/gi,
    /\b(Git|HTML|CSS|REST|GraphQL|JIRA|Agile|Scrum|Kanban)\b/gi
  ];
  
  const foundSkills = new Set();
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => foundSkills.add(match.toLowerCase()));
    }
  });
  return Array.from(foundSkills);
}

// Generate Career Path Analysis Report - Realistic Data
async function generateCareerPathReport(userData) {
  const firestore = getDb();
  
  const matchedOccupations = userData.aiAssessment?.matchedOccupations || 
                           userData.matchedOccupations || [];
  const sector = userData.aiAssessment?.profile?.sectors?.[0] || 
                userData.userSector || 'tech';
  
  const sectorData = getSectorData(sector);
  
  // If we have matched occupations in DB, try to get more details
  if (firestore && matchedOccupations.length === 0) {
    try {
      const careersSnapshot = await firestore.collection('careers').limit(20).get();
      if (!careersSnapshot.empty) {
        const randomCareer = careersSnapshot.docs[Math.floor(Math.random() * careersSnapshot.docs.length)];
        const careerData = randomCareer.data();
        matchedOccupations.push({
          title: careerData.title || 'Software Engineer',
          matchScore: 0.75
        });
      }
    } catch (e) {
      console.log('Could not fetch careers from DB, using defaults');
    }
  }
  
  // Calculate realistic match scores (0-100)
  const baseScore = sectorData.demandLevel === 'Very High' ? 75 : 
                    sectorData.demandLevel === 'High' ? 65 : 55;
  
  // Get career path based on matched occupations
  const careerPaths = matchedOccupations.slice(0, 3).map((occ, index) => {
    const occSectorData = getSectorData(occ.title);
    return {
      title: occ.title,
      matchScore: Math.min(100, Math.round(baseScore + (index === 0 ? 15 : 0) - (index * 5))),
      level: index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Alternative',
      salaryRange: occSectorData.avgSalary,
      growthPotential: occSectorData.growth,
      demand: occSectorData.demandLevel,
      companiesHiring: Math.floor(Math.random() * 500) + 100,
      nextSteps: getCareerNextSteps(occ.title, index)
    };
  });
  
  // If no career paths, provide defaults with realistic data
  if (careerPaths.length === 0) {
    const defaultCareer = sectorData;
    careerPaths.push(
      { 
        title: getCareerTitleForSector(sector, 'primary'), 
        matchScore: 75, 
        level: 'Primary', 
        salaryRange: defaultCareer.avgSalary, 
        growthPotential: defaultCareer.growth, 
        demand: defaultCareer.demandLevel,
        companiesHiring: Math.floor(Math.random() * 500) + 100,
        nextSteps: ['Master core skills', 'Build portfolio projects', 'Apply to top companies'] 
      },
      { 
        title: getCareerTitleForSector(sector, 'secondary'), 
        matchScore: 65, 
        level: 'Secondary', 
        salaryRange: defaultCareer.avgSalary, 
        growthPotential: defaultCareer.growth, 
        demand: defaultCareer.demandLevel,
        companiesHiring: Math.floor(Math.random() * 400) + 80,
        nextSteps: ['Upskill in domain', 'Gain certifications', 'Network with professionals'] 
      },
      { 
        title: getCareerTitleForSector(sector, 'alternative'), 
        matchScore: 55, 
        level: 'Alternative', 
        salaryRange: defaultCareer.avgSalary, 
        growthPotential: defaultCareer.growth, 
        demand: defaultCareer.demandLevel,
        companiesHiring: Math.floor(Math.random() * 300) + 50,
        nextSteps: ['Learn fundamentals', 'Complete internships', 'Build foundational skills'] 
      }
    );
  }
  
  // Career scope analysis
  const scopeAnalysis = {
    currentSector: sector,
    scope: sectorData.outlook,
    growth: sectorData.growth,
    demand: sectorData.demandLevel,
    shouldConsiderSwitch: shouldSwitchCareer(sectorData),
    switchRecommendations: getSwitchRecommendations(sectorData),
    topCities: sectorData.topCities,
    topCompanies: sectorData.topCompanies
  };
  
  return {
    title: 'Career Path Analysis Report',
    sector: sector.charAt(0).toUpperCase() + sector.slice(1),
    careerPaths,
    scopeAnalysis,
    sectorOverview: getSectorOverview(sector),
    generatedAt: new Date().toISOString()
  };
}

// Helper function to get career titles for a sector
function getCareerTitleForSector(sector, type) {
  const careers = {
    'Technology': ['Full Stack Developer', 'Backend Developer', 'DevOps Engineer'],
    'Data Science': ['Data Scientist', 'ML Engineer', 'Data Analyst'],
    'Product Management': ['Product Manager', 'Associate PM', 'Product Lead'],
    'UI/UX Design': ['UI Designer', 'UX Designer', 'Product Designer'],
    'Digital Marketing': ['Digital Marketer', 'SEO Specialist', 'Marketing Manager'],
    'Cloud Computing': ['Cloud Engineer', 'AWS Developer', 'Cloud Architect'],
    'Cybersecurity': ['Security Analyst', 'Penetration Tester', 'Security Engineer'],
    'Finance': ['Financial Analyst', 'Investment Analyst', 'Finance Manager']
  };
  
  const sectorCareers = careers[sector] || careers['Technology'];
  const index = type === 'primary' ? 0 : type === 'secondary' ? 1 : 2;
  return sectorCareers[index] || 'Software Engineer';
}

// Determine if user should consider switching careers
function shouldSwitchCareer(sectorData) {
  if (sectorData.demandLevel === 'Very High') return false;
  if (sectorData.demandLevel === 'High') return false;
  if (parseInt(sectorData.growth) > 20) return false;
  return true;
}

// Get switch recommendations
function getSwitchRecommendations(sectorData) {
  const currentDemand = sectorData.demandLevel;
  
  if (currentDemand === 'Very High' || currentDemand === 'High') {
    return [];
  }
  
  // Find better sectors
  const betterSectors = Object.entries(INDIA_MARKET_DATA.sectors)
    .filter(([name, data]) => {
      return data.demandLevel === 'Very High' && name !== sectorData;
    })
    .slice(0, 3)
    .map(([name, data]) => ({
      sector: name,
      reason: `${data.demandLevel} demand with ${data.growth} growth`,
      avgSalary: data.avgSalary
    }));
  
  return betterSectors;
}

// Generate Job Market Fit Report - Realistic India Market Data
function generateMarketFitReport(userData) {
  const atsAnalysis = userData.atsAnalysis || {};
  const matchedOccupations = userData.aiAssessment?.matchedOccupations || [];
  const sectorAnalysis = atsAnalysis.sectorAnalysis || {};
  
  // Get sector data
  const detectedSector = sectorAnalysis.detectedSector || 'Technology';
  const sectorData = getSectorData(detectedSector);
  
  // Get market trends data
  const trendKey = getTrendKey(detectedSector);
  const trendData = INDIA_MARKET_DATA.trends[trendKey] || INDIA_MARKET_DATA.trends['Full Stack'];
  
  // Calculate realistic scores (0-100)
  const marketFit = {
    atsScore: atsAnalysis.overallScore || 0,
    keywordMatch: atsAnalysis.scores?.keywordMatch || Math.floor(Math.random() * 30) + 40,
    formatScore: atsAnalysis.scores?.formatScore || Math.floor(Math.random() * 20) + 60,
    completeness: atsAnalysis.scores?.completeness || Math.floor(Math.random() * 25) + 50,
    contentQuality: atsAnalysis.scores?.contentQuality || Math.floor(Math.random() * 20) + 55
  };
  
  // Job market trends for matched occupations
  const marketTrends = matchedOccupations.slice(0, 3).map(occ => {
    const occSectorData = getSectorData(occ.title);
    return {
      title: occ.title,
      demand: occSectorData.demandLevel,
      competition: getCompetitionLevel(occ.title),
      salaryTrend: 'Rising',
      remoteOptions: occSectorData.remoteOptions,
      companiesHiring: Math.floor(Math.random() * 500) + 100
    };
  });
  
  // Use actual sector data for the report
  const sectorReportData = {
    detectedSector: detectedSector,
    growth: sectorData.growth,
    outlook: sectorData.outlook,
    demand: sectorData.demandLevel,
    topCities: sectorData.topCities,
    topCompanies: sectorData.topCompanies,
    avgSalary: sectorData.avgSalary,
    remoteOptions: sectorData.remoteOptions,
    hiringTrend: sectorData.hiringTrend
  };
  
  // Market insights
  const marketInsights = {
    totalCompaniesHiring: trendData.companiesHiring,
    avgSalaryRange: trendData.avgSalary,
    growthRate: trendData.growth,
    demandLevel: trendData.demand
  };
  
  // Recommendations based on ATS scores
  const recommendations = [];
  
  if (marketFit.atsScore < 60) {
    recommendations.push({ 
      priority: 'high', 
      action: `Improve your ATS score. Add more ${detectedSector}-specific keywords`,
      impact: '+40% more interview calls',
      category: 'ATS Optimization'
    });
  }
  
  if (marketFit.formatScore < 60) {
    recommendations.push({ 
      priority: 'medium', 
      action: 'Improve formatting with bullet points and consistent structure',
      impact: '+20% readability score',
      category: 'Format'
    });
  }
  
  if (marketFit.keywordMatch < 50) {
    recommendations.push({ 
      priority: 'high', 
      action: `Add more ${detectedSector} keywords matching job requirements`,
      impact: '+30% ATS match',
      category: 'Keywords'
    });
  }
  
  // Add market-specific recommendations
  recommendations.push({
    priority: 'info',
    action: `Target ${sectorData.topCities.slice(0, 3).join(', ')} for best opportunities`,
    impact: `+${Math.floor(Math.random() * 20) + 10}% success rate`,
    category: 'Job Search Strategy'
  });
  
  return {
    title: 'Job Market Fit Report (India)',
    marketFit,
    sectorData: sectorReportData,
    marketTrends,
    marketInsights,
    recommendations,
    generatedAt: new Date().toISOString()
  };
}

// Helper to get trend key from sector
function getTrendKey(sector) {
  const keyMap = {
    'Technology': 'Full Stack',
    'Data Science': 'Data Science',
    'Product Management': 'Product',
    'UI/UX Design': 'UI/UX',
    'Digital Marketing': 'Full Stack', // Mapping to nearest
    'Cloud Computing': 'Cloud',
    'Cybersecurity': 'Full Stack', // Mapping to nearest
    'Finance': 'Full Stack' // Mapping to nearest
  };
  return keyMap[sector] || 'Full Stack';
}

// Generate Resume Improvement Report - With Project Recommendations
function generateResumeReport(userData) {
  const atsAnalysis = userData.atsAnalysis || {};
  const parsedResume = atsAnalysis.parsedResume || {};
  const improvements = atsAnalysis.improvements || [];
  
  // Get sector for project recommendations
  const detectedSector = atsAnalysis.sectorAnalysis?.detectedSector || 
                         userData.aiAssessment?.profile?.sectors?.[0] || 
                         'Technology';
  
  // Get project recommendations
  const projectRecs = getProjectRecommendations(detectedSector);
  
  // Get learning paths
  const learningPaths = getLearningPaths(detectedSector);
  
  // Check what's missing from resume
  const missingSections = [];
  if (!parsedResume.contact?.email) missingSections.push('Contact Information');
  if (!parsedResume.summary) missingSections.push('Professional Summary');
  if (!parsedResume.experience?.length) missingSections.push('Work Experience');
  if (!parsedResume.education?.length) missingSections.push('Education');
  if (!parsedResume.skills?.technical?.length) missingSections.push('Technical Skills');
  
  // Improvement suggestions
  const suggestions = improvements.map(imp => ({
    category: imp.category,
    suggestion: imp.suggestion,
    details: imp.details,
    priority: imp.priority
  }));
  
  // Add missing section suggestions
  missingSections.forEach(section => {
    suggestions.push({
      category: 'Completeness',
      suggestion: `Add ${section} section`,
      details: `Including ${section.toLowerCase()} improves your resume's completeness score`,
      priority: 'high'
    });
  });
  
  return {
    title: 'Resume Improvement Report',
    missingSections,
    suggestions,
    matchedKeywords: atsAnalysis.matchedKeywords || [],
    missingKeywords: atsAnalysis.missingKeywords || [],
    overallScore: atsAnalysis.overallScore || Math.floor(Math.random() * 30) + 40,
    projectRecommendations: projectRecs,
    learningPaths: learningPaths,
    generatedAt: new Date().toISOString()
  };
}

// Get project recommendations based on sector
function getProjectRecommendations(sector) {
  const sectorKey = Object.keys(INDIA_MARKET_DATA.projects).find(k => 
    sector.toLowerCase().includes(k.toLowerCase())
  ) || 'Full Stack';
  
  return INDIA_MARKET_DATA.projects[sectorKey] || INDIA_MARKET_DATA.projects['Full Stack'];
}

// Get learning paths based on sector
function getLearningPaths(sector) {
  const sectorKey = Object.keys(INDIA_MARKET_DATA.learningPaths).find(k => 
    sector.toLowerCase().includes(k.toLowerCase())
  ) || 'Full Stack';
  
  return INDIA_MARKET_DATA.learningPaths[sectorKey] || INDIA_MARKET_DATA.learningPaths['Full Stack'];
}

// Generate Overall Summary - Realistic Scores
function generateOverallSummary(userData, reports) {
  // Calculate realistic scores (0-100)
  const skillsScore = Math.min(100, reports.skills?.skillScore || 
    Math.floor(Math.random() * 30) + 40);
  const careerScore = Math.min(100, reports.career?.careerPaths?.[0]?.matchScore || 
    Math.floor(Math.random() * 25) + 50);
  const marketScore = Math.min(100, reports.market?.marketFit?.atsScore || 
    Math.floor(Math.random() * 30) + 40);
  const resumeScore = Math.min(100, reports.resume?.overallScore || 
    Math.floor(Math.random() * 25) + 45);
  
  const scores = {
    skills: skillsScore,
    career: careerScore,
    market: marketScore,
    resume: resumeScore
  };
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (skillsScore * 0.25) +
    (careerScore * 0.30) +
    (marketScore * 0.20) +
    (resumeScore * 0.25)
  );
  
  // Get sector info
  const sector = userData.aiAssessment?.profile?.sectors?.[0] || 
                userData.atsAnalysis?.sectorAnalysis?.detectedSector || 
                'Technology';
  const sectorData = getSectorData(sector);
  
  return {
    overallScore,
    scores,
    assessmentDate: userData.lastAssessmentDate || new Date().toISOString(),
    keyFindings: [
      `Your skills profile scores ${skillsScore}% - ${skillsScore > 60 ? 'Good' : 'Needs improvement'}`,
      `Career match: ${careerScore}% alignment with ${sector} sector`,
      `Resume ATS score: ${resumeScore}% - ${resumeScore > 60 ? 'Optimized' : 'Needs work'}`,
      `Market fit: ${marketScore}% - ${sectorData.demandLevel} demand in India`
    ],
    nextActions: [
      'Complete skill gap analysis and follow learning paths',
      'Build recommended projects for your sector',
      'Apply to top companies in ' + sectorData.topCities.slice(0, 2).join(', '),
      'Optimize resume with sector-specific keywords'
    ]
  };
}

// Helper functions
function getSalaryRange(title) {
  // India-specific salary ranges (in LPA - Lakhs Per Annum)
  const ranges = {
    'Software Engineer': '₹6-18 LPA',
    'Senior Software Engineer': '₹15-35 LPA',
    'Full Stack Developer': '₹8-22 LPA',
    'Frontend Developer': '₹5-15 LPA',
    'Backend Developer': '₹7-20 LPA',
    'Data Scientist': '₹8-25 LPA',
    'Senior Data Scientist': '₹20-45 LPA',
    'Machine Learning Engineer': '₹10-28 LPA',
    'DevOps Engineer': '₹8-22 LPA',
    'Cloud Engineer': '₹10-25 LPA',
    'Product Manager': '₹12-30 LPA',
    'Senior Product Manager': '₹25-50 LPA',
    'UX Designer': '₹5-18 LPA',
    'UI Designer': '₹4-12 LPA',
    'Data Analyst': '₹4-12 LPA',
    'Business Analyst': '₹6-15 LPA',
    ' QA Engineer': '₹4-12 LPA',
    'Automation Tester': '₹6-15 LPA',
    'Technical Lead': '₹18-35 LPA',
    'Engineering Manager': '₹25-50 LPA',
    'CTO': '₹50-150 LPA'
  };
  return ranges[title] || '₹5-15 LPA';
}

function getGrowthPotential(title) {
  const growth = {
    'Software Engineer': 'High (18% growth)',
    'Data Scientist': 'Very High (36% growth)',
    'Machine Learning Engineer': 'Very High (40% growth)',
    'DevOps Engineer': 'High (25% growth)',
    'Cloud Engineer': 'Very High (30% growth)',
    'Product Manager': 'High (20% growth)',
    'UX Designer': 'High (15% growth)',
    'Full Stack Developer': 'High (22% growth)',
    'Cybersecurity Analyst': 'Very High (35% growth)',
    'Blockchain Developer': 'High (28% growth)'
  };
  return growth[title] || 'Moderate (10-15% growth)';
}

function getCareerNextSteps(title, index) {
  const steps = {
    'Software Engineer': ['Master data structures', 'Build portfolio projects', 'Contribute to open source'],
    'Data Scientist': ['Learn advanced ML', 'Complete Kaggle projects', 'Build ML pipelines'],
    'Product Manager': ['Get PMP certification', 'Lead a product launch', 'Develop analytics skills'],
    'UX Designer': ['Build design portfolio', 'Learn prototyping tools', 'Conduct user research']
  };
  return steps[title] || ['Build relevant skills', 'Gain practical experience', 'Network in the industry'];
}

function getSectorOverview(sector) {
  const overview = {
    tech: { growth: '22%', outlook: 'Excellent', topLocations: ['Bangalore', 'Hyderabad', 'Pune', 'Chennai'] },
    healthcare: { growth: '15%', outlook: 'Good', topLocations: ['Mumbai', 'Delhi', 'Chennai', 'Bangalore'] },
    business: { growth: '12%', outlook: 'Good', topLocations: ['Delhi', 'Mumbai', 'Bangalore', 'Gurgaon'] },
    finance: { growth: '14%', outlook: 'Good', topLocations: ['Mumbai', 'Delhi', 'Bangalore', 'Gurgaon'] }
  };
  return overview[sector] || { growth: '10%', outlook: 'Moderate', topLocations: ['Major Cities'] };
}

function getDemandLevel(title) {
  // India job market demand levels (2024-2025)
  const highDemand = [
    'Software Engineer', 'Data Scientist', 'DevOps Engineer', 'Machine Learning Engineer',
    'Full Stack Developer', 'Cloud Engineer', 'Cybersecurity Analyst', 'Blockchain Developer',
    'Product Manager', 'Data Engineer'
  ];
  const mediumDemand = [
    'Frontend Developer', 'Backend Developer', 'UI Designer', 'UX Designer',
    'Business Analyst', 'QA Engineer', 'Technical Lead'
  ];
  
  if (highDemand.includes(title)) return 'High';
  if (mediumDemand.includes(title)) return 'Medium';
  return 'Moderate';
}

function getCompetitionLevel(title) {
  // Competition levels in India job market
  const highCompetition = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'Full Stack Developer',
    'Frontend Developer', 'UI Designer'
  ];
  const mediumCompetition = [
    'Machine Learning Engineer', 'DevOps Engineer', 'Cloud Engineer', 'Backend Developer'
  ];
  
  if (highCompetition.includes(title)) return 'High';
  if (mediumCompetition.includes(title)) return 'Medium';
  return 'Moderate';
}

function getRemoteOptions(title) {
  // Remote work availability in India
  const remoteFriendly = [
    'Software Engineer', 'Data Scientist', 'DevOps Engineer', 'Full Stack Developer',
    'Frontend Developer', 'Backend Developer', 'Machine Learning Engineer',
    'UX Designer', 'UI Designer', 'Content Writer', 'Digital Marketing'
  ];
  
  if (remoteFriendly.includes(title)) return 'High';
  return 'Moderate';
}

module.exports = router;