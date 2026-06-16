const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  noticeId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
