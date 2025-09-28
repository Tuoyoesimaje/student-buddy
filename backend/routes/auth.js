const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    process.stdout.write('Registration request body: ' + JSON.stringify(req.body) + '\n');
    const { 
      username, 
      email, 
      password, 
      school, 
      level, 
      semesterStart, 
      semesterEnd, 
      freeTime,
      bio,
      socialLinks 
    } = req.body;
    
    console.log('Extracted bio:', bio);
    console.log('Extracted socialLinks:', socialLinks);

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with all fields
    const user = new User({
      username,
      email,
      password, // plain password - will be hashed by pre-save hook
      school: school || '',
      level: level || '',
      semesterStart: semesterStart || '',
      semesterEnd: semesterEnd || '',
      freeTime: {
        startTime: freeTime?.startTime || '',
        endTime: freeTime?.endTime || ''
      },
      bio: bio || '',
      socialLinks: {
        whatsapp: socialLinks?.whatsapp || '',
        twitter: socialLinks?.twitter || '',
        instagram: socialLinks?.instagram || '',
        linkedin: socialLinks?.linkedin || '',
        github: socialLinks?.github || ''
      },
      notifications: {
        email: true,
        push: true,
        taskReminders: true,
        studyReminders: true
      },
      preferences: {
        theme: 'system',
        language: 'en'
      }
    });
    
    // Save user to database
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return success response with token and user ID
    res.status(201).json({ 
      token,
      userId: user._id.toString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      userId: user._id.toString()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

module.exports = router; 