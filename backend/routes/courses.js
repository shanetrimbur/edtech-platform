// routes/courses.js
const express = require('express');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a course
router.post('/', auth(['educator', 'admin']), async (req, res) => {
  const { title, description } = req.body;
  try {
    const course = await Course.create({ title, description, educatorId: req.user.id });
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
