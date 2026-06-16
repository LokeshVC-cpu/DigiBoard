const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  noticeId: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
