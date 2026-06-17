import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNoticesApi, getUsersApi, updateUserRoleApi } from '../lib/api';
import { relativeTime, CATEGORY_CONFIG, PRIORITY_CONFIG, DEPARTMENTS, isVisibleToSchool, SCHOOLS } from '../lib/utils';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { ClipboardList, Users, AlertTriangle, Building2, PlusCircle, TrendingUp, Eye, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const { user, effectiveSchoolId } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, urgent: 0, departments: 0 });
  const [notices, setNotices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSchool, setFilterSchool] = useState('ALL');

  useEffect(() => {
    loadData();
  }, [effectiveSchoolId]);

  async function loadData() {
    try {
      const allNotices = await getNoticesApi();
      const allUsers = await getUsersApi();
      const scopedNotices = allNotices.filter(n => isVisibleToSchool(n, effectiveSchoolId));
      const active = scopedNotices.filter(n => n.status === 'active');
      const urgent = active.filter(n => n.priority === 'urgent');
      const depts = new Set(scopedNotices.map(n => n.department).filter(d => d !== 'ALL'));

      setNotices(allNotices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setUsers(allUsers);
      setStats({
        total: allNotices.length,
        active: active.length,
        urgent: urgent.length,
        departments: Math.max(depts.size, 6),
      });
    } catch (e) {
      console.error('Dashboard load error:', e);
    }
    setLoading(false);
  }

  async function promoteUser(userId, role) {
    if (!confirm(`Are you sure you want to approve this user as a teacher?`)) return;
    try {
      await updateUserRoleApi(userId, role);
      setUsers(users.map(u => u.id === userId ? { ...u, role, isPendingFaculty: false } : u));
    } catch (err) {
      alert('Failed to update role');
    }
  }

  // Chart data
  const categoryCount = {};
  Object.keys(CATEGORY_CONFIG).forEach(c => { categoryCount[c] = 0; });
  notices.forEach(n => { if (categoryCount[n.category] !== undefined) categoryCount[n.category]++; });

  const deptCount = {};
  DEPARTMENTS.filter(d => d !== 'ALL').forEach(d => { deptCount[d] = 0; });
  notices.forEach(n => {
    if (n.department === 'ALL') {
      Object.keys(deptCount).forEach(d => deptCount[d]++);
    } else if (deptCount[n.department] !== undefined) {
      deptCount[n.department]++;
    }
  });

  const doughnutData = {
    labels: Object.keys(CATEGORY_CONFIG).map(c => CATEGORY_CONFIG[c].label),
    datasets: [{
      data: Object.values(categoryCount),
      backgroundColor: Object.keys(CATEGORY_CONFIG).map(c => CATEGORY_CONFIG[c].color + '99'),
      borderColor: Object.keys(CATEGORY_CONFIG).map(c => CATEGORY_CONFIG[c].color),
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  const barData = {
    labels: Object.keys(deptCount),
    datasets: [{
      label: 'Notices',
      data: Object.values(deptCount),
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
      borderColor: '#6366f1',
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 32,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 11, family: 'Inter' } } } },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Inter' } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { font: { family: 'Inter', size: 11 } }, grid: { display: false } },
    },
  };

  const statCards = [
    { label: 'Total Notices', value: stats.total, icon: <ClipboardList size={22} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Active Notices', value: stats.active, icon: <TrendingUp size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Urgent Notices', value: stats.urgent, icon: <AlertTriangle size={22} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Departments', value: stats.departments, icon: <Building2 size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="stats-grid">
          {[1,2,3,4].map(i => <div key={i} className="stat-card skeleton-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard page-enter">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back, {user?.name?.split(' ')[0]}! Here's your school overview.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <button className="btn-primary" onClick={() => navigate('/create-notice')}>
            <PlusCircle size={18} /> New Notice
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h4>Notices by Category</h4>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h4>Notices by Department</h4>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-card">
        <h4>Recent Activity</h4>
        <div className="activity-timeline">
          {notices.slice(0, 8).map((n, i) => {
            const author = users.find(u => u.id === n.author);
            return (
              <div key={n.id} className="timeline-item" onClick={() => navigate(`/notices?open=${n.id}`)} style={{ cursor: 'pointer' }}>
                <div className="timeline-dot" style={{ background: PRIORITY_CONFIG[n.priority]?.color || '#6366f1' }} />
                <div className="timeline-content">
                  <p className="timeline-title">
                    <strong>{author?.name || 'Unknown'}</strong> posted <span className="timeline-notice-title">"{n.title}"</span>
                  </p>
                  <div className="timeline-meta">
                    <span className="timeline-badge" style={{ background: PRIORITY_CONFIG[n.priority]?.bg, color: PRIORITY_CONFIG[n.priority]?.color }}>
                      {n.priority}
                    </span>
                    <span className="timeline-views"><Eye size={12} /> {n.views}</span>
                    <span className="timeline-time">{relativeTime(n.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin User Management */}
      {user?.role === 'admin' && (
        <div className="activity-card" style={{ marginTop: '24px' }}>
          <h4>User Management (Admin Only)</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Approve pending teacher accounts so they can post notices and assign marks.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
            {effectiveSchoolId === 'ALL' && (
              <select 
                value={filterSchool} 
                onChange={e => setFilterSchool(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                <option value="ALL">All Schools</option>
                {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px' }}>Name</th>
                  <th style={{ padding: '12px 8px' }}>Email</th>
                  <th style={{ padding: '12px 8px' }}>Class/Dept</th>
                  <th style={{ padding: '12px 8px' }}>Current Role</th>
                  <th style={{ padding: '12px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => effectiveSchoolId === 'ALL' ? (filterSchool === 'ALL' || u.schoolId === filterSchool) : u.schoolId === effectiveSchoolId)
                  .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--bg-hover)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 8px' }}>{u.department}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className="timeline-badge" style={{ background: u.role === 'admin' ? '#fecdd3' : u.role === 'faculty' ? '#dbeafe' : '#f1f5f9', color: u.role === 'admin' ? '#e11d48' : u.role === 'faculty' ? '#2563eb' : '#475569' }}>
                        {u.role}
                      </span>
                      {u.isPendingFaculty && (
                        <span className="timeline-badge" style={{ background: '#fef3c7', color: '#d97706', marginLeft: '6px', fontSize: '0.7rem' }}>
                          Pending Teacher
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {u.isPendingFaculty && (
                        <button 
                          onClick={() => promoteUser(u.id, 'faculty')}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--warning)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <Shield size={14} /> Approve Teacher
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
