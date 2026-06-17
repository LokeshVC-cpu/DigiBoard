const express = require('express');
const jwt = require('jsonwebtoken');
const Mark = require('../models/Mark');
const User = require('../models/User');

const router = express.Router();

// Middleware to authenticate
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET all marks (filtered based on role)
router.get('/', authenticate, async (req, res) => {
  try {
    const { schoolId, department, studentId } = req.query;
    let query = {};

    // Base filtering based on role
    if (req.user.role === 'admin') {
      // Admins can see all, but filter by query params if provided
      if (schoolId) query.schoolId = schoolId;
      if (department) query.department = department;
      if (studentId) query.studentId = studentId;
    } else if (req.user.role === 'faculty') {
      // Faculty can see all marks in their school
      query.schoolId = req.user.schoolId;
      if (department) query.department = department;
      if (studentId) query.studentId = studentId;
    } else if (req.user.role === 'student') {
      // Students can ONLY see their own marks
      query.studentId = req.user.id;
    }

    const marks = await Mark.find(query).sort({ date: -1 });
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new mark (Admin and Faculty only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ message: 'Forbidden: Students cannot add marks' });
    }

    const { studentId, schoolId, department, examType, subject, marksObtained, totalMarks } = req.body;

    // Faculty can only add marks for their own school
    if (req.user.role === 'faculty' && req.user.schoolId !== schoolId) {
       return res.status(403).json({ message: 'Forbidden: Cannot add marks for a different school' });
    }

    // Verify student exists and belongs to the specified school/department
    const student = await User.findOne({ id: studentId, role: 'student', schoolId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found in the specified school' });
    }

    const id = `mrk_${Date.now()}`;
    const mark = new Mark({
      id,
      studentId,
      schoolId,
      department: student.department, // Enforce department from student record
      examType,
      subject,
      marksObtained,
      totalMarks,
      addedBy: req.user.id
    });

    await mark.save();
    res.status(201).json(mark);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update mark (Admin only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admins can update marks' });
    }

    // Don't allow changing the core student/school reference during an update
    const updateData = {
      examType: req.body.examType,
      subject: req.body.subject,
      marksObtained: req.body.marksObtained,
      totalMarks: req.body.totalMarks
    };

    const mark = await Mark.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    if (!mark) return res.status(404).json({ message: 'Mark not found' });
    
    res.json(mark);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE mark (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admins can delete marks' });
    }

    const mark = await Mark.findOneAndDelete({ id: req.params.id });
    if (!mark) return res.status(404).json({ message: 'Mark not found' });

    res.json({ message: 'Mark deleted successfully', id: mark.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
