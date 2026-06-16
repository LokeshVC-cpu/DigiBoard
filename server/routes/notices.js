const express = require('express');
const Notice = require('../models/Notice');

const router = express.Router();

// Get all notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ publishDate: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create notice
router.post('/', async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update notice
router.put('/:id', async (req, res) => {
  try {
    const notice = await Notice.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete notice
router.delete('/:id', async (req, res) => {
  try {
    const notice = await Notice.findOneAndDelete({ id: req.params.id });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
