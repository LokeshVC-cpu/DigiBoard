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
      // Admin
      { id: 'usr_admin1', name: 'Ravi Kumar', email: 'admin@ap.gov.in', password: await bcrypt.hash('admin123', 10), role: 'admin', department: 'Administration', schoolId: 'ALL', dob: '1980-01-01', aadhaar: '123412341234' },
      // Faculty
      { id: 'usr_fac1', name: 'Sita Ram', email: 'sita.ram@school.gov.in', password: await bcrypt.hash('faculty123', 10), role: 'faculty', department: 'Mathematics', schoolId: 'sch_patamata', dob: '1985-05-15', aadhaar: '111122223333' },
      { id: 'usr_fac2', name: 'Venkat Rao', email: 'venkat.rao@school.gov.in', password: await bcrypt.hash('faculty123', 10), role: 'faculty', department: 'Science', schoolId: 'sch_gannavaram', dob: '1982-11-20', aadhaar: '444455556666' },
      { id: 'usr_fac3', name: 'Lakshmi Devi', email: 'lakshmi.devi@school.gov.in', password: await bcrypt.hash('faculty123', 10), role: 'faculty', department: 'Social Studies', schoolId: 'sch_gudivada', dob: '1990-03-10', aadhaar: '777788889999' },
      // Students
      { id: 'usr_stu1', name: 'Karthik', email: 'karthik@student.in', password: await bcrypt.hash('student123', 10), role: 'student', department: 'Class 10', schoolId: 'sch_patamata', dob: '2010-06-01', aadhaar: '000011112222' },
      { id: 'usr_stu2', name: 'Priya', email: 'priya@student.in', password: await bcrypt.hash('student123', 10), role: 'student', department: 'Class 9', schoolId: 'sch_patamata', dob: '2011-08-15', aadhaar: '333344445555' },
      { id: 'usr_stu3', name: 'Arjun', email: 'arjun@student.in', password: await bcrypt.hash('student123', 10), role: 'student', department: 'Class 10', schoolId: 'sch_gannavaram', dob: '2010-02-28', aadhaar: '666677778888' },
      { id: 'usr_stu4', name: 'Divya', email: 'divya@student.in', password: await bcrypt.hash('student123', 10), role: 'student', department: 'Class 8', schoolId: 'sch_gudivada', dob: '2012-12-12', aadhaar: '999900001111' },
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
