// ============================================
// DigiBoard — Timetable Data (Classes 6–10)
// ============================================

const PERIODS = [
  { num: 1, time: '9:00 – 9:40' },
  { num: 2, time: '9:40 – 10:20' },
  { num: 3, time: '10:20 – 11:00' },
  { label: 'Break', time: '11:00 – 11:15', isBreak: true },
  { num: 4, time: '11:15 – 11:55' },
  { num: 5, time: '11:55 – 12:35' },
  { label: 'Lunch', time: '12:35 – 1:15', isBreak: true },
  { num: 6, time: '1:15 – 1:55' },
  { num: 7, time: '1:55 – 2:35' },
  { num: 8, time: '2:35 – 3:15' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SUBJECT_COLORS = {
  'Telugu':       { bg: '#fef3c7', color: '#92400e', border: '#fbbf24' },
  'Hindi':        { bg: '#fce7f3', color: '#9d174d', border: '#f472b6' },
  'English':      { bg: '#dbeafe', color: '#1e40af', border: '#60a5fa' },
  'Mathematics':  { bg: '#ede9fe', color: '#5b21b6', border: '#a78bfa' },
  'Science':      { bg: '#d1fae5', color: '#065f46', border: '#34d399' },
  'Social Studies':{ bg: '#ffedd5', color: '#9a3412', border: '#fb923c' },
  'Physics':      { bg: '#d1fae5', color: '#065f46', border: '#34d399' },
  'Chemistry':    { bg: '#cffafe', color: '#155e75', border: '#22d3ee' },
  'Biology':      { bg: '#dcfce7', color: '#166534', border: '#4ade80' },
  'PT / Games':   { bg: '#fef9c3', color: '#854d0e', border: '#facc15' },
  'Drawing':      { bg: '#fae8ff', color: '#86198f', border: '#e879f9' },
  'GK':           { bg: '#e0e7ff', color: '#3730a3', border: '#818cf8' },
  'Moral Science':{ bg: '#f1f5f9', color: '#475569', border: '#94a3b8' },
  'Computer':     { bg: '#ecfdf5', color: '#047857', border: '#10b981' },
  'Library':      { bg: '#fff7ed', color: '#c2410c', border: '#f97316' },
  'Assembly':     { bg: '#f0f9ff', color: '#0369a1', border: '#38bdf8' },
};

// Class 6 Timetable
const CLASS_6 = {
  Monday:    ['English', 'Mathematics', 'Telugu', null, 'Science', 'Hindi', null, 'Social Studies', 'Drawing', 'PT / Games'],
  Tuesday:   ['Mathematics', 'Telugu', 'English', null, 'Hindi', 'Science', null, 'GK', 'Social Studies', 'Moral Science'],
  Wednesday: ['Telugu', 'English', 'Mathematics', null, 'Social Studies', 'Science', null, 'Hindi', 'PT / Games', 'Drawing'],
  Thursday:  ['Science', 'Hindi', 'English', null, 'Mathematics', 'Telugu', null, 'Social Studies', 'Library', 'GK'],
  Friday:    ['Hindi', 'Mathematics', 'Science', null, 'Telugu', 'English', null, 'Drawing', 'Social Studies', 'PT / Games'],
  Saturday:  ['English', 'Telugu', 'Hindi', null, 'Mathematics', 'Science', null, 'PT / Games', 'Moral Science', 'GK'],
};

// Class 7 Timetable
const CLASS_7 = {
  Monday:    ['Mathematics', 'English', 'Science', null, 'Telugu', 'Hindi', null, 'Social Studies', 'PT / Games', 'GK'],
  Tuesday:   ['Telugu', 'Science', 'English', null, 'Mathematics', 'Social Studies', null, 'Hindi', 'Drawing', 'Moral Science'],
  Wednesday: ['English', 'Mathematics', 'Hindi', null, 'Science', 'Telugu', null, 'PT / Games', 'Social Studies', 'Library'],
  Thursday:  ['Hindi', 'Telugu', 'Mathematics', null, 'English', 'Science', null, 'GK', 'Drawing', 'Social Studies'],
  Friday:    ['Science', 'English', 'Telugu', null, 'Hindi', 'Mathematics', null, 'Social Studies', 'Moral Science', 'PT / Games'],
  Saturday:  ['Mathematics', 'Hindi', 'English', null, 'Telugu', 'Science', null, 'Drawing', 'GK', 'PT / Games'],
};

// Class 8 Timetable
const CLASS_8 = {
  Monday:    ['Mathematics', 'Science', 'English', null, 'Telugu', 'Social Studies', null, 'Hindi', 'Computer', 'PT / Games'],
  Tuesday:   ['English', 'Mathematics', 'Telugu', null, 'Science', 'Hindi', null, 'Social Studies', 'GK', 'Drawing'],
  Wednesday: ['Science', 'Telugu', 'Mathematics', null, 'English', 'Hindi', null, 'Computer', 'PT / Games', 'Social Studies'],
  Thursday:  ['Telugu', 'Hindi', 'Science', null, 'Mathematics', 'English', null, 'Social Studies', 'Drawing', 'Library'],
  Friday:    ['Hindi', 'English', 'Mathematics', null, 'Science', 'Telugu', null, 'PT / Games', 'Social Studies', 'GK'],
  Saturday:  ['Mathematics', 'Science', 'Hindi', null, 'English', 'Telugu', null, 'Moral Science', 'Computer', 'PT / Games'],
};

// Class 9 Timetable
const CLASS_9 = {
  Monday:    ['Mathematics', 'Physics', 'English', null, 'Telugu', 'Chemistry', null, 'Social Studies', 'Biology', 'PT / Games'],
  Tuesday:   ['English', 'Mathematics', 'Telugu', null, 'Biology', 'Hindi', null, 'Physics', 'Social Studies', 'Computer'],
  Wednesday: ['Physics', 'Chemistry', 'Mathematics', null, 'English', 'Telugu', null, 'Hindi', 'PT / Games', 'Biology'],
  Thursday:  ['Telugu', 'English', 'Chemistry', null, 'Mathematics', 'Biology', null, 'Social Studies', 'Hindi', 'Library'],
  Friday:    ['Chemistry', 'Mathematics', 'Physics', null, 'Hindi', 'English', null, 'Biology', 'Social Studies', 'GK'],
  Saturday:  ['Mathematics', 'Physics', 'Hindi', null, 'English', 'Chemistry', null, 'PT / Games', 'Computer', 'Telugu'],
};

// Class 10 Timetable
const CLASS_10 = {
  Monday:    ['Mathematics', 'Physics', 'Chemistry', null, 'English', 'Telugu', null, 'Biology', 'Social Studies', 'Hindi'],
  Tuesday:   ['Physics', 'English', 'Mathematics', null, 'Chemistry', 'Hindi', null, 'Telugu', 'Biology', 'Computer'],
  Wednesday: ['Chemistry', 'Mathematics', 'English', null, 'Physics', 'Biology', null, 'Social Studies', 'Hindi', 'PT / Games'],
  Thursday:  ['English', 'Chemistry', 'Telugu', null, 'Mathematics', 'Physics', null, 'Hindi', 'Computer', 'Biology'],
  Friday:    ['Mathematics', 'Biology', 'Physics', null, 'Telugu', 'English', null, 'Chemistry', 'PT / Games', 'Social Studies'],
  Saturday:  ['Telugu', 'Mathematics', 'Hindi', null, 'Physics', 'Chemistry', null, 'English', 'Biology', 'Library'],
};

const TIMETABLES = {
  'Class 6': CLASS_6,
  'Class 7': CLASS_7,
  'Class 8': CLASS_8,
  'Class 9': CLASS_9,
  'Class 10': CLASS_10,
};

export { PERIODS, DAYS, SUBJECT_COLORS, TIMETABLES };
