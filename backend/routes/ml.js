const express = require('express');
const router = express.Router();
const axios = require('axios');
let db = null;
try {
  const dbModule = require('../config/firebase');
  db = dbModule.db;
} catch (e) {
  console.warn('Firebase DB not available:', e.message);
}
const fs = require('fs');
const path = require('path');

// Hugging Face Inference API endpoint
const HF_API_URL = 'https://api-inference.huggingface.co/models';

// Check if HuggingFace API key is available
const hasHFKey = process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY.length > 0;

// Models to use
const MODELS = {
  TEXT_GENERATION: 'google/flan-t5-base',
  CLASSIFICATION: 'facebook/bart-large-mnli',
  NER: 'dslim/bert-base-NER'
};

// Load occupations data
let occupationsData = null;
let lastLoadError = null;
function loadOccupations() {
  if (!occupationsData) {
    try {
      const occupationsPath = path.join(__dirname, '../data/occupations.json');
      console.log('Loading occupations from:', occupationsPath);
      
      // Check if file exists
      if (!fs.existsSync(occupationsPath)) {
        throw new Error('occupations.json file not found');
      }
      
      const fileContent = fs.readFileSync(occupationsPath, 'utf8');
      occupationsData = JSON.parse(fileContent);
      console.log('Loaded occupations successfully, sectors:', occupationsData.sectors?.length);
    } catch (error) {
      lastLoadError = error.message;
      console.error('Error loading occupations:', error.message);
      // Return minimal fallback data
      occupationsData = {
        sectors: [
          { id: "tech", name: "Technology", icon: "💻" },
          { id: "medical", name: "Medical", icon: "🏥" },
          { id: "arts-media", name: "Arts & Media", icon: "🎨" },
          { id: "business", name: "Business", icon: "💼" }
        ],
        occupations: []
      };
    }
  }
  return occupationsData;
}

// Helper function to call Hugging Face API
async function callHuggingFaceAPI(model, inputs) {
  if (!hasHFKey) {
    throw new Error('HuggingFace API key not configured');
  }
  
  try {
    const response = await axios.post(`${HF_API_URL}/${model}`, {
      inputs,
      options: { wait_for_model: true }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error('Hugging Face API error:', error.response?.data || error.message);
    throw new Error('ML service temporarily unavailable');
  }
}

// =====================================================
// SECTOR-BASED DYNAMIC QUESTION GENERATION (Akinator-style)
// Uses occupation-specific questions from dataset
// POST /api/ml/generate-question
// =====================================================
router.post('/generate-question', async (req, res) => {
  try {
    const { questionCount, answers, extractedTraits, userId, activeSectors } = req.body;

    // Load occupations data
    const data = loadOccupations();
    const sectors = data.sectors;
    const occupations = data.occupations;

    // If first question, ask about broad sector interests
    if (questionCount === 0) {
      return res.json({
        question: "Which career area are you most interested in?",
        options: sectors.map(s => ({
          id: s.id,
          label: `${s.icon} ${s.name}`,
          sector: s.id
        })),
        questionType: "sector-selection",
        questionNumber: 1,
        questionId: "sector-selection",
        activeSectors: sectors.map(s => s.id),
        description: "Select a sector to discover matching career paths"
      });
    }

    // Process sector selection from previous answer
    let currentSector = null;
    if (answers && answers.length > 0) {
      const lastAnswer = answers[answers.length - 1];
      currentSector = lastAnswer?.selectedOption?.sector || null;
    }

    // If still no sector, return error
    if (!currentSector) {
      return res.json({
        question: "Which career area are you most interested in?",
        options: sectors.map(s => ({
          id: s.id,
          label: `${s.icon} ${s.name}`,
          sector: s.id
        })),
        questionType: "sector-selection",
        questionNumber: 1,
        questionId: "sector-selection",
        activeSectors: sectors.map(s => s.id)
      });
    }

    // Get occupations in the selected sector
    const sectorOccupations = occupations.filter(occ => occ.sector === currentSector);

    if (sectorOccupations.length === 0) {
      return res.json({
        question: "What type of work interests you most?",
        options: [
          { id: "tech", label: "💻 Technology and software", sector: "tech" },
          { id: "creative", label: "🎨 Creative and design", sector: "arts-media" },
          { id: "business", label: "💼 Business and finance", sector: "business" },
          { id: "healthcare", label: "🏥 Healthcare and medical", sector: "medical" }
        ],
        questionType: "sector-selection",
        questionNumber: 1,
        questionId: "sector-fallback"
      });
    }

    // Find next question from occupations in this sector
    // Each occupation has questions - we'll cycle through them
    const allSectorQuestions = [];
    sectorOccupations.forEach(occ => {
      if (occ.questions && occ.questions.length > 0) {
        occ.questions.forEach(q => {
          allSectorQuestions.push({
            ...q,
            occupationId: occ.id,
            occupationTitle: occ.title,
            sector: currentSector
          });
        });
      }
    });

    // Filter out questions already answered
    const answeredQuestionIds = answers.map(a => a.questionId).filter(Boolean);
    const availableQuestions = allSectorQuestions.filter(q => 
      !answeredQuestionIds.includes(q.id)
    );

    // If we have no more unique questions or enough data, show recommendations
    if (availableQuestions.length === 0 || answers.length >= 4) {
      // Calculate final recommendations based on all answers
      const recommendations = calculateOccupationMatches(answers, sectorOccupations);
      
      return res.json({
        question: `Based on your interests in ${currentSector}, here are your top career matches:`,
        options: recommendations.slice(0, 5).map(rec => ({
          id: rec.id,
          label: `${rec.title} (${rec.match}% match)`,
          occupation: rec
        })),
        questionType: "final-recommendation",
        questionNumber: answers.length + 1,
        questionId: "final-recommendation",
        activeSectors: [currentSector],
        isComplete: true,
        recommendations: recommendations.slice(0, 5),
        allMatches: recommendations
      });
    }

    // Get the next question (first available one)
    const nextQuestion = availableQuestions[0];

    res.json({
      question: nextQuestion.question,
      options: nextQuestion.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        score: opt.score || 3,
        traitCategory: nextQuestion.traitCategory,
        questionId: nextQuestion.id,
        occupationId: nextQuestion.occupationId,
        occupationTitle: nextQuestion.occupationTitle
      })),
      questionType: "occupation-specific",
      questionNumber: answers.length + 1,
      activeSectors: [currentSector],
      questionId: nextQuestion.id,
      occupationContext: nextQuestion.occupationTitle,
      description: `This helps determine your fit for ${nextQuestion.occupationTitle} roles`
    });

  } catch (error) {
    console.error('Question generation error:', error);
    // Fallback
    const fallbackQuestion = {
      question: "What type of work interests you most?",
      options: [
        { id: "tech", label: "💻 Technology and software", sector: "tech" },
        { id: "creative", label: "🎨 Creative and design", sector: "arts-media" },
        { id: "business", label: "💼 Business and finance", sector: "business" },
        { id: "healthcare", label: "🏥 Healthcare and medical", sector: "medical" }
      ]
    };
    res.json({ ...fallbackQuestion, questionNumber: 1, questionType: "fallback", questionId: "fallback" });
  }
});

// Calculate occupation matches based on user answers
function calculateOccupationMatches(answers, sectorOccupations) {
  // Initialize scores for each occupation
  const occupationScores = {};
  sectorOccupations.forEach(occ => {
    occupationScores[occ.id] = {
      id: occ.id,
      title: occ.title,
      description: occ.description,
      salaryRange: occ.salaryRange,
      growthPotential: occ.growthPotential,
      requiredSkills: occ.requiredSkills,
      sector: occ.sector,
      score: 0,
      maxScore: 0,
      matchingAnswers: []
    };
  });

  // Process each answer
  answers.forEach(answer => {
    const selectedOption = answer.selectedOption;
    if (!selectedOption) return;

    const answerScore = selectedOption.score || 3;
    const traitCategory = selectedOption.traitCategory;
    const occupationId = selectedOption.occupationId;

    // If this answer is tied to a specific occupation
    if (occupationId && occupationScores[occupationId]) {
      occupationScores[occupationId].score += answerScore;
      occupationScores[occupationId].maxScore += 4; // Max score per question
      occupationScores[occupationId].matchingAnswers.push(answer.question);
    } else {
      // Generic answer - score all occupations in sector
      Object.values(occupationScores).forEach(occ => {
        // Check if the answer's trait matches occupation's interests
        const relevantInterests = answer.question.toLowerCase();
        const hasMatch = occ.interests?.some(interest => 
          relevantInterests.includes(interest.toLowerCase())
        );
        if (hasMatch) {
          occ.score += answerScore;
        }
        occ.maxScore += 4;
      });
    }
  });

  // Calculate final match percentages and sort
  const results = Object.values(occupationScores)
    .map(occ => ({
      ...occ,
      match: occ.maxScore > 0 ? Math.round((occ.score / occ.maxScore) * 100) : 0,
      reason: occ.matchingAnswers.length > 0 
        ? `Matches your responses about ${occ.matchingAnswers[0]}`
        : `Fits your ${occ.sector} sector interest`
    }))
    .sort((a, b) => b.match - a.match);

  return results;
}

// =====================================================
// 2. TRAIT EXTRACTION (User Profile Building)
// POST /api/ml/extract-traits
// =====================================================
router.post('/extract-traits', async (req, res) => {
  try {
    const { answer, previousTraits, sectorAnswers } = req.body;

    if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    let extractedTraits;

    // Use sector-based trait extraction if we have sector answers
    if (sectorAnswers && sectorAnswers.length > 0) {
      extractedTraits = extractTraitsFromSectorAnswers(sectorAnswers, answer, previousTraits);
    } else {
      // Fallback trait extraction
      extractedTraits = extractTraitsFromAnswer(answer, previousTraits);
    }

    // Merge with previous traits
    const mergedTraits = mergeTraits(previousTraits || {}, extractedTraits);

    res.json({ 
      traits: mergedTraits,
      newTraits: extractedTraits,
      source: 'sector-based'
    });
  } catch (error) {
    console.error('Trait extraction error:', error);
    const fallbackTraits = extractTraitsFromAnswer(req.body.answer, req.body.previousTraits);
    res.json({ 
      traits: mergeTraits(req.body.previousTraits || {}, fallbackTraits),
      newTraits: fallbackTraits,
      source: 'fallback-error'
    });
  }
});

// Extract traits from sector-based answers
function extractTraitsFromSectorAnswers(sectorAnswers, latestAnswer, previousTraits = {}) {
  const extracted = {
    skills: previousTraits?.skills || [],
    interests: previousTraits?.interests || [],
    personality: previousTraits?.personality || [],
    workStyle: previousTraits?.workStyle || [],
    experienceLevel: previousTraits?.experienceLevel || 5,
    sectors: previousTraits?.sectors || [],
    sectorDetails: previousTraits?.sectorDetails || {}
  };

  // Process all sector answers
  sectorAnswers.forEach(answer => {
    if (answer.sector) {
      if (!extracted.sectors.includes(answer.sector)) {
        extracted.sectors.push(answer.sector);
      }
      extracted.sectorDetails[answer.sector] = answer;
    }
    
    if (answer.workStyle) {
      if (!extracted.workStyle.includes(answer.workStyle)) {
        extracted.workStyle.push(answer.workStyle);
      }
    }
    
    if (answer.interest) {
      if (!extracted.interests.includes(answer.interest)) {
        extracted.interests.push(answer.interest);
      }
    }
    
    if (answer.motivation) {
      if (!extracted.personality.includes(answer.motivation)) {
        extracted.personality.push(answer.motivation);
      }
    }
  });

  // Also process latest answer
  if (latestAnswer) {
    if (latestAnswer.sector && !extracted.sectors.includes(latestAnswer.sector)) {
      extracted.sectors.push(latestAnswer.sector);
      extracted.sectorDetails[latestAnswer.sector] = latestAnswer;
    }
    if (latestAnswer.workStyle && !extracted.workStyle.includes(latestAnswer.workStyle)) {
      extracted.workStyle.push(latestAnswer.workStyle);
    }
  }

  return extracted;
}

// Fallback trait extraction using keyword analysis
function extractTraitsFromAnswer(answer, previousTraits = {}) {
  const answerLower = answer.toLowerCase();
  
  // Skill keywords
  const skillKeywords = {
    technical: ['code', 'program', 'software', 'data', 'analysis', 'system', 'computer', 'technology', 'debug', 'algorithm'],
    creative: ['design', 'art', 'creative', 'visual', 'brand', 'content', 'write', 'video', 'photo', 'story'],
    leadership: ['lead', 'manage', 'team', 'mentor', 'direct', 'coordinate', 'organize', 'plan', 'strategy'],
    communication: ['present', 'speak', 'communicate', 'explain', 'teach', 'train', 'client', 'customer', 'negotiate'],
    analytical: ['research', 'analyze', 'measure', 'evaluate', 'test', 'study', 'explore', 'investigate', 'model']
  };

  // Interest keywords  
  const interestKeywords = {
    technology: ['tech', 'software', 'app', 'digital', 'ai', 'machine', 'innovation'],
    business: ['business', 'money', 'profit', 'market', 'sales', 'startup', 'entrepreneur'],
    healthcare: ['health', 'medical', 'patient', 'wellness', 'doctor', 'nurse', 'therapy'],
    education: ['teach', 'learn', 'student', 'training', 'coach', 'mentor', 'knowledge'],
    arts: ['art', 'design', 'music', 'film', 'theater', 'creative', 'culture'],
    science: ['science', 'research', 'lab', 'experiment', 'discover', 'biology', 'physics']
  };

  // Work style keywords
  const workStyleKeywords = {
    independent: ['alone', 'independent', 'own', 'autonomy', 'self'],
    collaborative: ['team', 'together', 'collaborate', 'group', 'share'],
    structured: ['plan', 'schedule', 'organize', 'routine', 'process'],
    flexible: ['flexible', 'adapt', 'change', 'dynamic', 'variety'],
    fastPaced: ['fast', 'quick', 'deadline', 'busy', 'urgent']
  };

  const extracted = {
    skills: previousTraits?.skills || [],
    interests: previousTraits?.interests || [],
    personality: previousTraits?.personality || [],
    workStyle: previousTraits?.workStyle || [],
    experienceLevel: previousTraits?.experienceLevel || 5
  };

  // Extract skills
  Object.entries(skillKeywords).forEach(([category, keywords]) => {
    if (keywords.some(kw => answerLower.includes(kw)) && !extracted.skills.includes(category)) {
      extracted.skills.push(category);
    }
  });

  // Extract interests
  Object.entries(interestKeywords).forEach(([category, keywords]) => {
    if (keywords.some(kw => answerLower.includes(kw)) && !extracted.interests.includes(category)) {
      extracted.interests.push(category);
    }
  });

  // Extract work style
  Object.entries(workStyleKeywords).forEach(([category, keywords]) => {
    if (keywords.some(kw => answerLower.includes(kw)) && !extracted.workStyle.includes(category)) {
      extracted.workStyle.push(category);
    }
  });

  return extracted;
}

// Merge new traits with previous
function mergeTraits(previous, current) {
  return {
    skills: [...new Set([...(previous.skills || []), ...(current.skills || [])])],
    interests: [...new Set([...(previous.interests || []), ...(current.interests || [])])],
    personality: [...new Set([...(previous.personality || []), ...(current.personality || [])])],
    workStyle: [...new Set([...(previous.workStyle || []), ...(current.workStyle || [])])],
    experienceLevel: current.experienceLevel || previous.experienceLevel || 5,
    sectors: [...new Set([...(previous.sectors || []), ...(current.sectors || [])])],
    sectorDetails: { ...(previous.sectorDetails || {}), ...(current.sectorDetails || {}) }
  };
}

// =====================================================
// 3. FINAL AI ANALYSIS - CAREER RECOMMENDATIONS
// POST /api/ml/career-recommendations
// =====================================================
router.post('/career-recommendations', async (req, res) => {
  try {
    const { profile, userId } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'Profile is required' });
    }

    const { skills = [], interests = [], personality = [], workStyle = [], experienceLevel = 5, sectors = [], sectorDetails = {} } = profile;

    // Load occupations
    const data = loadOccupations();
    const occupations = data.occupations;
    const allSectors = data.sectors;

    // Calculate match scores based on sectors and traits
    const matchedOccupations = occupations.map(occupation => {
      let score = 0;
      let matchReasons = [];
      
      // Heavy weight for sector match
      if (sectors && sectors.includes(occupation.sector)) {
        score += 40;
        matchReasons.push(`In ${occupation.sector} sector`);
      }
      
      // Match interests
      if (interests && interests.length > 0) {
        occupation.interests.forEach(interest => {
          if (interests.some(i => i.toLowerCase() === interest.toLowerCase())) {
            score += 15;
            matchReasons.push(`Matches your interest in ${interest}`);
          }
        });
      }
      
      // Match work style
      if (workStyle && workStyle.length > 0) {
        occupation.workStyle.forEach(style => {
          if (workStyle.some(w => w.toLowerCase() === style.toLowerCase())) {
            score += 10;
            matchReasons.push(`Fits your ${style} work style`);
          }
        });
      }
      
      // Match skills
      if (skills && skills.length > 0) {
        const matchedSkills = occupation.requiredSkills.filter(skill => 
          skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        );
        if (matchedSkills.length > 0) {
          score += matchedSkills.length * 5;
          matchReasons.push(`You have ${matchedSkills.length} relevant skills`);
        }
      }
      
      return {
        ...occupation,
        matchScore: Math.min(100, Math.max(0, score)),
        matchReasons: matchReasons.slice(0, 3)
      };
    });
    
    // Sort by match score and return top results
    const sorted = matchedOccupations
      .filter(o => o.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    const recommendations = sorted.map(occ => ({
      title: occ.title,
      description: occ.description,
      match: occ.matchScore,
      salaryRange: occ.salaryRange,
      growthPotential: occ.growthPotential,
      requiredSkills: occ.requiredSkills,
      reason: occ.matchReasons[0] || `Matches your ${sectors[0] || 'selected'} profile`,
      sector: occ.sector
    }));

    // Store results in Firestore if userId provided
    if (userId) {
      try {
        const userDocRef = db.collection('users').doc(userId);
        await userDocRef.set({
          aiAssessment: {
            profile,
            recommendations,
            matchedOccupations: sorted,
            completedAt: new Date().toISOString(),
            assessmentVersion: '3.0'
          }
        }, { merge: true });
        console.log('Assessment stored in Firestore for user:', userId);
      } catch (firestoreError) {
        console.error('Firestore storage error:', firestoreError);
      }
    }

    res.json({ 
      recommendations,
      source: 'sector-based-matching'
    });
  } catch (error) {
    console.error('Career recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// =====================================================
// 4. RESUME ANALYSIS
// POST /api/ml/analyze-resume
// =====================================================
router.post('/analyze-resume', async (req, res) => {
  try {
    const { text, userId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    let entities, skills, summary, extractedProfile;

    // Fallback skill extraction
    skills = extractSkillsFallback(text);
    summary = generateSummaryFallback(text);
    extractedProfile = {
      skills: skills.slice(0, 5),
      interests: inferInterestsFromText(text),
      personality: [],
      workStyle: inferWorkStyleFromText(text),
      experienceLevel: estimateExperienceLevel(text)
    };
    entities = { fallback: true, skills };

    // Store initial profile from resume in Firestore
    if (userId && extractedProfile) {
      try {
        const userDocRef = db.collection('users').doc(userId);
        await userDocRef.set({
          initialProfile: extractedProfile
        }, { merge: true });
      } catch (firestoreError) {
        console.error('Error storing initial profile:', firestoreError);
      }
    }

    res.json({
      entities,
      skills,
      summary,
      profile: extractedProfile,
      source: 'fallback'
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    const fallbackSkills = extractSkillsFallback(req.body.text || '');
    res.json({
      entities: { fallback: true, skills: fallbackSkills },
      skills: fallbackSkills,
      summary: 'Resume analysis completed with basic analysis.',
      profile: {
        skills: fallbackSkills.slice(0, 5),
        interests: [],
        personality: [],
        workStyle: [],
        experienceLevel: 5
      },
      source: 'fallback-error'
    });
  }
});

// =====================================================
// TEST ENDPOINT - Simple test to verify ATS is working
// =====================================================
router.post('/test-ats', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'ATS endpoint is working!', received: req.body });
});

// =====================================================
// 4B. ADVANCED ATS RESUME ANALYSIS
// POST /api/ml/ats-analyze
// =====================================================
router.post('/ats-analyze', async (req, res) => {
  try {
    const { resumeText, jobDescription, userId } = req.body;

    console.log('ATS analyze endpoint hit');

    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    console.log('Starting ATS analysis, text length:', resumeText.length);
    
    // Parse resume comprehensively
    const parsedResume = parseResumeAdvanced(resumeText);
    console.log('Resume parsed, sections found:', parsedResume.sectionsFound.length);
    
    // Parse job description if provided
    let jobKeywords = [];
    let requiredSkills = [];
    if (jobDescription && jobDescription.trim()) {
      const parsedJob = parseJobDescription(jobDescription);
      jobKeywords = parsedJob.keywords;
      requiredSkills = parsedJob.requiredSkills;
      console.log('Job parsed, keywords:', jobKeywords.length);
    }

    // Calculate ATS scores
    const atsScores = calculateATSScores(parsedResume, jobKeywords, requiredSkills);
    console.log('Scores calculated');

    // Generate detailed analysis
    const analysis = generateATSAnalysis(parsedResume, atsScores, jobKeywords, requiredSkills);
    console.log('Analysis generated, overall score:', analysis.overallScore);

    console.log('ATS analysis completed successfully, sending response');
    
    res.json(analysis);
  } catch (error) {
    console.error('ATS analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze resume', 
      details: error.message
    });
  }
});

// Advanced resume parsing function
function parseResumeAdvanced(text) {
  const sections = identifySections(text);
  
  return {
    // Contact Information
    contact: extractContactInfo(text),
    // Professional Summary
    summary: extractSummary(text),
    // Work Experience
    experience: extractExperience(text),
    // Education
    education: extractEducation(text),
    // Skills (technical and soft)
    skills: extractAllSkills(text),
    // Certifications
    certifications: extractCertifications(text),
    // Projects
    projects: extractProjects(text),
    // Languages
    languages: extractLanguages(text),
    // Detected sections
    sectionsFound: sections,
    // Formatting analysis
    formatting: analyzeFormatting(text),
    // Word count
    wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
    // Character count
    charCount: text.length
  };
}

// Identify resume sections
function identifySections(text) {
  const sectionPatterns = {
    'summary': /^(professional summary|profile|career objective|objective|about me)[:\s]/gim,
    'experience': /^(work experience|employment|professional experience|work history|employment history)[:\s]/gim,
    'education': /^(education|academic|qualification|degree)[:\s]/gim,
    'skills': /^(skills|technical skills|core competencies|competencies|technologies)[:\s]/gim,
    'projects': /^(projects|key projects|personal projects)[:\s]/gim,
    'certifications': /^(certifications|certificates|licenses|credentials)[:\s]/gim,
    'languages': /^(languages|language proficiency)[:\s]/gim
  };

  const found = [];
  Object.keys(sectionPatterns).forEach(section => {
    if (sectionPatterns[section].test(text)) {
      found.push(section);
    }
  });
  return found;
}

// Extract contact information
function extractContactInfo(text) {
  const info = {};
  
  // Email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emailMatch) info.email = emailMatch[0];
  
  // Phone extraction
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
  if (phoneMatch) info.phone = phoneMatch[0];
  
  // LinkedIn extraction
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/gi);
  if (linkedinMatch) info.linkedin = linkedinMatch[0];
  
  // Location extraction
  const locationMatch = text.match(/([A-Z][a-z]+,?\s+[A-Z]{2}|[A-Z][a-z]+,?\s+[A-Z][a-z]+)/g);
  if (locationMatch) info.location = locationMatch[0];
  
  // Name extraction (first line that's not a section header)
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (!firstLine.includes('@') && !firstLine.match(/\d{3}/) && firstLine.length < 50) {
      info.name = firstLine;
    }
  }
  
  return info;
}

// Extract professional summary
function extractSummary(text) {
  const summaryPatterns = [
    /(?:professional summary|profile|career objective|objective)[:\s]*([\s\S]{50,300}?)(?:\n\n|Experience|Education|Skills)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)\s*,\s*([\s\S]{50,150}?)(?:\n|Experience|Education)/i
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0];
  }
  return null;
}

// Extract work experience
function extractExperience(text) {
  const experience = [];
  
  // Pattern: Company, Date Range, Description
  const expPattern = /([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Ltd|Corp|Company)?)\s*,?\s*([A-Z][a-z]+(?:\s+\d{4})?(?:\s*[-–]\s*(?:present|current|\d{4}))?)\s*\n?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*,?\s*([\s\S]{20,200}?)(?=\n\n|[A-Z][a-z]+\s+,|Education|Skills|Projects)/gi;
  
  let match;
  while ((match = expPattern.exec(text)) !== null && experience.length < 10) {
    experience.push({
      company: match[1].trim(),
      title: match[3].trim(),
      duration: match[2].trim(),
      description: match[4].trim().substring(0, 200)
    });
  }
  
  // Alternative simpler pattern
  if (experience.length === 0) {
    const simplePattern = /(?:\n|^)([A-Z][a-zA-Z\s&]+)\s*,?\s*([\s\S]{10,100}?)(?=\n\n|\n\n[A-Z])/g;
    while ((match = simplePattern.exec(text)) !== null && experience.length < 5) {
      if (match[1].length > 3 && match[1].length < 50) {
        experience.push({
          company: match[1].trim(),
          title: 'Position',
          duration: match[2].trim().substring(0, 30),
          description: ''
        });
      }
    }
  }
  
  return experience;
}

// Extract education
function extractEducation(text) {
  const education = [];
  
  // Degree patterns
  const degreePatterns = [
    /(?:Ph\.?D|Doctorate|M\.?S\.?|M\.?A\.?|B\.?S\.?|B\.?A\.?|M\.?Sc\.?|B\.?Sc\.?|Diploma)\s+(?:in\s+)?([A-Z][a-zA-Z\s]+?)(?:,|\s+from|\s+at|\s+-)\s*([A-Z][a-zA-Z\s,]+?)(?:,|\s+(?:\d{4}|present|current))/gi,
    /([A-Z][a-zA-Z\s]+(?:University|College|Institute|School))\s*,?\s*([A-Z][a-zA-Z\s]+(?:Degree|Diploma|Bachelor|Master|PhD)?)/gi
  ];
  
  let match;
  for (const pattern of degreePatterns) {
    while ((match = pattern.exec(text)) !== null && education.length < 5) {
      education.push({
        degree: match[1].trim(),
        institution: match[2].trim(),
        year: ''
      });
    }
    if (education.length > 0) break;
  }
  
  return education;
}

// Extract all skills (technical + soft)
function extractAllSkills(text) {
  const technicalSkills = extractSkillsFallback(text);
  
  // Soft skills patterns
  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical',
    'time management', 'project management', 'strategic planning', 'mentoring',
    'collaboration', 'adaptability', 'creativity', 'critical thinking'
  ];
  
  const foundSoftSkills = softSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  // Tools & Software
  const toolsPatterns = [
    /\b(Photoshop|Illustrator|InDesign|Figma|Sketch|AutoCAD|MATLAB|SPSS|SAS|Tableau|Power BI|Excel|Word|PowerPoint|Outlook|SAP|Oracle|Salesforce|HubSpot|Mailchimp|Google Analytics|SEMrush|Ahrefs)\b/gi
  ];
  
  const tools = [];
  toolsPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) tools.push(...matches);
  });
  
  return {
    technical: [...new Set(technicalSkills)],
    soft: foundSoftSkills,
    tools: [...new Set(tools)]
  };
}

// Extract certifications
function extractCertifications(text) {
  const certPatterns = [
    /(?:Certified|Certification|Certificate)\s+([A-Z][a-zA-Z\s]+?)(?:\s+,|\s+from|\s+-|\s+\d{4})/gi,
    /\b(PMP|ACP|CSM|CCP|SCJP|OCP|MCSA|MCSE|AWS|Azure|GCP|Google|Apple|Microsoft)\s+([A-Z][a-zA-Z\s]+?)(?:\s|,|$)/gi
  ];
  
  const certs = [];
  let match;
  for (const pattern of certPatterns) {
    while ((match = pattern.exec(text)) !== null && certs.length < 10) {
      certs.push(match[0].trim());
    }
  }
  
  return [...new Set(certs)];
}

// Extract projects
function extractProjects(text) {
  const projects = [];
  const projectPattern = /([A-Z][a-zA-Z\s]{3,50})\s*:?\s*([\s\S]{20,150}?)(?=\n\n|\n[A-Z]|Skills|Experience)/gi;
  
  let match;
  while ((match = projectPattern.exec(text)) !== null && projects.length < 5) {
    if (match[1].toLowerCase().includes('project')) {
      projects.push({
        name: match[1].trim(),
        description: match[2].trim().substring(0, 150)
      });
    }
  }
  
  return projects;
}

// Extract languages
function extractLanguages(text) {
  const languages = [];
  const langPattern = /\b(English|Hindi|Tamil|Telugu|Marathi|Bengali|Gujarati|Kannada|Malayalam|Punjabi|Chinese|Spanish|French|German|Japanese|Korean|Arabic|Portuguese|Russian)\b/gi;
  
  const levels = ['native', 'fluent', 'professional', 'conversational', 'beginner', 'intermediate', 'advanced'];
  
  let match;
  while ((match = langPattern.exec(text)) !== null) {
    const lang = match[0];
    const context = text.substring(Math.max(0, match.index - 20), match.index + lang.length + 30);
    let proficiency = 'conversational';
    
    levels.forEach(level => {
      if (context.toLowerCase().includes(level)) {
        proficiency = level;
      }
    });
    
    languages.push({ language: lang, proficiency });
  }
  
  return languages;
}

// Analyze formatting
function analyzeFormatting(text) {
  const analysis = {
    hasBulletPoints: text.includes('•') || text.includes('-') || text.includes('*'),
    hasNumbers: /\d+\./.test(text),
    sectionHeaders: identifySections(text).length,
    hasQuantifiedAchievements: /\d+%|\d+[xx]?|\$\d+|\d+\s+(years?|months?|projects?|clients?|users?|customers?)/i.test(text),
    hasActionVerbs: /^(led|managed|developed|created|implemented|designed|built|launched|increased|decreased|improved|achieved)/gim.test(text),
    consistentFormatting: true, // Simplified check
    avgLineLength: 0
  };
  
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0) {
    const totalLength = lines.reduce((sum, line) => sum + line.length, 0);
    analysis.avgLineLength = Math.round(totalLength / lines.length);
  }
  
  return analysis;
}

// Parse job description
function parseJobDescription(text) {
  if (!text || typeof text !== 'string') {
    return { keywords: [], requiredSkills: [] };
  }
  
  const keywords = extractSkillsFallback(text);
  
  // Extract required skills with weights
  const requiredSkills = [];
  const skillPatterns = [
    /required\s+skills?[:\s]*([\s\S]{50,300})/gi,
    /must\s+have[:\s]*([\s\S]{50,300})/gi,
    /qualifications[:\s]*([\s\S]{50,300})/gi,
    /preferred[:\s]*([\s\S]{50,300})/gi
  ];
  
  skillPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      const skills = extractSkillsFallback(match[1] || '');
      requiredSkills.push(...skills);
    }
  });
  
  return {
    keywords: [...new Set(keywords)],
    requiredSkills: [...new Set(requiredSkills)]
  };
}

// Calculate ATS scores
function calculateATSScores(resume, jobKeywords, requiredSkills) {
  const scores = {
    keywordMatch: 0,
    formatScore: 0,
    completeness: 0,
    contentQuality: 0,
    sectionsPresent: 0
  };
  
  // Keyword match score
  const resumeSkills = [...resume.skills.technical, ...resume.skills.soft, ...resume.skills.tools];
  const allJobKeywords = [...jobKeywords, ...requiredSkills];
  
  if (allJobKeywords.length > 0) {
    const matched = resumeSkills.filter(skill => 
      allJobKeywords.some(kw => kw.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(kw.toLowerCase()))
    );
    scores.keywordMatch = Math.round((matched.length / allJobKeywords.length) * 100);
  } else {
    // Default if no job description
    scores.keywordMatch = Math.min(100, resumeSkills.length * 10);
  }
  
  // Format score
  let formatPoints = 0;
  if (resume.formatting.hasBulletPoints) formatPoints += 25;
  if (resume.formatting.hasQuantifiedAchievements) formatPoints += 25;
  if (resume.formatting.hasActionVerbs) formatPoints += 25;
  if (resume.formatting.sectionHeaders >= 5) formatPoints += 25;
  scores.formatScore = formatPoints;
  
  // Completeness score
  let completenessPoints = 0;
  if (resume.contact.email) completenessPoints += 15;
  if (resume.contact.phone) completenessPoints += 15;
  if (resume.summary) completenessPoints += 15;
  if (resume.experience.length > 0) completenessPoints += 20;
  if (resume.education.length > 0) completenessPoints += 15;
  if (resume.skills.technical.length > 0) completenessPoints += 20;
  scores.completeness = completenessPoints;
  
  // Content quality
  let qualityPoints = 0;
  if (resume.wordCount >= 300 && resume.wordCount <= 2000) qualityPoints += 30;
  else if (resume.wordCount < 300) qualityPoints += 10;
  else qualityPoints += 20;
  
  if (resume.experience.length >= 2) qualityPoints += 35;
  else if (resume.experience.length >= 1) qualityPoints += 20;
  
  if (resume.formatting.hasQuantifiedAchievements) qualityPoints += 35;
  scores.contentQuality = qualityPoints;
  
  // Sections present
  scores.sectionsPresent = Math.round((resume.sectionsFound.length / 7) * 100);
  
  return scores;
}

// Generate detailed ATS analysis
function generateATSAnalysis(resume, scores, jobKeywords, requiredSkills) {
  // Calculate overall score
  const overallScore = Math.round(
    (scores.keywordMatch * 0.30) +
    (scores.formatScore * 0.25) +
    (scores.completeness * 0.25) +
    (scores.contentQuality * 0.20)
  );
  
  // Determine missing keywords
  const resumeSkills = [...resume.skills.technical, ...resume.skills.soft, ...resume.skills.tools].map(s => s.toLowerCase());
  const allJobKeywords = [...jobKeywords, ...requiredSkills];
  const missingKeywords = allJobKeywords.filter(kw => 
    !resumeSkills.some(s => s.includes(kw.toLowerCase()) || kw.toLowerCase().includes(s))
  );
  
  // Generate improvements
  const improvements = [];
  
  if (scores.keywordMatch < 70) {
    improvements.push({
      category: 'Keywords',
      priority: 'high',
      suggestion: `Add these missing keywords: ${missingKeywords.slice(0, 5).join(', ')}`,
      details: 'ATS systems require exact keyword matches. Include skills mentioned in the job description.'
    });
  }
  
  if (!resume.contact.email) {
    improvements.push({
      category: 'Contact Information',
      priority: 'high',
      suggestion: 'Add your email address',
      details: 'Contact information is essential for ATS parsing and recruiters.'
    });
  }
  
  if (!resume.contact.phone) {
    improvements.push({
      category: 'Contact Information',
      priority: 'high',
      suggestion: 'Add your phone number',
      details: 'Recruiters prefer candidates they can reach quickly.'
    });
  }
  
  if (!resume.summary) {
    improvements.push({
      category: 'Professional Summary',
      priority: 'medium',
      suggestion: 'Add a professional summary (2-3 sentences)',
      details: 'A strong summary immediately tells recruiters your value proposition.'
    });
  }
  
  if (!resume.formatting.hasBulletPoints) {
    improvements.push({
      category: 'Formatting',
      priority: 'medium',
      suggestion: 'Use bullet points for achievements',
      details: 'Bullet points make your resume scannable and easier to read.'
    });
  }
  
  if (!resume.formatting.hasQuantifiedAchievements) {
    improvements.push({
      category: 'Content',
      priority: 'medium',
      suggestion: 'Quantify your achievements with numbers, percentages, or metrics',
      details: 'Numbers catch attention and provide evidence of your impact.'
    });
  }
  
  if (resume.experience.length < 2) {
    improvements.push({
      category: 'Experience',
      priority: 'medium',
      suggestion: 'Add more relevant work experience',
      details: '2+ positions show career progression and relevant experience.'
    });
  }
  
  if (!resume.formatting.hasActionVerbs) {
    improvements.push({
      category: 'Content',
      priority: 'low',
      suggestion: 'Start bullet points with strong action verbs',
      details: 'Verbs like Led, Developed, Implemented show impact and initiative.'
    });
  }
  
  return {
    overallScore,
    parsedResume: resume,
    scores,
    missingKeywords: missingKeywords.slice(0, 10),
    matchedKeywords: allJobKeywords.filter(kw => 
      resumeSkills.some(s => s.includes(kw.toLowerCase()) || kw.toLowerCase().includes(s))
    ).slice(0, 10),
    improvements,
    atsRecommendation: overallScore >= 80 ? 'Excellent - Ready to apply' : 
                        overallScore >= 60 ? 'Good - Minor improvements recommended' : 
                        'Needs work - Address improvements before applying'
  };
}

// Helper functions
function extractSkillsFallback(text) {
  const skillPatterns = [
    /\b(JavaScript|Java|Python|React|Angular|Vue|Node|Express|TypeScript|C\+\+|C#|Ruby|Go|Rust)\b/gi,
    /\b(Spring|Django|Flask|Laravel|Next\.js|Flutter|React Native)\b/gi,
    /\b(MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Firebase)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|GitLab|Terraform)\b/gi,
    /\b(TensorFlow|PyTorch|Keras|Scikit|Pandas|Numpy)\b/gi,
    /\b(Git|HTML|CSS|REST|GraphQL|JIRA|Agile|Scrum)\b/gi
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

function generateSummaryFallback(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    return sentences.slice(0, 2).join('. ') + '.';
  }
  return text.substring(0, 200) + '...';
}

function inferInterestsFromText(text) {
  const textLower = text.toLowerCase();
  const interests = [];
  
  if (textLower.includes('data') || textLower.includes('analytics')) interests.push('analytics');
  if (textLower.includes('design') || textLower.includes('creative')) interests.push('creative');
  if (textLower.includes('lead') || textLower.includes('manage')) interests.push('leadership');
  if (textLower.includes('code') || textLower.includes('software')) interests.push('technical');
  if (textLower.includes('research') || textLower.includes('science')) interests.push('science');
  
  return [...new Set(interests)];
}

function inferWorkStyleFromText(text) {
  const textLower = text.toLowerCase();
  const workStyles = [];
  
  if (textLower.includes('team') || textLower.includes('collaborate')) workStyles.push('collaborative');
  if (textLower.includes('independent') || textLower.includes('autonomous')) workStyles.push('independent');
  if (textLower.includes('agile') || textLower.includes('fast')) workStyles.push('fast-paced');
  
  return workStyles;
}

function estimateExperienceLevel(text) {
  const textLower = text.toLowerCase();
  const yearPatterns = text.match(/\d+\s*years?/gi) || [];
  const totalYears = yearPatterns.reduce((sum, match) => {
    const years = parseInt(match.match(/\d+/)[0]);
    return sum + years;
  }, 0);
  
  if (totalYears >= 10) return 9;
  if (totalYears >= 7) return 7;
  if (totalYears >= 5) return 6;
  if (totalYears >= 3) return 4;
  if (totalYears >= 1) return 3;
  return 2;
}

// =====================================================
// 5. GET ALL OCCUPATIONS
// GET /api/ml/occupations
// =====================================================
router.get('/occupations', async (req, res) => {
  try {
    const data = loadOccupations();
    
    res.json({
      occupations: data.occupations,
      sectors: data.sectors,
      categories: data.categories
    });
  } catch (error) {
    console.error('Error loading occupations:', error);
    res.status(500).json({ error: 'Failed to load occupations' });
  }
});

// =====================================================
// 6. MATCH OCCUPATIONS TO USER PROFILE
// POST /api/ml/match-occupations
// =====================================================
router.post('/match-occupations', async (req, res) => {
  try {
    const { profile, limit = 10 } = req.body;
    
    if (!profile) {
      return res.status(400).json({ error: 'Profile is required' });
    }

    const { skills = [], interests = [], personality = [], workStyle = [], sectors = [] } = profile;
    
    // Load occupations
    const data = loadOccupations();
    const occupations = data.occupations;
    
    // Calculate match scores for each occupation
    const matchedOccupations = occupations.map(occupation => {
      let score = 0;
      let matchReasons = [];
      
      // Sector match (highest weight)
      if (sectors && sectors.includes(occupation.sector)) {
        score += 40;
        matchReasons.push(`In ${occupation.sector} sector`);
      }
      
      // Match interests
      occupation.interests.forEach(interest => {
        if (interests && interests.some(i => i.toLowerCase() === interest.toLowerCase())) {
          score += 20;
          matchReasons.push(`Matches your interest in ${interest}`);
        }
      });
      
      // Match work style
      occupation.workStyle.forEach(style => {
        if (workStyle && workStyle.some(w => w.toLowerCase() === style.toLowerCase())) {
          score += 15;
          matchReasons.push(`Fits your ${style} work style`);
        }
      });
      
      // Match skills
      const matchedSkills = occupation.requiredSkills.filter(skill => 
        skills && skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
      if (matchedSkills.length > 0) {
        score += matchedSkills.length * 10;
        matchReasons.push(`You have ${matchedSkills.length} relevant skills`);
      }
      
      return {
        ...occupation,
        matchScore: Math.min(100, Math.max(0, score)),
        matchReasons: matchReasons.slice(0, 3)
      };
    });
    
    // Sort by match score and return top results
    const sorted = matchedOccupations
      .filter(o => o.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
    
    res.json({
      matchedOccupations: sorted,
      total: sorted.length
    });
  } catch (error) {
    console.error('Error matching occupations:', error);
    res.status(500).json({ error: 'Failed to match occupations' });
  }
});

// =====================================================
// 7. SAVE COMPLETE ASSESSMENT
// POST /api/ml/save-assessment
// =====================================================
router.post('/save-assessment', async (req, res) => {
  try {
    const { 
      userId, 
      profile, 
      answers, 
      recommendations, 
      matchedOccupations,
      questionPatterns 
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Prepare assessment data
    const assessmentData = {
      profile: profile || {},
      answers: answers || [],
      recommendations: recommendations || [],
      matchedOccupations: matchedOccupations || [],
      completedAt: new Date().toISOString(),
      assessmentVersion: '3.0'
    };

    // Store in Firestore
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.set({
      aiAssessment: assessmentData,
      lastAssessmentDate: new Date().toISOString(),
      lastAssessmentVersion: '3.0'
    }, { merge: true });

    res.json({
      success: true,
      message: 'Assessment saved successfully',
      assessmentId: userId
    });
  } catch (error) {
    console.error('Error saving assessment:', error);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

// =====================================================
// 8. GET USER ASSESSMENT HISTORY
// GET /api/ml/assessment-history/:userId
// =====================================================
router.get('/assessment-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
      return res.json({ history: [], currentAssessment: null });
    }

    const userData = userDoc.data();
    
    res.json({
      currentAssessment: userData.aiAssessment || null,
      lastAssessmentDate: userData.lastAssessmentDate || null,
      assessmentVersion: userData.lastAssessmentVersion || null
    });
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({ error: 'Failed to fetch assessment history' });
  }
});

// =====================================================
// INTERVIEW QUESTION GENERATION
// POST /api/ml/generate-questions
// =====================================================
router.post('/generate-questions', async (req, res) => {
  try {
    const { role, skills, difficulty = 'intermediate', count = 5 } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    // Generate role-specific questions based on the role and skills
    const questions = generateInterviewQuestions(role, skills, difficulty, count);
    
    res.json({
      questions,
      role,
      count: questions.length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// Generate interview questions based on role
function generateInterviewQuestions(role, skills = [], difficulty = 'intermediate', count = 5) {
  const roleQuestions = {
    'Software Engineer': {
      technical: [
        'Describe your experience with [SKILL]. How did you implement it in a project?',
        'Explain a complex debugging challenge you faced and how you solved it.',
        'How do you ensure code quality and follow best practices?',
        'Describe your experience with system design for scalable applications.',
        'How do you handle code reviews and incorporate feedback?',
        'Explain the difference between SQL and NoSQL databases.',
        'Describe your experience with RESTful APIs and microservices.',
        'How do you approach performance optimization?'
      ],
      behavioral: [
        'Tell me about a time you had to learn a new technology quickly.',
        'Describe a situation where you had to work with a difficult team member.',
        'How do you handle tight deadlines and pressure?',
        'Give an example of a project you are most proud of.',
        'How do you prioritize tasks when working on multiple features?'
      ]
    },
    'Data Scientist': {
      technical: [
        'Explain the difference between supervised and unsupervised learning.',
        'How do you handle overfitting in machine learning models?',
        'Describe your experience with feature engineering.',
        'What techniques do you use for model validation?',
        'Explain how you would approach a classification problem with imbalanced classes.',
        'Describe your experience with deep learning frameworks.',
        'How do you communicate complex findings to non-technical stakeholders?',
        'What is your approach to selecting the right model for a problem?'
      ],
      behavioral: [
        'Tell me about a data project where you had to deal with messy data.',
        'Describe a time your analysis led to a significant business decision.',
        'How do you stay updated with the latest in data science?',
        'Give an example of how you translated data insights into action.'
      ]
    },
    'Product Manager': {
      technical: [
        'How do you prioritize features in a product roadmap?',
        'Describe your experience with user research and gathering requirements.',
        'How do you measure product success?',
        'Explain how you would conduct A/B testing for a feature.',
        'How do you handle competing priorities from stakeholders?',
        'Describe your experience with Agile product development.',
        'How do you determine which features to build next?',
        'Explain your approach to writing product requirements.'
      ],
      behavioral: [
        'Tell me about a product you launched from concept to release.',
        'Describe a time you had to make a tough prioritization decision.',
        'How do you handle feedback from users that conflicts with your vision?',
        'Give an example of how you used data to inform product decisions.'
      ]
    },
    'UX Designer': {
      technical: [
        'Walk me through your design process from concept to delivery.',
        'How do you conduct user research and usability testing?',
        'Describe your experience with design systems.',
        'How do you handle feedback and iterate on designs?',
        'Explain your approach to accessibility in design.',
        'How do you prioritize features in a design?',
        'Describe your experience with prototyping tools.',
        'How do you measure the success of a design?'
      ],
      behavioral: [
        'Tell me about a challenging user problem you solved.',
        'Describe a time you had to defend your design decisions.',
        'How do you handle conflicting feedback from stakeholders?',
        'Give an example of how you incorporated user feedback into a design.'
      ]
    },
    'DevOps Engineer': {
      technical: [
        'Describe your experience with CI/CD pipelines.',
        'How do you handle infrastructure as code?',
        'Explain your approach to monitoring and alerting.',
        'Describe your experience with Docker and Kubernetes.',
        'How do you ensure security in your deployment process?',
        'Explain incident management and post-mortem processes.',
        'How do you handle database migrations in production?',
        'Describe your experience with AWS, Azure, or GCP.'
      ],
      behavioral: [
        'Tell me about a time you improved deployment processes.',
        'Describe how you handled a critical production incident.',
        'How do you balance speed and stability in deployments?',
        'Give an example of how you reduced system downtime.'
      ]
    },
    'Frontend Developer': {
      technical: [
        'Explain the difference between React, Vue, and Angular.',
        'How do you optimize web application performance?',
        'Describe your experience with state management.',
        'How do you ensure responsive design across devices?',
        'Explain your approach to CSS architecture.',
        'Describe your experience with web accessibility.',
        'How do you handle browser compatibility issues?',
        'Explain the concept of virtual DOM.'
      ],
      behavioral: [
        'Tell me about a challenging UI implementation you built.',
        'Describe how you handled a difficult bug in production.',
        'How do you stay updated with new frontend technologies?',
        'Give an example of how you improved user experience.'
      ]
    },
    'Backend Developer': {
      technical: [
        'Explain REST vs GraphQL APIs.',
        'How do you handle authentication and authorization?',
        'Describe your experience with database design.',
        'How do you ensure API security?',
        'Explain your approach to error handling and logging.',
        'Describe your experience with message queues.',
        'How do you handle caching in applications?',
        'Explain microservices vs monolithic architecture.'
      ],
      behavioral: [
        'Tell me about a complex backend system you built.',
        'Describe how you optimized database queries.',
        'How do you handle API versioning?',
        'Give an example of how you scaled an application.'
      ]
    },
    'Full Stack Developer': {
      technical: [
        'Describe your experience with both frontend and backend development.',
        'How do you handle database design and API development?',
        'Explain your approach to full-stack application architecture.',
        'How do you ensure consistent code quality across the stack?',
        'Describe your experience with deployment and DevOps.',
        'How do you choose the right technology stack for a project?',
        'Explain how you handle authentication across frontend and backend.',
        'How do you test full-stack applications?'
      ],
      behavioral: [
        'Tell me about a full-stack project you built from scratch.',
        'Describe how you handled a complex feature requiring both frontend and backend.',
        'How do you prioritize frontend vs backend improvements?',
        'Give an example of how you optimized a full-stack application.'
      ]
    },
    'Machine Learning Engineer': {
      technical: [
        'Explain the ML model deployment process.',
        'How do you handle model versioning and monitoring?',
        'Describe your experience with MLOps practices.',
        'How do you optimize models for production?',
        'Explain your approach to feature store implementation.',
        'Describe experience with distributed training.',
        'How do you handle data drift in production models?',
        'Explain model serving architectures.'
      ],
      behavioral: [
        'Tell me about an ML project you deployed to production.',
        'Describe how you handled a model that was not performing well.',
        'How do you balance model complexity with performance?',
        'Give an example of how you reduced inference latency.'
      ]
    },
    'Project Manager': {
      technical: [
        'Describe your experience with Agile and Waterfall methodologies.',
        'How do you create and manage project schedules?',
        'Explain your approach to risk management.',
        'How do you handle scope creep?',
        'Describe your experience with project management tools.',
        'How do you manage stakeholder expectations?',
        'Explain your approach to resource allocation.',
        'How do you measure project success?'
      ],
      behavioral: [
        'Tell me about a project that did not go as planned and how you handled it.',
        'Describe how you managed a difficult stakeholder.',
        'How do you motivate a team during challenging times?',
        'Give an example of how you delivered a project on time and under budget.'
      ]
    }
  };

  // Default questions for unknown roles
  const defaultQuestions = {
    technical: [
      'Tell me about your experience with the key skills required for this role.',
      'Describe a challenging project you worked on and your role in it.',
      'How do you stay updated with industry trends?',
      'Describe your problem-solving approach.',
      'How do you handle tight deadlines?',
      'Tell me about a time you had to learn something new quickly.',
      'Describe your collaboration experience with cross-functional teams.',
      'What tools and technologies are you most proficient in?'
    ],
    behavioral: [
      'Tell me about yourself and your background.',
      'What are your greatest strengths and weaknesses?',
      'Why are you interested in this role?',
      'Where do you see yourself in 5 years?',
      'Describe a time you had a conflict with a coworker.',
      'Give an example of a goal you achieved and how you did it.'
    ]
  };

  // Get questions for the specific role or use defaults
  const roleQ = roleQuestions[role] || defaultQuestions;
  const technicalQuestions = roleQ.technical || defaultQuestions.technical;
  const behavioralQuestions = roleQ.behavioral || defaultQuestions.behavioral;

  // Shuffle and combine questions
  const shuffledTechnical = technicalQuestions.sort(() => Math.random() - 0.5);
  const shuffledBehavioral = behavioralQuestions.sort(() => Math.random() - 0.5);
  
  // Mix technical and behavioral questions
  const combined = [];
  const techCount = Math.ceil(count * 0.6); // 60% technical
  const behavCount = count - techCount;
  
  for (let i = 0; i < Math.max(techCount, behavCount); i++) {
    if (i < techCount && shuffledTechnical[i]) combined.push(shuffledTechnical[i]);
    if (i < behavCount && shuffledBehavioral[i]) combined.push(shuffledBehavioral[i]);
  }

  // Add skill-specific questions if skills provided
  if (skills && skills.length > 0) {
    skills.slice(0, 3).forEach(skill => {
      if (!combined.some(q => q.includes('[SKILL]') || q.toLowerCase().includes(skill.toLowerCase()))) {
        combined.push('Describe your experience with ' + skill + '. What projects have you built using it?');
      }
    });
  }

  // Replace [SKILL] placeholder with actual skills
  return combined.slice(0, count).map(q => 
    q.replace('[SKILL]', skills[0] || 'this technology')
  );
}

// =====================================================
// AI INTERVIEW RESPONSE ANALYSIS
// POST /api/ml/analyze-response
// =====================================================
router.post('/analyze-response', async (req, res) => {
  try {
    const { question, response, role } = req.body;
    
    if (!question || !response) {
      return res.status(400).json({ error: 'Question and response are required' });
    }
    
    // Analyze the response
    const analysis = analyzeInterviewResponse(question, response, role);
    
    res.json(analysis);
  } catch (error) {
    console.error('Response analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze response' });
  }
});

// Analyze interview response
function analyzeInterviewResponse(question, response, role) {
  const analysis = {
    score: 0,
    strengths: [],
    improvements: [],
    starAnalysis: {
      situation: false,
      task: false,
      action: false,
      result: false,
      score: 0
    },
    keywords: [],
    sentiment: 'neutral',
    length: response.length,
    feedback: ''
  };

  // Check response length
  if (response.length < 50) {
    analysis.score += 10;
    analysis.improvements.push('Response is too short. Add more details to demonstrate your experience.');
  } else if (response.length >= 100 && response.length <= 500) {
    analysis.score += 30;
  } else if (response.length > 500) {
    analysis.score += 20;
    analysis.improvements.push('Response is quite long. Try to be more concise while covering key points.');
  }

  // STAR method analysis
  const starIndicators = {
    situation: ['situation', 'context', 'background', 'when', 'where', 'team', 'project', 'company'],
    task: ['task', 'challenge', 'responsibility', 'role', 'goal', 'objective', 'needed'],
    action: ['action', 'did', 'created', 'developed', 'implemented', 'led', 'managed', 'worked', 'collaborated', 'analyzed', 'built', 'designed'],
    result: ['result', 'outcome', 'achieved', 'increased', 'decreased', 'improved', 'reduced', 'saved', 'delivered', 'completed', 'successful']
  };

  const responseLower = response.toLowerCase();
  
  Object.entries(starIndicators).forEach(([key, indicators]) => {
    const hasIndicator = indicators.some(ind => responseLower.includes(ind));
    if (hasIndicator) {
      analysis.starAnalysis[key] = true;
      analysis.starAnalysis.score += 25;
    }
  });

  // Check for quantification
  const hasNumbers = /\d+/.test(response);
  const hasPercent = /%|percent|percentage/.test(responseLower);
  const hasMoney = /\$|rs|inr|lakhs?|crores?/i.test(responseLower);
  
  if (hasNumbers) {
    analysis.score += 10;
    analysis.strengths.push('Includes quantifiable metrics');
    analysis.keywords.push('quantitative');
  }
  if (hasPercent || hasMoney) {
    analysis.score += 10;
    analysis.strengths.push('Mentions specific numbers/values');
  }

  // Role-specific keyword matching
  const roleKeywords = {
    'Software Engineer': ['code', 'developer', 'programming', 'software', 'api', 'database', 'system', 'application', 'framework'],
    'Data Scientist': ['data', 'analysis', 'model', 'machine learning', 'algorithm', 'insights', 'statistics', 'python', 'analytics'],
    'Product Manager': ['product', 'roadmap', 'stakeholder', 'user', 'feature', 'requirement', 'prioritize', 'metrics'],
    'UX Designer': ['design', 'user', 'interface', 'experience', 'prototype', 'wireframe', 'usability', 'research'],
    'DevOps': ['deployment', 'infrastructure', 'ci/cd', 'automation', 'cloud', 'docker', 'kubernetes', 'pipeline']
  };

  const keywords = roleKeywords[role] || roleKeywords[Object.keys(roleKeywords).find(k => role?.toLowerCase().includes(k.toLowerCase())) || ''] || [];
  const foundKeywords = keywords.filter(kw => responseLower.includes(kw));
  
  if (foundKeywords.length > 0) {
    analysis.score += foundKeywords.length * 5;
    analysis.strengths.push('Uses relevant role terminology');
    analysis.keywords.push(...foundKeywords);
  }

  // Action verbs check
  const strongVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'designed', 'built', 'launched', 'achieved', 'improved', 'increased', 'reduced', 'optimized', 'transformed', 'established'];
  const weakVerbs = ['was', 'did', 'had', 'made', 'got'];
  
  const hasStrongVerb = strongVerbs.some(v => responseLower.includes(v));
  const hasWeakVerb = weakVerbs.some(v => responseLower.match(new RegExp('\\b' + v + '\\b')));
  
  if (hasStrongVerb) {
    analysis.score += 10;
    analysis.strengths.push('Uses strong action verbs');
  }
  if (hasWeakVerb && !hasStrongVerb) {
    analysis.improvements.push('Use stronger action verbs to describe your achievements');
  }

  // Determine sentiment
  const positiveWords = ['achieved', 'success', 'improved', 'increased', 'excellent', 'great', 'proud', 'accomplished'];
  const negativeWords = ['failed', 'problem', 'issue', 'difficult', 'challenge', 'hard'];
  
  const positiveCount = positiveWords.filter(w => responseLower.includes(w)).length;
  const negativeCount = negativeWords.filter(w => responseLower.includes(w)).length;
  
  if (positiveCount > negativeCount) analysis.sentiment = 'positive';
  else if (negativeCount > positiveCount) analysis.sentiment = 'neutral';

  // Generate overall score (max 100)
  analysis.score = Math.min(100, analysis.score);

  // Generate feedback
  if (analysis.score >= 90) {
    analysis.feedback = 'Excellent response! Well-structured with clear examples and quantifiable results. Great use of the STAR method.';
  } else if (analysis.score >= 75) {
    analysis.feedback = 'Strong response! Consider adding more specific metrics and results to strengthen your answer.';
  } else if (analysis.score >= 60) {
    analysis.feedback = 'Good attempt. Try using the STAR method more explicitly and include quantifiable achievements.';
  } else {
    analysis.feedback = 'Keep practicing! Focus on providing specific situations, actions, and measurable results.';
  }

  // Add STAR-specific feedback
  const missingStar = [];
  if (!analysis.starAnalysis.situation) missingStar.push('Situation');
  if (!analysis.starAnalysis.task) missingStar.push('Task');
  if (!analysis.starAnalysis.action) missingStar.push('Action');
  if (!analysis.starAnalysis.result) missingStar.push('Result');
  
  if (missingStar.length > 0 && missingStar.length < 4) {
    analysis.improvements.push('Try to include all STAR elements: ' + missingStar.join(', '));
  }

  return analysis;
}

module.exports = router;
