import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { getInitials, relativeTime, SCHOOLS } from '../lib/utils';
import {
  LayoutDashboard, ClipboardList, PlusCircle, User, Settings, LogOut,
  Bell, Search, Menu, X, Sun, Moon, ChevronLeft, CalendarDays, Building2,
} from 'lucide-react';
import './Layout.css';
import UrgentTicker from './UrgentTicker';

export default function Layout({ children }) {
  const { user, logout, school, isAdmin, effectiveSchoolId, viewingSchoolId, switchSchool } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/notices?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['admin', 'faculty'] },
    { to: '/notices', icon: <ClipboardList size={20} />, label: 'Notice Board', roles: ['admin', 'faculty', 'student'] },
    { to: '/timetable', icon: <CalendarDays size={20} />, label: 'Timetable', roles: ['admin', 'faculty', 'student'] },
    { to: '/create-notice', icon: <PlusCircle size={20} />, label: 'Create Notice', roles: ['admin', 'faculty'] },
    { to: '/profile', icon: <User size={20} />, label: 'Profile', roles: ['admin', 'faculty', 'student'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const roleBadge = {
    admin: { label: 'Admin', class: 'role-admin' },
    faculty: { label: 'Teacher', class: 'role-faculty' },
    student: { label: 'Student', class: 'role-student' },
  };

  const currentSchoolName = isAdmin
    ? (viewingSchoolId ? SCHOOLS.find(s => s.id === viewingSchoolId)?.name : 'All Schools')
    : (school?.name || 'Unknown School');

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">D</div>
          <span className="sidebar-logo-text">DigiBoard</span>
        </div>

        {/* School Info */}
        <div className="sidebar-school">
          <Building2 size={14} className="school-icon" />
          <span className="nav-label school-name">{currentSchoolName}</span>
        </div>

        {/* Admin school switcher */}
        {isAdmin && (
          <div className="school-switcher nav-label">
            <select value={viewingSchoolId || ''} onChange={e => switchSchool(e.target.value || null)}>
              <option value="">All Schools</option>
              {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {filteredNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle sidebar">
            <ChevronLeft size={18} style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
            <span className="nav-label">Collapse</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className={`topbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="topbar-left">
            <button className="topbar-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <form className="topbar-search" onSubmit={handleSearch}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="notification-wrapper" ref={notifRef}>
              <button className="topbar-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={20} className={unreadCount > 0 ? 'bell-animate' : ''} />
                {unreadCount > 0 && <span className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="notification-panel">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <Bell size={32} />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.relatedNoticeId) navigate(`/notices?open=${n.relatedNoticeId}`);
                            setNotifOpen(false);
                          }}
                        >
                          <div className="notif-dot" />
                          <div className="notif-content">
                            <p className="notif-title">{n.title}</p>
                            <p className="notif-message">{n.message}</p>
                            <span className="notif-time">{relativeTime(n.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="dropdown" ref={dropdownRef}>
              <button className="topbar-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="avatar">{getInitials(user?.name)}</div>
                <div className="topbar-user-info">
                  <span className="topbar-user-name">{user?.name?.split(' ')[0]}</span>
                  <span className={`role-badge ${roleBadge[user?.role]?.class}`}>{roleBadge[user?.role]?.label}</span>
                </div>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu active">
                  <div className="dropdown-user-header">
                    <div className="avatar avatar-lg">{getInitials(user?.name)}</div>
                    <div>
                      <p className="dropdown-user-name">{user?.name}</p>
                      <p className="dropdown-user-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                    <User size={16} /> Profile
                  </button>
                  <button className="dropdown-item" onClick={() => { navigate('/profile?tab=settings'); setDropdownOpen(false); }}>
                    <Settings size={16} /> Settings
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">
          <UrgentTicker />
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-bottom-nav">
        {filteredNav.slice(0, 5).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
