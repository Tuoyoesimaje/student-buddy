const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Import User model

// Create a new group
router.post('/', auth, async (req, res) => {
  try {
    const { name, school, class: className } = req.body;
    
    const group = new Group({
      name,
      school,
      class: className,
      members: [req.user.userId] // Add creator as first member
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all groups for a user's school
router.get('/my-groups', auth, async (req, res) => {
  try {
    // Fetch the logged-in user to get their school
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all groups in the user's school
    const groups = await Group.find({ school: user.school })
      .populate('members', 'name email profilePicture school class whatsappNumber twitterHandle')
      .sort('-createdAt');
      
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific group
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email profilePicture school class whatsappNumber twitterHandle')
      .populate('messages.sender', 'name email profilePicture school class whatsappNumber twitterHandle');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member of the group by comparing string IDs
    const isMember = group.members.some(member => member._id.toString() === req.user.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member by comparing string IDs
    const isMember = group.members.some(member => member._id.toString() === req.user.userId);
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    group.members.push(req.user.userId);
    await group.save();
    
    // Re-populate members to return updated group object with member details
    await group.populate('members', 'name email profilePicture school class whatsappNumber twitterHandle');

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave a group
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member by comparing string IDs
    const isMember = group.members.some(member => member._id.toString() === req.user.userId);
    if (!isMember) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }

    group.members = group.members.filter(member => member._id.toString() !== req.user.userId);
    await group.save();
    
    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 