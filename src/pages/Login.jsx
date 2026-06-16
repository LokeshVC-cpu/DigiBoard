import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../lib/utils';
import { Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'student' ? '/notices' : '/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const quickLogin = async (role) => {
    const creds = {
      admin: { email: 'admin@school.gov.in', password: 'admin123' },
      faculty: { email: 'teacher@school.gov.in', password: 'teacher123' },
      student: { email: 'student@school.gov.in', password: 'student123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
    setLoading(true);
    try {
      const user = await login(creds[role].email, creds[role].password);
      navigate(user.role === 'student' ? '/notices' : '/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-blob blob-1" />
          <div className="auth-left-blob blob-2" />
          <div className="auth-left-brand">
            <div className="brand-icon" style={{ width: 42, height: 42, fontSize: '1.2rem' }}>D</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>DigiBoard</span>
          </div>
          <h2>Welcome Back!</h2>
          <p>Access your school's digital notice board and stay updated with all announcements.</p>
          <div className="auth-left-features">
            <div className="auth-feature">📋 View & manage school notices</div>
            <div className="auth-feature">🔔 Instant notifications</div>
            <div className="auth-feature">📊 School dashboard</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h3>Sign in to DigiBoard</h3>
            <p>Enter your credentials to access your account</p>
          </div>

          {/* Quick Login */}
          <div className="quick-login">
            <span className="quick-login-label">Quick Demo Login</span>
            <div className="quick-login-btns">
              <button onClick={() => quickLogin('admin')} className="quick-btn admin">
                <span className="quick-btn-role">Admin (DEO)</span>
              </button>
              <button onClick={() => quickLogin('faculty')} className="quick-btn faculty">
                <span className="quick-btn-role">Teacher (Patamata)</span>
              </button>
              <button onClick={() => quickLogin('student')} className="quick-btn student">
                <span className="quick-btn-role">Student (Patamata)</span>
              </button>
            </div>
          </div>

          <div className="auth-divider"><span>or sign in with email</span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" className="form-input" placeholder="you@school.gov.in"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPw ? 'text' : 'password'} className="form-input"
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <div className="btn-spinner" /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one <ArrowRight size={14} /></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
