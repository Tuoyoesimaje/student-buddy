const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const Task = require('../models/Task');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get another user's public profile
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching user profile for ID:', req.params.userId);
    console.log('Authenticated user ID:', req.user.userId);

    const user = await User.findById(req.params.userId).select('-password -email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If requesting own profile, return full data
    if (req.params.userId === req.user.userId) {
      console.log('User requesting own profile, returning full data');
      return res.json(user);
    }

    // For other users, return public profile data
    console.log('Returning public profile data for other user');
    const publicProfile = {
      _id: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      school: user.school,
      class: user.class,
      level: user.level,
      socialLinks: user.socialLinks
    };

    res.json(publicProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// New endpoint to get user task statistics
router.get('/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    // Optional: Add a check here if the authenticated user is allowed to view these stats
    // For now, anyone authenticated can view stats of any user by ID.

    const tasks = await Task.find({ user: targetUserId });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed).length; // Count pending high priority tasks
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
      completionRate: parseFloat(completionRate.toFixed(2)) // Format to 2 decimal places
    });
  } catch (error) {
    console.error('Error fetching user task stats:', error);
    res.status(500).json({ message: 'Error fetching user task statistics' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { username, email, bio, school, class: userClass, level, socialLinks } = req.body;

    // Check if username or email is already taken
    const existingUser = await User.findOne({
      $or: [
        { username: username, _id: { $ne: req.user.userId } },
        { email: email, _id: { $ne: req.user.userId } }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        username,
        email,
        bio,
        school,
        class: userClass,
        level,
        socialLinks
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile picture
router.post('/me/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      const oldPicturePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update user's profile picture
    user.profilePicture = req.file.path;
    await user.save();

    res.json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification settings
router.put('/me/notifications', authenticateToken, async (req, res) => {
  try {
    console.log('PUT /me/notifications received.');
    console.log('Authenticated user ID:', req.user.userId);
    console.log('Request body notifications:', req.body.notifications);

    const { notifications } = req.body;
    
    // Basic validation for the incoming data structure
    if (typeof notifications !== 'object' || notifications === null) {
        console.error('Invalid notifications data structure', req.body.notifications);
        return res.status(400).json({ message: 'Invalid notifications data provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { notifications },
      { new: true }
    ).select('-password');

    if (!user) {
        console.error('User not found for ID:', req.user.userId);
        return res.status(404).json({ message: 'User not found' });
    }

    console.log('Notification settings updated successfully for user:', user.username);
    res.json(user);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/me/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { preferences },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password before deleting account
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Optionally delete profile picture file
    if (user.profilePicture) {
      const picturePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath, (err) => {
          if (err) console.error('Failed to delete profile picture file:', err);
        });
      }
    }

    await User.findByIdAndDelete(req.user.userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;