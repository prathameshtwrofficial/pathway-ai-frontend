const express = require('express');
const router = express.Router();
const axios = require('axios');
const { db } = require('../config/firebase');

// Get job listings based on career or search query
router.get('/', async (req, res) => {
  try {
    const { query, location, careerId } = req.query;
    let jobListings = [];

    // If careerId is provided, get related job keywords
    if (careerId) {
      const careerDoc = await db.collection('careers').doc(careerId).get();
      
      if (!careerDoc.exists) {
        return res.status(404).json({ error: 'Career not found' });
      }
      
      const careerData = careerDoc.data();
      const jobKeywords = careerData.jobKeywords || [careerData.title];
      
      // Use job search API with career keywords
      jobListings = await searchJobs(jobKeywords.join(' '), location);
    } else if (query) {
      // Direct search with provided query
      jobListings = await searchJobs(query, location);
    } else {
      return res.status(400).json({ error: 'Query or careerId is required' });
    }
    
    res.status(200).json({ jobs: jobListings });
  } catch (error) {
    console.error('Error fetching job listings:', error);
    res.status(500).json({ error: 'Failed to fetch job listings' });
  }
});

// Get job market insights for a career
router.get('/insights', async (req, res) => {
  try {
    const { careerId } = req.query;
    
    if (!careerId) {
      return res.status(400).json({ error: 'Career ID is required' });
    }
    
    const careerDoc = await db.collection('careers').doc(careerId).get();
    
    if (!careerDoc.exists) {
      return res.status(404).json({ error: 'Career not found' });
    }
    
    const careerData = careerDoc.data();
    
    // Get or generate job market insights
    const insights = {
      averageSalary: careerData.averageSalary || 'Data not available',
      growthRate: careerData.growthRate || 'Data not available',
      demandLevel: careerData.demandLevel || 'Data not available',
      topLocations: careerData.topLocations || [],
      skillsInDemand: careerData.skillsInDemand || [],
      industryTrends: careerData.industryTrends || []
    };
    
    res.status(200).json({ insights });
  } catch (error) {
    console.error('Error fetching job market insights:', error);
    res.status(500).json({ error: 'Failed to fetch job market insights' });
  }
});

// Helper function to search jobs using external APIs
async function searchJobs(query, location = '') {
  try {
    // For demonstration, we'll use a mock implementation
    // In a real app, you would integrate with job search APIs like LinkedIn, Indeed, etc.
    
    // Mock data for demonstration
    const mockJobs = [
      {
        id: 'job1',
        title: `${query} Developer`,
        company: 'Tech Solutions Inc.',
        location: location || 'Remote',
        description: `We're looking for a talented ${query} developer to join our team.`,
        salary: '$80,000 - $120,000',
        url: 'https://example.com/job1',
        postedDate: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: 'job2',
        title: `Senior ${query} Engineer`,
        company: 'Innovative Systems',
        location: location || 'New York, NY',
        description: `Senior ${query} engineer position for experienced professionals.`,
        salary: '$120,000 - $150,000',
        url: 'https://example.com/job2',
        postedDate: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        id: 'job3',
        title: `${query} Analyst`,
        company: 'Data Insights Corp',
        location: location || 'San Francisco, CA',
        description: `Join our team as a ${query} analyst and help drive business decisions.`,
        salary: '$90,000 - $110,000',
        url: 'https://example.com/job3',
        postedDate: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      }
    ];
    
    return mockJobs;
    
    // Example of real API integration (commented out)
    /*
    const response = await axios.get('https://api.jobsearch.com/v1/search', {
      params: {
        query,
        location,
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${process.env.JOBS_API_KEY}`
      }
    });
    
    return response.data.jobs;
    */
  } catch (error) {
    console.error('Error searching jobs:', error);
    return [];
  }
}

module.exports = router;