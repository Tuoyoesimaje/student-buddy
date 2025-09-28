const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Task = require('../models/Task');
const Note = require('../models/Note');
const CourseTopic = require('../models/CourseTopic');

// Get all courses for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Assuming courses are stored either in the User model or a separate Course model linked to User
    // If courses are in User model:
    const user = await User.findById(req.user.userId).populate('courses'); // Assuming a 'courses' field with references to Course model
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.courses);

    // If courses are in a separate Course model with a userId field:
    // const courses = await Course.find({ user: req.user.userId });
    // res.json(courses);

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new course for the authenticated user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, code, semester, schedule } = req.body;

    // Assuming courses are stored either in the User model or a separate Course model linked to User
    // If courses are in a separate Course model with a userId field:
    const newCourse = new Course({
      name,
      code,
      semester,
      schedule: schedule || [],
      user: req.user.userId // Link course to user
    });
    await newCourse.save();

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.courses.push(newCourse._id); // Push the _id of the newly created Course
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
    const assignmentsCount = await Task.countDocuments({ course: courseId, type: 'assignment' });
    console.log('assignmentsCount:', assignmentsCount);
    const notesCount = await Note.countDocuments({ course: courseId });
    console.log('notesCount:', notesCount);
    const tasksCount = await Task.countDocuments({ course: courseId });
    console.log('tasksCount:', tasksCount);

    // Fetch next 2 upcoming tasks for this course
    // Placeholder: Replace with actual query to your Task model
    const allTasksForCourse = await Task.find({ course: courseId });
    console.log('All tasks for course:', allTasksForCourse.map(task => ({ title: task.title, endTime: task.endTime })));
    const upcomingTasks = await Task.find({ course: courseId, endTime: { $gte: new Date() } }).sort({ endTime: 1 }).limit(3);
    console.log('upcomingTasks:', upcomingTasks);

    console.log('Querying for upcoming tasks with courseId:', courseId, 'and endTime >=', new Date());
    console.log('Raw upcomingTasks from DB:', upcomingTasks);
    console.log('Upcoming tasks sent to frontend:', upcomingTasks);
    res.json({
      id: course._id,
      name: course.name,
      code: course.code,
      semester: course.semester,
      schedule: course.schedule,
      topicsCount,
      assignmentsCount,
      notesCount,
      tasksCount,
      upcomingTasks,
    });

  } catch (error) {
    console.error('Error fetching course details:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;