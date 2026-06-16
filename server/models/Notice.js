const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true }, // user id
  department: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['normal', 'important', 'urgent'], required: true },
  isPinned: { type: Boolean, default: false },
  attachments: { type: Array, default: [] },
  publishDate: { type: Date, required: true },
  expiryDate: { type: Date, default: null },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
  schoolId: { type: String, required: true },
  views: { type: Number, default: 0 },
  reactions: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
