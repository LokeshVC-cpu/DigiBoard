import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getNoticesApi, getBookmarksApi, deleteNoticeApi } from '../lib/api';
import { getInitials, formatDate, relativeTime, hashPassword, showToast, DEPARTMENTS, PRIORITY_CONFIG, CATEGORY_CONFIG, SCHOOLS } from '../lib/utils';
import { User, ClipboardList, Bookmark, Settings, Edit3, Trash2, Eye, Moon, Sun, Lock, Save } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, updateUser, school } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'notices');
  const [myNotices, setMyNotices] = useState([]);
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile
  const [editName, setEditName] = useState(user?.name || '');
  const [editDept, setEditDept] = useState(user?.department || 'CSE');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  useEffect(() => { loadData(); }, [user]);

  async function loadData() {
    if (!user) return;
    try {
      const notices = await getNoticesApi();
      setAllNotices(notices);
      setMyNotices(notices.filter(n => n.author === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      const bms = await getBookmarksApi();
      const bmNotices = bms.map(bm => notices.find(n => n.id === bm.noticeId)).filter(Boolean);
      setMyBookmarks(bmNotices);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function handleDeleteNotice(id) {
    if (!confirm('Delete this notice permanently?')) return;
    await deleteNoticeApi(id);
    setMyNotices(prev => prev.filter(n => n.id !== id));
    showToast('Notice deleted', 'success');
  }

  async function handleSaveProfile() {
    if (!editName.trim()) { showToast('Name cannot be empty', 'error'); return; }
    await updateUser({ name: editName.trim(), department: editDept });
    showToast('Profile updated!', 'success');
  }

  async function handleChangePassword() {
    if (!currentPw || !newPw) { showToast('Fill in all password fields', 'error'); return; }
    if (newPw.length < 6) { showToast('New password must be at least 6 characters', 'error'); return; }
    if (newPw !== confirmPw) { showToast('Passwords do not match', 'error'); return; }
    const hashed = await hashPassword(currentPw);
    if (hashed !== user.password) { showToast('Current password is incorrect', 'error'); return; }
    const newHashed = await hashPassword(newPw);
    await updateUser({ password: newHashed });
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    showToast('Password changed successfully!', 'success');
  }

  const roleBadge = { admin: 'role-admin', faculty: 'role-faculty', student: 'role-student' };

  const tabs = [
    ...(user?.role !== 'student' ? [{ id: 'notices', label: 'My Notices', icon: <ClipboardList size={16} /> }] : []),
    { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="profile-page page-enter">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-lg">{getInitials(user?.name)}</div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <div className="profile-meta">
            <span className={`role-badge ${roleBadge[user?.role]}`}>
              {user?.role === 'faculty' ? 'Teacher' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
            <span className="profile-dept">{user?.department}</span>
            <span className="profile-dept">{school?.name || (user?.schoolId === 'ALL' ? 'All Schools' : '')}</span>
            <span className="profile-joined">Joined {formatDate(user?.createdAt)}</span>
          </div>
          <p className="profile-email">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`profile-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* My Notices */}
        {activeTab === 'notices' && (
          <div className="profile-notices">
            {myNotices.length === 0 ? (
              <div className="profile-empty"><ClipboardList size={40} /><p>You haven't posted any notices yet</p></div>
            ) : (
              <div className="profile-notice-list">
                {myNotices.map(n => (
                  <div key={n.id} className="profile-notice-item">
                    <div className="pn-priority" style={{ background: PRIORITY_CONFIG[n.priority]?.color }} />
                    <div className="pn-body">
                      <div className="pn-top">
                        <h4 onClick={() => navigate(`/notices?open=${n.id}`)}>{n.title}</h4>
                        <div className="pn-actions">
                          <button onClick={() => navigate(`/edit-notice/${n.id}`)} title="Edit"><Edit3 size={15} /></button>
                          <button onClick={() => handleDeleteNotice(n.id)} title="Delete" className="delete-btn"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      <div className="pn-meta">
                        <span className="pn-badge" style={{ background: CATEGORY_CONFIG[n.category]?.color + '18', color: CATEGORY_CONFIG[n.category]?.color }}>
                          {CATEGORY_CONFIG[n.category]?.label}
                        </span>
                        <span><Eye size={12} /> {n.views}</span>
                        <span>{relativeTime(n.createdAt)}</span>
                        <span className={`pn-status ${n.status}`}>{n.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="profile-notices">
            {myBookmarks.length === 0 ? (
              <div className="profile-empty"><Bookmark size={40} /><p>No bookmarked notices yet</p></div>
            ) : (
              <div className="profile-notice-list">
                {myBookmarks.map(n => (
                  <div key={n.id} className="profile-notice-item" onClick={() => navigate(`/notices?open=${n.id}`)} style={{ cursor: 'pointer' }}>
                    <div className="pn-priority" style={{ background: PRIORITY_CONFIG[n.priority]?.color }} />
                    <div className="pn-body">
                      <h4>{n.title}</h4>
                      <div className="pn-meta">
                        <span className="pn-badge" style={{ background: CATEGORY_CONFIG[n.category]?.color + '18', color: CATEGORY_CONFIG[n.category]?.color }}>
                          {CATEGORY_CONFIG[n.category]?.label}
                        </span>
                        <span><Eye size={12} /> {n.views}</span>
                        <span>{relativeTime(n.publishDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="profile-settings">
            <div className="settings-section">
              <h4><User size={18} /> Edit Profile</h4>
              <div className="settings-form">
                <div className="settings-field">
                  <label>Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
                <div className="settings-field">
                  <label>Department</label>
                  <select value={editDept} onChange={e => setEditDept(e.target.value)}>
                    {DEPARTMENTS.filter(d => d !== 'ALL').map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <button className="btn-save" onClick={handleSaveProfile}><Save size={16} /> Save Changes</button>
              </div>
            </div>

            <div className="settings-section">
              <h4><Lock size={18} /> Change Password</h4>
              <div className="settings-form">
                <div className="settings-field">
                  <label>Current Password</label>
                  <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                </div>
                <div className="settings-field">
                  <label>New Password</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" />
                </div>
                <div className="settings-field">
                  <label>Confirm New Password</label>
                  <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                </div>
                <button className="btn-save" onClick={handleChangePassword}><Lock size={16} /> Change Password</button>
              </div>
            </div>

            <div className="settings-section">
              <h4>{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} Appearance</h4>
              <div className="theme-toggle-setting" onClick={toggleTheme}>
                <div>
                  <p className="setting-label">Dark Mode</p>
                  <p className="setting-desc">Switch between light and dark themes</p>
                </div>
                <div className={`toggle-switch ${theme === 'dark' ? 'on' : ''}`}>
                  <div className="toggle-knob" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
