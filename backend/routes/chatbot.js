const express = require('express');
const router = express.Router();
const axios = require('axios');

// Configuration
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const hasHFKey = HF_API_KEY && HF_API_KEY.length > 0;

// Use the v1/chat/completions endpoint
const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';

// Model that works with free tier
const MODEL = 'meta-llama/Llama-3.2-1B-Instruct';

router.post('/chat', async (req, res) => {
  try {
    const { message, role, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Chat request:', message.substring(0, 30));
    const targetRole = role || 'Software Engineer';

    // Build messages array for OpenAI-compatible format
    const messages = [
      {
        role: 'system',
        content: `You are an AI Interview Coach. Help job seekers prepare for ${targetRole} interviews.
        
Guidelines:
- Be encouraging and supportive
- Provide specific, actionable advice
- Use the STAR method (Situation, Task, Action, Result) for behavioral questions
- Suggest questions to ask interviewers
- Keep responses conversational but professional
- Ask follow-up questions when appropriate

Help the user with their interview preparation.`
      }
    ];

    // Add conversation history
    if (history && Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    let aiResponse = null;

    // Try using HuggingFace API
    if (hasHFKey) {
      try {
        console.log('Calling HuggingFace API...');
        
        const response = await axios.post(
          HF_API_URL,
          {
            model: MODEL,
            messages: messages,
            max_tokens: 200,
            temperature: 0.7,
            top_p: 0.9
          },
          {
            headers: {
              'Authorization': `Bearer ${HF_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 60000
          }
        );

        if (response.data && response.data.choices && response.data.choices[0]) {
          const content = response.data.choices[0].message.content;
          if (content && content.length > 10) {
            console.log('Success with HuggingFace API');
            aiResponse = {
              success: true,
              message: content,
              model: MODEL,
              timestamp: new Date().toISOString()
            };
          }
        }
      } catch (hfError) {
        console.log('HuggingFace API error:', hfError.response?.status || hfError.message);
      }
    }

    // If we got a response, return it
    if (aiResponse) {
      return res.json(aiResponse);
    }

    // Fallback to intelligent response system
    console.log('Using intelligent fallback');
    const fallbackResponse = generateSmartResponse(message, targetRole, history);
    
    res.json({
      success: true,
      message: fallbackResponse,
      model: 'intelligent-fallback',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Chat error',
      message: 'I apologize, but I encountered an error. Please try again.'
    });
  }
});

// Intelligent fallback system
function generateSmartResponse(message, role, history) {
  const msg = message.toLowerCase();
  const targetRole = role || 'Software Engineer';
  
  const hasHistory = history && history.length > 2;
  
  // Context-aware responses
  if (hasHistory) {
    const lastMessage = history[history.length - 1];
    if (lastMessage?.sender === 'ai') {
      if (msg.includes('yes') || msg.includes('sure') || msg.includes('okay') || msg.includes('ok')) {
        return `Great! Let's continue. Think of a specific example from your experience that relates to this.\n\nUse STAR:\n• **S**ituation: What was the context?\n• **T**ask: What was your responsibility?\n• **A**ction: What did YOU specifically do?\n• **R**esult: What was the outcome with numbers?\n\nTake your time to think, then share your answer and I'll give you feedback!`;
      }
      
      if (msg.includes('no') || msg.includes('not') || msg.includes('skip')) {
        return `No problem! Let's try a different question.\n\nHere's another common interview question: "Tell me about a time you had to deal with a difficult situation at work."\n\nWant to practice this one, or would you prefer a different topic?`;
      }
    }
  }

  // Keyword-based responses
  if (msg.includes('tell me about yourself') || msg.includes('introduce') || msg.includes('walk me through')) {
    return `Perfect question! Structure your answer in 3 parts:\n\n**1. Present (30 sec)**: "${targetRole} at [Company], specializing in [skills]..."\n\n**2. Past (30 sec)**: "Started career at [place], worked on [achievements]..."\n\n**3. Future (30 sec)**: "Excited about this role because [reasons]..."\n\n**Pro tip**: Focus on what's relevant to the job. Practice this out loud!\n\nWant me to help you draft your specific answer?`;
  }

  if (msg.includes('strength')) {
    return `For "${targetRole}" roles, top strengths to highlight:\n\n1. **Problem-solving** - "Identified a bug that saved $10K..."\n2. **Communication** - "Explained complex concepts to non-technical team..."\n3. **Teamwork** - "Led cross-functional collaboration..."\n\nChoose 2-3 that match the job description. Use a real example with metrics!\n\nWhat are your top skills? I can help you pick the best ones!`;
  }

  if (msg.includes('weakness')) {
    return `Smart to prepare for this! Here's the strategy:\n\n**Pick a real weakness** that's not critical for the job.\n\n**Show improvement**: "I'm working on [weakness] - recently [specific action]..."\n\n**Examples**:\n• "Public speaking - joined Toastmasters, gave 3 presentations this year"\n• "Time management - using Notion to track tasks, improved by 30%"\n\nAvoid: "I'm a perfectionist" (cliché)\n\nWould you like help picking the right weakness for ${targetRole}?`;
  }

  if (msg.includes('why') && (msg.includes('role') || msg.includes('company') || msg.includes('this position'))) {
    return `To answer "Why this role/company?":\n\n**1. Show research**: "After researching [Company], I was impressed by their [specific thing]..."\n\n**2. Match your experience**: "My background in [skills] aligns perfectly with [requirement]..."\n\n**3. Show enthusiasm**: "This role excites me because [specific reason]..."\n\n**Avoid**: Generic answers like "great company" or "good salary"\n\nWhat company are you interviewing with? I can help you find specific things to mention!`;
  }

  if (msg.includes('star') || msg.includes('behavioral') || msg.includes('example') || msg.includes('tell me about a time')) {
    return `STAR Method breakdown:\n\n**S - Situation**: "At [Company], our team faced [challenge]..."\n\n**T - Task**: "I was responsible for [specific task]..."\n\n**A - Action**: "I [specific actions]... (Focus on YOUR role, not the team's)\n\n**R - Result**: "This led to [measurable outcome] - 25% improvement, $50K saved, etc."\n\n**Pro tip**: Prepare 5-7 stories covering: leadership, conflict, failure, success, problem-solving\n\nReady to practice one? Tell me about a challenge you've overcome!`;
  }

  if (msg.includes('salary') || msg.includes('compensation') || msg.includes('expect') || msg.includes('pay')) {
    return `Salary negotiation guide:\n\n**Before interview**:\n• Check Glassdoor, Payscale for ${targetRole} in [your city]\n• Know your minimum acceptable\n\n**In interview**:\n• Early question: "I'd like to learn more about the role first"\n• Later: "Based on research, I expect [range]"\n\n**Negotiation**:\n• Never accept first offer immediately\n• Consider total comp: benefits, equity, PTO\n• Practice your talking points\n\nWould you like help calculating a realistic range?`;
  }

  if (msg.includes('question') && (msg.includes('ask') || msg.includes('you have'))) {
    return `Great questions to ask interviewers:\n\n**About the role**:\n• "What does success look like in 6 months?"\n• "What's the biggest challenge the team faces?"\n• "How has this position evolved?"\n\n**About team**:\n• "Can you tell me about the team I'd work with?"\n• "What's the collaboration style?"\n\n**Growth**:\n• "What opportunities for learning exist?"\n• "Typical career path for this role?"\n\n**Avoid**: Salary in first interview (unless they bring it up)\n\nWhich type interests you most?`;
  }

  if (msg.includes('nervous') || msg.includes('anxious') || msg.includes('scared') || msg.includes('worried')) {
    return `Totally normal to feel nervous! Here's what helps:\n\n**Before**:\n• Practice mock interviews (with me or a friend)\n• Prepare thoroughly - confidence comes from prep\n• Get 7-8 hours sleep\n\n**During**:\n• Take deep breaths between questions\n• It's a two-way conversation - you're also interviewing them\n• Pause to think before answering (that's okay!)\n\n**Mindset shift**:\n• Every interview is practice\n• They're already impressed enough to talk to you\n\nWant to do a quick practice run?`;
  }

  if (msg.includes('thank you') || msg.includes('follow up') || msg.includes('after interview')) {
    return `Post-interview follow-up steps:\n\n**Same day (within 24 hours)**:\nSend personalized email to each interviewer:\n\n"Dear [Name], Thank you for meeting today. I enjoyed discussing [specific topic]. I'm excited about [specific aspect] of the role. [Reiterate your value]. Looking forward to hearing from you."\n\n**Wait 1 week**, then follow up politely if no response.\n\n**Key**: Personal notes with specific conversation details set you apart!\n\nWant me to help you draft a thank-you note?`;
  }

  if (msg.includes('conflict') || msg.includes('disagree') || msg.includes('difficult person')) {
    return `Handling conflict questions:\n\n**Structure**:\n1. Brief context (1-2 sentences)\n2. Your approach (how you handled it professionally)\n3. Resolution (what happened)\n4. What you learned\n\n**Example**: "A colleague and I disagreed on the technical approach. I scheduled a 1:1, listened to their reasoning with data, shared my perspective, and we found a hybrid solution that improved delivery by 20%."\n\n**Key**: Show maturity, communication, and finding common ground.\n\nWant to practice structuring your own experience?`;
  }

  if (msg.includes('fail') || msg.includes('mistake') || msg.includes('wrong')) {
    return `Great question - shows self-awareness! Here's how to handle it:\n\n**Choose real failure** that's not critical to the role.\n\n**Structure**:\n1. What happened (brief)\n2. What you learned\n3. How you improved\n\n**Example**: "I missed a deadline early in my career because of poor estimation. I learned project management basics, now I build in 30% buffer and communicate proactively. Haven't missed since."\n\n**Avoid**: Blaming others or saying "I don't make mistakes"\n\nWould you like help crafting your response?`;
  }

  // Generic responses
  const genericResponses = [
    `That's a great question! Here's what I'd recommend:\n\n1. Research the company thoroughly\n2. Prepare 5-7 STAR stories from your experience\n3. Practice with mock interviews\n4. Prepare thoughtful questions to ask them\n\nWould you like to practice a specific question?`,

    `For ${targetRole} interviews, focus on:\n• Specific achievements with metrics\n• How you solve problems\n• Your learning agility\n• Team collaboration examples\n\nWhat aspect would you like to practice?`,

    `Let me help you prepare! The key is using specific examples with measurable results.\n\nTry this: For every answer, include 1-2 specific metrics (%, $, time saved, etc.)\n\nReady to practice? What's your biggest interview concern?`
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    apiConfigured: hasHFKey,
    model: MODEL,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;