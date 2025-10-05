const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const Note = require('../models/Note');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// Generate note by course/topic
router.post('/by-course', auth, async (req, res) => {
  try {
    const { courseId, topicName } = req.body;
    console.log('NoteGeneration /by-course request body:', req.body);

    // Determine user id from token payload (support multiple shapes)
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) {
      console.error('NoteGeneration /by-course: Missing authenticated user on req.user:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate courseId (ignore empty string or invalid ids)
    const courseIdClean = courseId && String(courseId).trim() !== '' && mongoose.Types.ObjectId.isValid(courseId)
      ? courseId
      : undefined;

    // Find course and topic data
    const course = await Course.findById(courseId);
    const topic = course.topics.find(t => t.name === topicName);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Build context for AI
    const context = `
      Topic: ${topic.name}
      Description: ${topic.description}
      Key Concepts: ${topic.keyConcepts.join(', ')}
      Challenges: ${topic.challenges}
      Additional Notes: ${topic.studentNotes}
    `;

    // Generate notes using existing aiService
    const noteContent = await aiService.generateNotes(topic.name, 'intermediate', context);

    // Save to database
    const note = new Note({
      title: `${topic.name} - Generated Notes`,
      content: noteContent,
      course: courseIdClean,
      user: userId
    });

    await note.save();

    res.json({ note });
  } catch (error) {
    console.error('Note generation error:', error);
    res.status(500).json({ message: 'Failed to generate note' });
  }
});

// Generate note by manual input
router.post('/by-input', auth, async (req, res) => {
  try {
    const { topicName, description, courseId } = req.body;
    console.log('NoteGeneration /by-input request body:', req.body);

    // Determine user id from token payload (support multiple shapes)
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId) {
      console.error('NoteGeneration /by-input: Missing authenticated user on req.user:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate courseId (ignore empty string or invalid ids)
    const courseIdClean = courseId && String(courseId).trim() !== '' && mongoose.Types.ObjectId.isValid(courseId)
      ? courseId
      : undefined;

    const context = `Topic: ${topicName}\nDescription: ${description}`;

    const noteContent = await aiService.generateNotes(topicName, 'intermediate', context);

    const note = new Note({
      title: `${topicName} - Generated Notes`,
      content: noteContent,
      course: courseIdClean,
      user: userId
    });

    await note.save();

    res.json({ note });
  } catch (error) {
    console.error('Note generation error:', error);
    res.status(500).json({ message: 'Failed to generate note' });
  }
});

module.exports = router;