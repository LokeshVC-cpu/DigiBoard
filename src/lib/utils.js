// ============================================
// DigiBoard — Utility Functions
// ============================================

export function generateId(prefix = '') {
  const id = crypto.randomUUID ? crypto.randomUUID() : 
    'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
  return prefix ? `${prefix}_${id}` : id;
}

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  const array = Array.from(new Uint8Array(buffer));
  return array.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function relativeTime(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

export function truncateText(text, maxLen = 120) {
  if (!text || text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '...';
}

export function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 'weak', label: 'Weak', color: 'var(--danger)' };
  if (score <= 2) return { level: 'medium', label: 'Medium', color: 'var(--warning)' };
  if (score <= 3) return { level: 'strong', label: 'Strong', color: 'var(--success)' };
  return { level: 'very-strong', label: 'Very Strong', color: 'var(--success)' };
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span style="font-size:1.1rem">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export const DEPARTMENTS = ['ALL', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
export const CATEGORIES = ['academic', 'events', 'examinations', 'sports', 'cultural', 'general'];
export const PRIORITIES = ['urgent', 'important', 'normal'];

export const PRIORITY_CONFIG = {
  urgent:    { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  important: { label: 'Important', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  normal:    { label: 'Normal', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
};

export const CATEGORY_CONFIG = {
  academic:     { label: 'Academic', icon: '📚', color: '#6366f1' },
  events:       { label: 'Events', icon: '🎉', color: '#8b5cf6' },
  examinations: { label: 'Exams', icon: '📝', color: '#ef4444' },
  sports:       { label: 'Sports', icon: '⚽', color: '#10b981' },
  cultural:     { label: 'Cultural', icon: '🎭', color: '#f59e0b' },
  general:      { label: 'General', icon: '📢', color: '#64748b' },
};

// Schools
export const SCHOOLS = [
  { id: 'sch_patamata', name: 'GHS Patamata', location: 'Vijayawada, NTR District' },
  { id: 'sch_gannavaram', name: 'ZPHS Gannavaram', location: 'Gannavaram, NTR District' },
  { id: 'sch_gudivada', name: 'ZPHS Gudivada', location: 'Gudivada, Krishna District' },
];

// Check if a notice is visible to a user's school
// Admin notices (schoolId='ALL') are visible to everyone
export function isVisibleToSchool(notice, userSchoolId) {
  if (!userSchoolId || userSchoolId === 'ALL') return true; // admin sees all
  return notice.schoolId === userSchoolId || notice.schoolId === 'ALL';
}
