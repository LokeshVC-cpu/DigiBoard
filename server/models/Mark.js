const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true }, // References User.id
  schoolId: { type: String, required: true },
  department: { type: String, required: true },
  examType: { type: String, required: true },
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  addedBy: { type: String, required: true }, // References User.id (faculty/admin)
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Mark', markSchema);
