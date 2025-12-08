const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebase');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Create user in Firebase
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: userRecord.uid 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    // Note: Firebase Authentication is handled on the client side
    // This endpoint is for additional server-side validation if needed
    res.status(200).json({ message: 'Login endpoint ready' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    const userRecord = await auth.getUser(decodedToken.uid);
    
    res.status(200).json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
      }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;