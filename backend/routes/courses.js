const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Note = require('../models/Note');
const CourseTopic = require('../models/CourseTopic');

// Get all courses for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Return full Course documents owned by the user so frontend has access to topics
    const courses = await Course.find({ user: req.user.userId });
    res.json(courses);

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new course for the authenticated user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, code, semester, schedule } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Course name is required' });
    }

    // Fetch user to get defaults like school and level
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.error('Courses POST: Authenticated user not found:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Use user's school/level as defaults if not provided in the request
    const schoolVal = req.body.school || user.school || '';
    const levelVal = req.body.level || user.level || '';

    const newCourse = new Course({
      name: name.trim(),
      code: code || '',
      semester: semester || '',
      schedule: schedule || [],
      user: req.user.userId,
      school: schoolVal,
      level: levelVal
    });
    await newCourse.save();

    // Push the course id into user's courses array if not already present
    if (!user.courses) user.courses = [];
    user.courses.push(newCourse._id);
    await user.save();

    res.status(201).json(newCourse);

    // If courses are in a separate Course model with a userId field:
    // const newCourse = new Course({
    //   name,
    //   code,}
    //   semester,
    //   schedule: schedule || [],
    //   user: req.user.id
    // });
    // await newCourse.save();
    // res.status(201).json(newCourse);

  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a course for the authenticated user
router.put('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, code, semester, schedule } = req.body;

    // Assuming courses are stored either in the User model or a separate Course model linked to User
    // If courses are in a separate Course model with a userId field:
    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId, user: req.user.userId },
      { name, code, semester, schedule },
      { new: true }
    );
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found or not authorized' });
    }
    res.json(updatedCourse);

    // If courses are in a separate Course model with a userId field:
    // const updatedCourse = await Course.findOneAndUpdate(
    //   { _id: courseId, user: req.user.id },
    //   { name, code, semester, schedule },
    //   { new: true }
    // );
    // if (!updatedCourse) {
    //   return res.status(404).json({ message: 'Course not found or not authorized' });
    // }
    // res.json(updatedCourse);

  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course for the authenticated user
router.delete('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Assuming courses are stored either in the User model or a separate Course model linked to User
    // If courses are in a separate Course model with a userId field:
    const result = await Course.findOneAndDelete({ _id: courseId, user: req.user.userId });
    if (!result) {
      return res.status(404).json({ message: 'Course not found or not authorized' });
    }

    const user = await User.findById(req.user.userId);
    if (user) {
      user.courses.pull(courseId); // Remove the course ID from the user's courses array
      await user.save();
    }

    res.json({ message: 'Course deleted successfully' });

    // If courses are in a separate Course model with a userId field:
    // const result = await Course.findOneAndDelete({ _id: courseId, user: req.user.userId });
    // if (!result) {
    //   return res.status(404).json({ message: 'Course not found or not authorized' });
    // }
    // res.json({ message: 'Course deleted successfully' });

  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed information for a specific course
// Get full course document (used by frontend components)
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Ensure the course belongs to the requesting user
    if (course.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: Course does not belong to user' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed information for a specific course
router.get('/:courseId/details', authenticateToken, async (req, res) => {
  try {

    const { courseId } = req.params;

    // Fetch the course directly from the Course model
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found for courseId:', courseId);
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify that the course belongs to the authenticated user
    if (course.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: Course does not belong to user' });
    }

    // Assuming you have models for Topic, Assignment, Note, Task and they are linked by course ID
    // You might need to adjust these queries based on your actual Mongoose schemas

    // Fetch counts for topics, assignments, notes, tasks related to this course
    // Placeholder: Replace with actual queries to your models
    const topicsCount = await CourseTopic.countDocuments({ courseId: courseId });
    console.log('topicsCount:', topicsCount);
    const notesCount = await Note.countDocuments({ course: courseId });
    console.log('notesCount:', notesCount);

    // No upcoming tasks since we removed task management
    const upcomingTasks = [];

    console.log('Querying for upcoming tasks with courseId:', courseId, 'and endTime >=', new Date());
    console.log('Raw upcomingTasks from DB:', upcomingTasks);
    console.log('Upcoming tasks sent to frontend:', upcomingTasks);
    res.json({
      id: course._id,
      name: course.name,
      code: course.code,
      semester: course.semester,
      schedule: course.schedule,
      // Include the topics array so frontend can render/edit topics
      topics: course.topics || [],
      topicsCount,
      notesCount,
      upcomingTasks: [],
    });

  } catch (error) {
    console.error('Error fetching course details:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update topics for a course
router.put('/:courseId/topics', authenticateToken, async (req, res) => {
  try {
    const { topics } = req.body;
    const course = await Course.findOneAndUpdate(
      { _id: req.params.courseId, user: req.user.userId },
      { topics },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Error updating topics:', error);
    res.status(500).json({ message: 'Failed to update topics' });
  }
});

module.exports = router;