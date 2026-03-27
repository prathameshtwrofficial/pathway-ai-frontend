// Advanced ATS Resume Analysis Endpoint with Sector-Specific Job Market Analysis
const express = require('express');
const router = express.Router();

// Comprehensive skill extraction patterns
function extractSkills(text) {
  const skillPatterns = [
    // Programming Languages
    /\b(JavaScript|Java|Python|React|Angular|Vue|Node|Express|TypeScript|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|PHP|Scala|Perl|R)\b/gi,
    // Frameworks
    /\b(Spring|Django|Flask|Laravel|Next\.js|Flutter|React Native|Ionic|Express\.js|NestJS|Hibernate|Struts)\b/gi,
    // Databases
    /\b(MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Firebase|Oracle|SQL Server|Cassandra|DynamoDB|MariaDB)\b/gi,
    // Cloud & DevOps
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|GitLab|Terraform|Ansible|Puppet|CircleCI|Travis)\b/gi,
    // ML/AI
    /\b(TensorFlow|PyTorch|Keras|Scikit|Pandas|Numpy|SciPy|Matplotlib|OpenCV|NLTK|SpaCy|Hugging Face)\b/gi,
    // Tools & Methods
    /\b(Git|HTML|CSS|REST|GraphQL|JIRA|Agile|Scrum|Kanban|Jenkins|Bamboo)\b/gi,
    // Big Data
    /\b(Hadoop|Spark|Kafka|MapReduce|Hive|Pig|Presto|Airflow|dbt)\b/gi,
    // Security
    /\b(OAuth|JWT|SSL|TLS|Cybersecurity|Penetration Testing|Firewall|Encryption|SOC 2|ISO 27001)\b/gi,
    // Soft Skills
    /\b(Leadership|Communication|Teamwork|Problem.?solving|Analytical|Time Management|Project Management|Strategic Planning|Mentoring|Collaboration|Adaptability|Creativity|Critical Thinking)\b/gi
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

// Sector-specific job market demands with comprehensive India market data
const sectorDemands = {
  'technology': {
    name: 'Technology',
    hotSkills: ['Python', 'JavaScript', 'React', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'Go', 'Rust', 'Machine Learning', 'AI', 'SQL', 'Node.js', 'Angular', 'Vue.js'],
    trendingRoles: ['Full Stack Developer', 'DevOps Engineer', 'ML Engineer', 'Data Engineer', 'Cloud Architect', 'Software Engineer', 'Backend Developer', 'Frontend Developer'],
    demandLevel: 'Very High',
    salaryRanges: {
      entry: '₹3-6 LPA',
      mid: '₹6-18 LPA',
      senior: '₹18-40 LPA'
    },
    topCities: ['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon', 'Noida'],
    growthRate: '22%'
  },
  'healthcare': {
    name: 'Healthcare',
    hotSkills: ['Python', 'Data Analytics', 'Machine Learning', 'Healthcare IT', 'EHR', 'HIPAA', 'Healthcare Data', 'Telemedicine', 'ML', 'Analytics'],
    trendingRoles: ['Health Data Analyst', 'Healthcare Software Developer', 'Medical Records Specialist', 'Health Informatics', 'Biomedical Engineer'],
    demandLevel: 'High',
    salaryRanges: {
      entry: '₹3-5 LPA',
      mid: '₹5-12 LPA',
      senior: '₹12-25 LPA'
    },
    topCities: ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad'],
    growthRate: '15%'
  },
  'finance': {
    name: 'Finance & Banking',
    hotSkills: ['Python', 'SQL', 'Excel', 'Financial Modeling', 'Risk Analysis', 'Tableau', 'Power BI', 'R', 'Data Analysis', 'Bloomberg', 'FinTech'],
    trendingRoles: ['Financial Analyst', 'Data Analyst', 'Quantitative Analyst', 'Risk Manager', 'Investment Analyst', 'FinTech Developer'],
    demandLevel: 'High',
    salaryRanges: {
      entry: '₹4-7 LPA',
      mid: '₹7-18 LPA',
      senior: '₹18-45 LPA'
    },
    topCities: ['Mumbai', 'Delhi', 'Bangalore', 'Gurgaon', 'Chennai'],
    growthRate: '14%'
  },
  'marketing': {
    name: 'Digital Marketing',
    hotSkills: ['SEO', 'SEM', 'Google Analytics', 'Content Marketing', 'Social Media', 'Email Marketing', 'HubSpot', 'WordPress', 'Facebook Ads', 'LinkedIn Marketing'],
    trendingRoles: ['Digital Marketing Manager', 'SEO Specialist', 'Content Strategist', 'Marketing Analyst', 'Growth Hacker', 'Social Media Manager'],
    demandLevel: 'Medium-High',
    salaryRanges: {
      entry: '₹2-5 LPA',
      mid: '₹5-12 LPA',
      senior: '₹12-25 LPA'
    },
    topCities: ['Bangalore', 'Mumbai', 'Delhi', 'Gurgaon', 'Pune'],
    growthRate: '18%'
  },
  'engineering': {
    name: 'Engineering',
    hotSkills: ['CAD', 'Python', 'MATLAB', 'SolidWorks', 'AutoCAD', 'Finite Element Analysis', 'Product Design', 'Simulation', '3D Printing'],
    trendingRoles: ['Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Product Engineer', 'Design Engineer', 'Automotive Engineer'],
    demandLevel: 'Medium',
    salaryRanges: {
      entry: '₹3-5 LPA',
      mid: '₹5-12 LPA',
      senior: '₹12-30 LPA'
    },
    topCities: ['Pune', 'Bangalore', 'Chennai', 'Hyderabad', 'NCR'],
    growthRate: '10%'
  },
  'data': {
    name: 'Data Science & Analytics',
    hotSkills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Pandas', 'Statistics', 'Deep Learning', 'NLP', 'Computer Vision', 'R', 'Spark'],
    trendingRoles: ['Data Scientist', 'Data Engineer', 'ML Engineer', 'Analytics Engineer', 'Data Analyst', 'Business Analyst', 'Data Architect'],
    demandLevel: 'Very High',
    salaryRanges: {
      entry: '₹4-8 LPA',
      mid: '₹8-20 LPA',
      senior: '₹20-50 LPA'
    },
    topCities: ['Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai'],
    growthRate: '36%'
  },
  'ecommerce': {
    name: 'E-Commerce & Retail',
    hotSkills: ['E-commerce Platforms', 'Digital Marketing', 'Supply Chain', 'Inventory Management', 'Payment Systems', 'Customer Analytics', 'Shopify', 'WooCommerce'],
    trendingRoles: ['E-commerce Manager', 'Product Manager', 'Supply Chain Analyst', 'Digital Marketing Lead', 'Customer Experience Manager'],
    demandLevel: 'High',
    salaryRanges: {
      entry: '₹3-6 LPA',
      mid: '₹6-15 LPA',
      senior: '₹15-35 LPA'
    },
    topCities: ['Bangalore', 'Gurgaon', 'Mumbai', 'Delhi', 'Hyderabad'],
    growthRate: '20%'
  },
  'startup': {
    name: 'Startups & SaaS',
    hotSkills: ['Full Stack', 'Product Development', 'Agile', 'Data Analysis', 'Growth Marketing', 'Fundraising', 'MVP Development', 'User Research'],
    trendingRoles: ['Full Stack Developer', 'Product Manager', 'Growth Manager', 'Founding Engineer', 'Tech Lead', 'Startup Consultant'],
    demandLevel: 'Very High',
    salaryRanges: {
      entry: '₹4-8 LPA',
      mid: '₹8-20 LPA',
      senior: '₹20-50 LPA'
    },
    topCities: ['Bangalore', 'Gurgaon', 'Hyderabad', 'Pune', 'Mumbai'],
    growthRate: '25%'
  }
};

// Detect sector from job description or resume
function detectSector(text) {
  const textLower = text.toLowerCase();
  const sectorScores = {};
  
  Object.keys(sectorDemands).forEach(sectorKey => {
    let score = 0;
    const sector = sectorDemands[sectorKey];
    
    // Check for sector-specific keywords
    if (sector.name.toLowerCase().includes('technology') || textLower.includes('software') || textLower.includes('developer') || textLower.includes('programming')) {
      if (sector.name.toLowerCase().includes('technology')) score += 5;
    }
    if (textLower.includes('health') || textLower.includes('medical') || textLower.includes('patient')) {
      if (sector.name.toLowerCase().includes('healthcare')) score += 5;
    }
    if (textLower.includes('finance') || textLower.includes('financial') || textLower.includes('banking')) {
      if (sector.name.toLowerCase().includes('finance')) score += 5;
    }
    if (textLower.includes('marketing') || textLower.includes('digital') || textLower.includes('advertising')) {
      if (sector.name.toLowerCase().includes('marketing')) score += 5;
    }
    if (textLower.includes('engineer') || textLower.includes('design') || textLower.includes('manufacturing')) {
      if (sector.name.toLowerCase().includes('engineering')) score += 5;
    }
    if (textLower.includes('data') || textLower.includes('analytics') || textLower.includes('machine learning')) {
      if (sector.name.toLowerCase().includes('data')) score += 5;
    }
    
    sectorScores[sectorKey] = score;
  });
  
  // Return the sector with highest score, or default to technology
  const maxScore = Math.max(...Object.values(sectorScores));
  if (maxScore > 0) {
    return Object.keys(sectorScores).find(key => sectorScores[key] === maxScore);
  }
  return 'technology'; // Default
}

// Extract contact information
function extractContact(text) {
  const info = {};
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emailMatch) info.email = emailMatch[0];
  
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
  if (phoneMatch) info.phone = phoneMatch[0];
  
  // LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/gi);
  if (linkedinMatch) info.linkedin = linkedinMatch[0];
  
  // Name (first substantial line that's not a section header)
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (!firstLine.includes('@') && !firstLine.match(/\d{3}/) && firstLine.length < 50 && !firstLine.match(/^(summary|experience|education|skills)/i)) {
      info.name = firstLine;
    }
  }
  
  return info;
}

// Extract experience
function extractExperience(text) {
  const experience = [];
  const lines = text.split('\n');
  
  // Look for patterns indicating work experience
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Check for job titles and dates
    if (line.match(/\d{4}/) && (line.includes('Engineer') || line.includes('Developer') || line.includes('Manager') || line.includes('Analyst') || line.includes('Designer') || line.includes('Lead') || line.includes('Senior') || line.includes('Junior'))) {
      experience.push({
        company: line.split(',')[0]?.split(/\d{4}/)[0]?.trim() || 'Company',
        title: line,
        duration: 'Recent',
        description: lines[i + 1]?.trim() || ''
      });
    }
  }
  return experience.slice(0, 5);
}

// Extract education
function extractEducation(text) {
  const education = [];
  const degreePatterns = [
    /Ph\.?D|M\.?S\.?|M\.?A\.?|B\.?S\.?|B\.?A\.?|M\.?Sc\.?|B\.?Sc\.?|Diploma/gi
  ];
  
  degreePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(degree => {
        education.push({
          degree: degree,
          institution: 'Unknown',
          year: ''
        });
      });
    }
  });
  
  return education.slice(0, 3);
}

// Extract certifications
function extractCertifications(text) {
  const certPatterns = [
    /\b(PMP|ACP|CSM|CCP|SCJP|OCP|MCSA|MCSE|AWS|Azure|GCP|Google|Apple|Microsoft|Oracle|Cisco|CompTIA)\b[^\n]*/gi
  ];
  
  const certs = [];
  certPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      certs.push(...matches);
    }
  });
  
  return [...new Set(certs)].slice(0, 10);
}

// Analyze formatting quality
function analyzeFormatting(text) {
  return {
    hasBulletPoints: text.includes('•') || text.includes('-') || text.includes('*'),
    hasNumbers: /\d+\./.test(text),
    sectionHeaders: (text.match(/^[A-Z\s]+$/gm) || []).length,
    hasQuantifiedAchievements: /\d+%|\d+[xx]?|\$\d+|\d+\s+(years?|months?|projects?|clients?|users?|customers?|percent|%)/i.test(text),
    hasActionVerbs: /^(led|managed|developed|created|implemented|designed|built|launched|increased|decreased|improved|achieved|orchestrated|delivered)/gim.test(text),
    consistentFormatting: true,
    avgLineLength: 50
  };
}

// ATS Analysis Endpoint - Async to support Firestore saving
router.post('/analyze', async (req, res) => {
  console.log('ATS endpoint called');
  
  let db = null;
  try {
    const dbModule = require('../config/firebase');
    db = dbModule.db;
  } catch (e) {
    console.warn('Firebase not available for ATS:', e.message);
  }
  
  try {
    const { resumeText, jobDescription, userId } = req.body;
    
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }
    
    console.log('Resume text length:', resumeText.length);
    console.log('Job description provided:', !!jobDescription);
    
    // Detect sector based on job description or resume
    const sectorKey = detectSector(jobDescription || resumeText);
    const sectorData = sectorDemands[sectorKey] || sectorDemands['technology'];
    
    console.log('Detected sector:', sectorData.name);
    
    // Extract resume data
    const contact = extractContact(resumeText);
    const skills = extractSkills(resumeText);
    const experience = extractExperience(resumeText);
    const education = extractEducation(resumeText);
    const certifications = extractCertifications(resumeText);
    const formatting = analyzeFormatting(resumeText);
    
    // Extract job keywords if provided
    let jobKeywords = [];
    let requiredSkills = [];
    let jobSector = sectorKey;
    
    if (jobDescription && jobDescription.trim()) {
      jobKeywords = extractSkills(jobDescription);
      requiredSkills = jobKeywords;
      jobSector = detectSector(jobDescription);
      console.log('Job description sector:', jobSector);
    }
    
    // Calculate scores
    let keywordMatch = 0;
    let missingKeywords = [];
    let matchedKeywords = [];
    
    if (jobKeywords.length > 0) {
      matchedKeywords = skills.filter(s => 
        jobKeywords.some(kw => 
          kw.toLowerCase().includes(s.toLowerCase()) || 
          s.toLowerCase().includes(kw.toLowerCase())
        )
      );
      missingKeywords = jobKeywords.filter(kw => 
        !skills.some(s => 
          s.toLowerCase().includes(kw.toLowerCase()) || 
          kw.toLowerCase().includes(s.toLowerCase())
        )
      );
      keywordMatch = Math.round((matchedKeywords.length / jobKeywords.length) * 100);
    } else {
      // Compare against sector demands
      const sectorHotSkills = sectorData.hotSkills.map(s => s.toLowerCase());
      matchedKeywords = skills.filter(s => sectorHotSkills.includes(s.toLowerCase()));
      missingKeywords = sectorHotSkills.filter(s => !skills.some(rs => rs.toLowerCase().includes(s)));
      keywordMatch = Math.min(100, Math.round((matchedKeywords.length / Math.max(sectorHotSkills.length, 1)) * 100));
    }
    
    // Format score
    const formatScore = formatting.hasBulletPoints ? 
      (formatting.hasActionVerbs ? 90 : 75) : 
      (formatting.hasNumbers ? 60 : 50);
    
    // Completeness score
    let completeness = 0;
    if (contact.email) completeness += 20;
    if (contact.phone) completeness += 15;
    if (contact.name) completeness += 10;
    if (skills.length > 0) completeness += 20;
    if (experience.length > 0) completeness += 20;
    if (education.length > 0) completeness += 15;
    
    const wordCount = resumeText.split(/\s+/).length;
    const contentQuality = wordCount >= 300 && wordCount <= 2000 ? 80 : 
                          wordCount >= 150 && wordCount <= 3000 ? 70 : 50;
    
    // Calculate overall score
    const overallScore = Math.round(
      (keywordMatch * 0.30) +
      (formatScore * 0.25) +
      (completeness * 0.25) +
      (contentQuality * 0.20)
    );
    
    // Generate improvements
    const improvements = [];
    
    if (missingKeywords.length > 0) {
      improvements.push({
        category: 'Keywords',
        priority: keywordMatch < 70 ? 'high' : 'medium',
        suggestion: `Add these in-demand skills: ${missingKeywords.slice(0, 5).join(', ')}`,
        details: `These skills are${jobDescription ? ' required for the job' : ` highly demanded in the ${sectorData.name} sector`}.`
      });
    }
    
    if (completeness < 75) {
      improvements.push({
        category: 'Completeness',
        priority: 'high',
        suggestion: 'Add more details to your resume',
        details: 'Include contact info, skills, experience, and education for a complete profile.'
      });
    }
    
    if (!formatting.hasBulletPoints) {
      improvements.push({
        category: 'Formatting',
        priority: 'medium',
        suggestion: 'Use bullet points for achievements',
        details: 'Bullet points make your resume scannable and easier for recruiters to read.'
      });
    }
    
    if (!formatting.hasQuantifiedAchievements) {
      improvements.push({
        category: 'Content',
        priority: 'medium',
        suggestion: 'Quantify your achievements with numbers',
        details: 'Use percentages, numbers, and metrics to demonstrate impact (e.g., "increased sales by 25%").'
      });
    }
    
    if (!formatting.hasActionVerbs) {
      improvements.push({
        category: 'Content',
        priority: 'low',
        suggestion: 'Start bullet points with strong action verbs',
        details: 'Use verbs like Led, Developed, Implemented, Achieved to show impact.'
      });
    }
    
    if (wordCount < 300) {
      improvements.push({
        category: 'Content',
        priority: 'medium',
        suggestion: 'Add more content to your resume',
        details: 'A good resume is typically 300-2000 words. Add more relevant details.'
      });
    }
    
    // Build comprehensive response with India-specific market data
    const analysis = {
      overallScore,
      sectorAnalysis: {
        detectedSector: sectorData.name,
        sectorDemand: sectorData.demandLevel,
        hotSkills: sectorData.hotSkills,
        trendingRoles: sectorData.trendingRoles,
        matchedHotSkills: matchedKeywords.filter(s => 
          sectorData.hotSkills.some(hs => hs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(hs.toLowerCase()))
        ),
        missingHotSkills: missingKeywords.filter(kw => 
          sectorData.hotSkills.some(hs => hs.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(hs.toLowerCase()))
        ),
        // India-specific data
        salaryRanges: sectorData.salaryRanges,
        topCities: sectorData.topCities,
        growthRate: sectorData.growthRate,
        marketInsights: {
          entryLevelSalary: sectorData.salaryRanges?.entry || '₹3-6 LPA',
          midLevelSalary: sectorData.salaryRanges?.mid || '₹6-15 LPA',
          seniorLevelSalary: sectorData.salaryRanges?.senior || '₹15-35 LPA',
          topHiringCities: sectorData.topCities || ['Major Metro Cities'],
          industryGrowth: sectorData.growthRate || '15%'
        }
      },
      parsedResume: {
        contact,
        summary: null,
        experience,
        education,
        skills: {
          technical: skills,
          soft: [],
          tools: []
        },
        certifications,
        projects: [],
        languages: [],
        sectionsFound: ['contact', 'skills', 'experience'].filter(s => 
          s === 'contact' && Object.keys(contact).length > 0 ||
          s === 'skills' && skills.length > 0 ||
          s === 'experience' && experience.length > 0
        ),
        formatting,
        wordCount,
        charCount: resumeText.length
      },
      scores: {
        keywordMatch,
        formatScore,
        completeness,
        contentQuality,
        sectionsPresent: Math.round((['contact', 'skills', 'experience', 'education', 'certifications'].filter(s => 
          s === 'contact' && Object.keys(contact).length > 0 ||
          s === 'skills' && skills.length > 0 ||
          s === 'experience' && experience.length > 0 ||
          s === 'education' && education.length > 0 ||
          s === 'certifications' && certifications.length > 0
        ).length / 5) * 100)
      },
      missingKeywords: missingKeywords.slice(0, 10),
      matchedKeywords: matchedKeywords.slice(0, 10),
      improvements,
      atsRecommendation: overallScore >= 80 ? 'Excellent - Ready to apply' : 
                          overallScore >= 60 ? 'Good - Minor improvements recommended' : 
                          'Needs work - Address improvements before applying'
    };
    
    console.log('ATS analysis complete, score:', overallScore);
    console.log('Sector:', sectorData.name, 'Demand:', sectorData.demandLevel);
    
    // Save to Firestore if userId provided
    if (userId && db) {
      try {
        const userDocRef = db.collection('users').doc(userId);
        
        // Get existing data to preserve
        const existingDoc = await userDocRef.get();
        const existingData = existingDoc.exists() ? existingDoc.data() : {};
        
        await userDocRef.set({
          ...existingData,
          resumeText: resumeText, // Save the resume text for report generation
          atsAnalysis: analysis,
          lastAnalysisDate: new Date().toISOString(),
          lastResumeUpdate: new Date().toISOString()
        }, { merge: true });
        console.log('Resume text and ATS analysis saved to Firestore for user:', userId);
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
      }
    }
    
    res.json(analysis);
    
  } catch (error) {
    console.error('ATS error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze resume', 
      details: error.message 
    });
  }
});

// Get sector information
router.get('/sectors', (req, res) => {
  res.json({
    sectors: Object.entries(sectorDemands).map(([key, data]) => ({
      id: key,
      ...data
    }))
  });
});

module.exports = router;
