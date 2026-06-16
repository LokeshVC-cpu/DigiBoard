import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ClipboardList, Bell, Shield, BarChart3, Smartphone, Moon, Sun, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: <ClipboardList size={28} />, title: 'Smart Notices', desc: 'Create rich notices with priorities, categories, and file attachments. Auto-expire old notices.' },
  { icon: <Bell size={28} />, title: 'Instant Alerts', desc: 'Real-time notifications keep everyone informed. Never miss an important announcement.' },
  { icon: <Shield size={28} />, title: 'Role-Based Access', desc: 'Admin, Faculty & Student roles with appropriate permissions and personalized dashboards.' },
  { icon: <BarChart3 size={28} />, title: 'Analytics Dashboard', desc: 'Visual charts showing notice distribution, department activity, and engagement metrics.' },
  { icon: <Smartphone size={28} />, title: 'Works Everywhere', desc: 'Responsive design works on desktop, tablet, and mobile. Install as an app on Android.' },
  { icon: <Moon size={28} />, title: 'Dark Mode', desc: 'Easy on the eyes with a beautiful dark theme. Automatically syncs with your device.' },
];

const steps = [
  { num: '01', title: 'Post a Notice', desc: 'Admin or faculty creates a notice with priority, department, and category tags.' },
  { num: '02', title: 'Everyone Gets Notified', desc: 'Students and staff receive instant notifications about new announcements.' },
  { num: '03', title: 'Stay Organized', desc: 'Filter, search, bookmark, and react to notices. Never lose important information.' },
];

const team = [
  { name: 'A. Devi', roll: '24X41A4201' },
  { name: 'A. Lokesh V C', roll: '24X41A4202' },
  { name: 'A. Gowri Sri Harshini', roll: '24X41A4203' },
  { name: 'B. Balu Sri Ganesh', roll: '24X41A4204' },
  { name: 'B. Nischal', roll: '24X41A4205' },
  { name: 'B. Pavan Kumar', roll: '24X41A4206' },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="brand-icon">D</div>
            <span className="brand-text">DigiBoard</span>
          </div>
          <div className="landing-nav-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn-cta">Get Started <ArrowRight size={16} /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob blob-1" />
          <div className="hero-blob blob-2" />
          <div className="hero-blob blob-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🚀 Digital Notice Board for Colleges</div>
          <h1 className="hero-title">
            Your Campus.<br />
            <span className="gradient-text">One Board.</span><br />
            Zero Paper.
          </h1>
          <p className="hero-desc">
            A smart communication platform that replaces traditional paper notice boards
            with real-time digital announcements accessible anywhere, anytime.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-hero-primary">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Demo Login
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>500+</strong><span>Notices Posted</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>1200+</strong><span>Students</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>6</strong><span>Departments</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="fc-priority urgent" />
            <div className="fc-title">📝 Exam Schedule</div>
            <div className="fc-meta">Urgent • 3h ago</div>
          </div>
          <div className="floating-card card-2">
            <div className="fc-priority important" />
            <div className="fc-title">🎉 Tech Fest 2026</div>
            <div className="fc-meta">Important • 1d ago</div>
          </div>
          <div className="floating-card card-3">
            <div className="fc-priority normal" />
            <div className="fc-title">💼 Placement Drive</div>
            <div className="fc-meta">Normal • 2d ago</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <span className="section-badge">Features</span>
            <h2>Everything you need to<br /><span className="gradient-text">communicate effectively</span></h2>
            <p>Powerful tools designed for educational institutions</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card animate-on-scroll" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section how-section">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <span className="section-badge">How it Works</span>
            <h2>Simple. Fast. <span className="gradient-text">Effective.</span></h2>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card animate-on-scroll" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section benefits-section">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <span className="section-badge">Benefits</span>
            <h2>Why choose <span className="gradient-text">DigiBoard?</span></h2>
          </div>
          <div className="benefits-grid animate-on-scroll">
            {[
              'Reduces paper usage and printing costs',
              'Improves parent-school communication',
              'Saves administrative time',
              'Ensures important notices reach everyone quickly',
              'Helps manage emergency communication effectively',
              'Makes school operations more organized and transparent',
            ].map((b, i) => (
              <div key={i} className="benefit-item">
                <CheckCircle2 size={20} className="benefit-check" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section team-section">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <span className="section-badge">Team</span>
            <h2>Built by <span className="gradient-text">talented minds</span></h2>
            <p>SRK Institute of Technology, Vijayawada</p>
          </div>
          <div className="team-grid">
            {team.map((t, i) => (
              <div key={i} className="team-card animate-on-scroll" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="team-avatar">{t.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                <h4>{t.name}</h4>
                <span className="team-roll">{t.roll}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-icon">D</div>
            <span className="brand-text">DigiBoard</span>
          </div>
          <p>Digital Notice Board App for Local Schools & Colleges</p>
          <div className="footer-college">
            <strong>SRK Institute of Technology</strong>
            <span>Enikepadu, Vijayawada – 521 108 (A.P.)</span>
            <span>Approved by AICTE & Affiliated to JNTUK</span>
          </div>
          <div className="footer-bottom">
            <span>© 2026 DigiBoard. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
