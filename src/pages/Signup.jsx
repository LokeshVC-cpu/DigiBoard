import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPasswordStrength, validateEmail, showToast, DEPARTMENTS, SCHOOLS } from '../lib/utils';
import { Eye, EyeOff, ArrowRight, ArrowLeft, UserPlus, Check } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    dob: '', aadhaar: '', isTeacher: false,
    role: 'student', department: 'Class 10', schoolId: 'sch_patamata',
  });

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const pwStrength = getPasswordStrength(form.password);

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Please enter your name';
    if (!form.dob.trim()) return 'Please enter your Date of Birth';
    if (!form.aadhaar.trim()) return 'Please enter your Aadhaar Number';
    if (!validateEmail(form.email)) return 'Please enter a valid email';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const goStep2 = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signup(form);
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
          <h2>Join DigiBoard</h2>
          <p>Create your account and start receiving school announcements.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h3>Create your account</h3>
            <p>Step {step} of 2</p>
          </div>

          {/* Progress */}
          <div className="signup-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}><span>1</span> Info</div>
            <div className="progress-line"><div className={`progress-fill ${step >= 2 ? 'filled' : ''}`} /></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}><span>2</span> Role</div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Ravi Kumar"
                    value={form.name} onChange={e => updateForm('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="you@school.gov.in"
                    value={form.email} onChange={e => updateForm('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" 
                    value={form.dob} onChange={e => updateForm('dob', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar Number</label>
                  <input type="text" className="form-input" placeholder="XXXX XXXX XXXX"
                    value={form.aadhaar} onChange={e => updateForm('aadhaar', e.target.value)} maxLength={14} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-wrapper">
                    <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="Min 6 characters"
                      value={form.password} onChange={e => updateForm('password', e.target.value)} />
                    <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="pw-strength">
                      <div className="pw-strength-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`pw-bar ${
                            (pwStrength.level === 'weak' && i <= 1) ||
                            (pwStrength.level === 'medium' && i <= 2) ||
                            (pwStrength.level === 'strong' && i <= 3) ||
                            (pwStrength.level === 'very-strong') ? 'filled' : ''
                          }`} style={{ '--bar-color': pwStrength.color }} />
                        ))}
                      </div>
                      <span style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-input" placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} />
                </div>
                <button type="button" className="auth-submit-btn" onClick={goStep2}>
                  Next <ArrowRight size={18} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={form.isTeacher}
                      onChange={e => {
                        const isT = e.target.checked;
                        setForm(prev => ({ 
                          ...prev, 
                          isTeacher: isT, 
                          role: isT ? 'faculty' : 'student',
                          department: isT ? 'Mathematics' : 'Class 10'
                        }));
                      }} 
                    />
                    I am a teacher
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">{form.isTeacher ? 'Subject' : 'Class'}</label>
                  {form.isTeacher ? (
                    <select className="form-select" value={form.department} onChange={e => updateForm('department', e.target.value)}>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="Social Studies">Social Studies</option>
                      <option value="English">English</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Physical Education">Physical Education</option>
                    </select>
                  ) : (
                    <select className="form-select" value={form.department} onChange={e => updateForm('department', e.target.value)}>
                      {DEPARTMENTS.filter(d => d !== 'ALL').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">School</label>
                  <select className="form-select" value={form.schoolId} onChange={e => updateForm('schoolId', e.target.value)}>
                    {SCHOOLS.map(s => (
                      <option key={s.id} value={s.id}>{s.name} — {s.location}</option>
                    ))}
                  </select>
                </div>
                <div className="auth-form-actions">
                  <button type="button" className="auth-back-btn" onClick={() => setStep(1)}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button type="submit" className="auth-submit-btn" disabled={loading} style={{ flex: 1 }}>
                    {loading ? <div className="btn-spinner" /> : <><UserPlus size={18} /> Create Account</>}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in <ArrowRight size={14} /></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
