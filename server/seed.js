require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const School = require('./models/School');
const User = require('./models/User');
const Notice = require('./models/Notice');

const MONGODB_URI = process.env.MONGO_URI;

async function seedDatabase() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('🛑 Database already seeded. Skipping...');
      process.exit(0);
    }

    console.log('⏳ Hashing passwords...');
    const adminPw = await bcrypt.hash('admin123', 10);
    const teacherPw = await bcrypt.hash('teacher123', 10);
    const studentPw = await bcrypt.hash('student123', 10);

    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 86400000);
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    const schools = [
      { id: 'sch_patamata', name: 'GHS Patamata', location: 'Vijayawada, NTR District' },
      { id: 'sch_gannavaram', name: 'ZPHS Gannavaram', location: 'Gannavaram, NTR District' },
      { id: 'sch_gudivada', name: 'ZPHS Gudivada', location: 'Gudivada, Krishna District' },
    ];

    const users = [
      { id: 'usr_admin', name: 'DEO Officer', email: 'admin@school.gov.in', password: adminPw, role: 'admin', department: 'ALL', schoolId: 'ALL' },
      
      { id: 'usr_t_pat1', name: 'Lakshmi Teacher', email: 'teacher@school.gov.in', password: teacherPw, role: 'faculty', department: 'Science', schoolId: 'sch_patamata' },
      { id: 'usr_t_pat2', name: 'Suresh Sir', email: 'suresh@ghs-patamata.ap.gov.in', password: teacherPw, role: 'faculty', department: 'Mathematics', schoolId: 'sch_patamata' },
      { id: 'usr_s_pat1', name: 'Ravi Kumar', email: 'student@school.gov.in', password: studentPw, role: 'student', department: 'Class 10', schoolId: 'sch_patamata' },
      
      { id: 'usr_t_gnv1', name: 'Venkat Master', email: 'venkat@zphs-gannavaram.ap.gov.in', password: teacherPw, role: 'faculty', department: 'Science', schoolId: 'sch_gannavaram' },
      { id: 'usr_s_gnv1', name: 'Karthik R', email: 'karthik@zphs-gannavaram.ap.gov.in', password: studentPw, role: 'student', department: 'Class 10', schoolId: 'sch_gannavaram' },
      
      { id: 'usr_t_gdv1', name: 'Padma Madam', email: 'padma@zphs-gudivada.ap.gov.in', password: teacherPw, role: 'faculty', department: 'English', schoolId: 'sch_gudivada' },
      { id: 'usr_s_gdv1', name: 'Deepa S', email: 'deepa@zphs-gudivada.ap.gov.in', password: studentPw, role: 'student', department: 'Class 8', schoolId: 'sch_gudivada' },
    ];

    const notices = [
      {
        id: 'ntc_adm1', title: 'Government Holiday – Bakrid',
        content: '<p>All government schools in AP will remain <strong>closed on June 18, 2026</strong> for Bakrid.</p>',
        author: 'usr_admin', department: 'ALL', category: 'general', priority: 'important',
        isPinned: true, publishDate: weekAgo, schoolId: 'ALL'
      },
      {
        id: 'ntc_adm2', title: 'Half-Yearly Exam Schedule – All Schools',
        content: '<p>Half-yearly exams for all AP government schools will start from <strong>June 25, 2026</strong>.</p>',
        author: 'usr_admin', department: 'ALL', category: 'examinations', priority: 'urgent',
        isPinned: true, publishDate: new Date(now.getTime() - 3 * 3600000), schoolId: 'ALL'
      },
      {
        id: 'ntc_pat1', title: 'Annual Day Celebration 2026',
        content: '<p>GHS Patamata Annual Day will be held on <strong>July 15, 2026</strong>.</p>',
        author: 'usr_t_pat1', department: 'ALL', category: 'cultural', priority: 'important',
        isPinned: true, publishDate: yesterday, schoolId: 'sch_patamata'
      },
      {
        id: 'ntc_gnv1', title: 'Sports Day – July 20',
        content: '<p>Annual Sports Day on <strong>July 20, 2026</strong>.</p>',
        author: 'usr_t_gnv1', department: 'ALL', category: 'sports', priority: 'important',
        isPinned: true, publishDate: twoDaysAgo, schoolId: 'sch_gannavaram'
      }
    ];

    console.log('⏳ Inserting Schools...');
    await School.insertMany(schools);
    
    console.log('⏳ Inserting Users...');
    await User.insertMany(users);
    
    console.log('⏳ Inserting Notices...');
    await Notice.insertMany(notices);

    console.log('✅ Database Seeding Completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();
