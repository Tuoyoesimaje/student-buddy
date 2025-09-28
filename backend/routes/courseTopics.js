const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const CourseTopic = require('../models/CourseTopic');
const Course = require('../models/Course');

// Get all topics for a specific course
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify the course exists and belongs to the user
    const course = await Course.findOne({ _id: courseId, user: req.user.userId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or not authorized' });
    }

    // Get all topics for the course
    const topics = await CourseTopic.find({
      courseId,
      userId: req.user.userId
    }).sort({ createdAt: 1 });

    res.json(topics);
  } catch (error) {
    console.error('Error fetching course topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new topic to a course
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { courseId, topicName, about, understanding, challenges, weekDate } = req.body;

    if (!courseId || !topicName || !weekDate) {
      return res.status(400).json({ message: 'Course ID, topic name, and week date are required' });
    }

    // Verify the course exists and belongs to the user
    const course = await Course.findOne({ _id: courseId, user: req.user.userId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or not authorized' });
    }

    // Create the new topic
    const newTopic = new CourseTopic({
      courseId,
      userId: req.user.userId,
      topicName,
      about: about || '',
      understanding: understanding || '',
      challenges: challenges || '',
      weekDate
    });

    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Error adding course topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a topic
router.delete('/:topicId', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;

    // Find the topic and ensure it belongs to the user
    const topic = await CourseTopic.findOne({ _id: topicId, userId: req.user.userId });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found or not authorized' });
    }

    // Delete the topic
    await CourseTopic.findByIdAndDelete(topicId);
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting course topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;