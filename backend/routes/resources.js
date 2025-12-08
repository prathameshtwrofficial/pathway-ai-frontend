const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const axios = require('axios');

// Get learning resources based on career or skill
router.get('/', async (req, res) => {
  try {
    const { careerId, skill, type } = req.query;
    let resources = [];
    
    if (careerId) {
      // Get resources for specific career
      const resourcesSnapshot = await db.collection('resources')
        .where('careerIds', 'array-contains', careerId)
        .get();
      
      resourcesSnapshot.forEach(doc => {
        resources.push({
          id: doc.id,
          ...doc.data()
        });
      });
    } else if (skill) {
      // Get resources for specific skill
      const resourcesSnapshot = await db.collection('resources')
        .where('skills', 'array-contains', skill)
        .get();
      
      resourcesSnapshot.forEach(doc => {
        resources.push({
          id: doc.id,
          ...doc.data()
        });
      });
    } else {
      // Get general resources
      const resourcesSnapshot = await db.collection('resources')
        .limit(10)
        .get();
      
      resourcesSnapshot.forEach(doc => {
        resources.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    // Filter by type if specified
    if (type && resources.length > 0) {
      resources = resources.filter(resource => resource.type === type);
    }
    
    res.status(200).json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Search YouTube for learning resources
router.get('/youtube', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Search YouTube for educational content
    const youtubeResults = await searchYouTube(query);
    
    res.status(200).json({ videos: youtubeResults });
  } catch (error) {
    console.error('Error searching YouTube:', error);
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resourceDoc = await db.collection('resources').doc(resourceId).get();
    
    if (!resourceDoc.exists) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    const resource = {
      id: resourceDoc.id,
      ...resourceDoc.data()
    };
    
    res.status(200).json({ resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Helper function to search YouTube
async function searchYouTube(query) {
  try {
    // For demonstration, we'll use mock data
    // In a real app, you would use the YouTube API
    
    // Mock YouTube search results
    const mockVideos = [
      {
        id: 'video1',
        title: `Learn ${query} - Complete Tutorial`,
        channelTitle: 'Tech Learning',
        description: `Comprehensive tutorial on ${query} for beginners to advanced users.`,
        thumbnail: 'https://example.com/thumbnail1.jpg',
        url: `https://youtube.com/watch?v=abc123`,
        publishedAt: '2023-01-15T00:00:00Z'
      },
      {
        id: 'video2',
        title: `${query} Masterclass - From Beginner to Pro`,
        channelTitle: 'Career Skills',
        description: `Master ${query} with this comprehensive course.`,
        thumbnail: 'https://example.com/thumbnail2.jpg',
        url: `https://youtube.com/watch?v=def456`,
        publishedAt: '2023-02-20T00:00:00Z'
      },
      {
        id: 'video3',
        title: `${query} in the Real World - Practical Applications`,
        channelTitle: 'Industry Insights',
        description: `Learn how ${query} is applied in real-world scenarios.`,
        thumbnail: 'https://example.com/thumbnail3.jpg',
        url: `https://youtube.com/watch?v=ghi789`,
        publishedAt: '2023-03-10T00:00:00Z'
      }
    ];
    
    return mockVideos;
    
    // Example of real YouTube API integration (commented out)
    /*
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: `${query} tutorial education`,
        type: 'video',
        key: process.env.YOUTUBE_API_KEY
      }
    });
    
    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://youtube.com/watch?v=${item.id.videoId}`,
      publishedAt: item.snippet.publishedAt
    }));
    */
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

module.exports = router;