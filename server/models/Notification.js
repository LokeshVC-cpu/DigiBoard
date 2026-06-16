const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  type: { type: String, default: 'new_notice' },
  title: { type: String, required: true },
  message: { type: String },
  relatedNoticeId: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
