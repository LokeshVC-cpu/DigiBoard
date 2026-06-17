import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMarksApi, createMarkApi, deleteMarkApi, updateMarkApi, getUsersApi } from '../lib/api';
import { DEPARTMENTS, SCHOOLS } from '../lib/utils';
import { Award, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import './Marks.css';

export default function Marks() {
  const { user, isAdmin, effectiveSchoolId } = useAuth();
  
  const [marks, setMarks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterDept, setFilterDept] = useState(user?.role === 'student' ? user.department : 'ALL');
  const [filterSchool, setFilterSchool] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State (For Admin/Faculty)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schoolId: '',
    studentId: '',
    department: '',
    examType: 'Unit Test 1',
    subject: '',
    marksObtained: '',
    totalMarks: '100'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [effectiveSchoolId, filterDept]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      // Determine school filter: if sidebar is ALL, use the local filterSchool. Otherwise, lock it to sidebar's school.
      const querySchoolId = effectiveSchoolId === 'ALL' ? (filterSchool === 'ALL' ? null : filterSchool) : effectiveSchoolId;
      if (querySchoolId) filters.schoolId = querySchoolId;
      
      if (filterDept !== 'ALL' && user?.role !== 'student') filters.department = filterDept;

      const [marksData, usersData] = await Promise.all([
        getMarksApi(filters),
        user?.role !== 'student' ? getUsersApi() : Promise.resolve([])
      ]);

      setMarks(marksData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateMarkApi(editingId, {
          examType: formData.examType,
          subject: formData.subject,
          marksObtained: Number(formData.marksObtained),
          totalMarks: Number(formData.totalMarks)
        });
        setEditingId(null);
      } else {
        await createMarkApi({
          studentId: formData.studentId,
          schoolId: user?.role === 'admin' ? formData.schoolId : user.schoolId,
          department: formData.department,
          examType: formData.examType,
          subject: formData.subject,
          marksObtained: Number(formData.marksObtained),
          totalMarks: Number(formData.totalMarks)
        });
      }
      
      // Reset form (keep class and exam type selected for convenience)
      setFormData(prev => ({ ...prev, studentId: '', subject: '', marksObtained: '' }));
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mark record?')) return;
    try {
      await deleteMarkApi(id);
      setMarks(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (mark) => {
    setEditingId(mark.id);
    setFormData({
      studentId: mark.studentId,
      department: mark.department,
      examType: mark.examType,
      subject: mark.subject,
      marksObtained: mark.marksObtained,
      totalMarks: mark.totalMarks
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter students for the dropdown based on selected school and department
  const availableStudents = users.filter(u => 
    u.role === 'student' && 
    (user?.role === 'admin' ? (formData.schoolId ? u.schoolId === formData.schoolId : true) : u.schoolId === user?.schoolId) &&
    (formData.department ? u.department === formData.department : true)
  );

  // Helper to find student name
  const getStudentName = (id) => users.find(u => u.id === id)?.name || 'Unknown Student';

  if (loading && marks.length === 0) return <div className="page-loader">Loading...</div>;

  return (
    <div className="marks-page page-enter">
      <div className="page-header">
        <div>
          <h2><Award size={28} className="text-primary" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Student Marks</h2>
          <p>View and manage academic performance.</p>
        </div>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Admin / Faculty Form */}
      {(user?.role === 'admin' || user?.role === 'faculty') && (
        <div className="marks-form-card">
          <h3>{editingId ? 'Edit Marks' : 'Add New Marks'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="marks-form-grid">
              
              {!editingId && (
                <>
                  {user?.role === 'admin' && (
                    <div className="form-group">
                      <label className="form-label">School</label>
                      <select className="form-select" name="schoolId" value={formData.schoolId} onChange={handleInputChange} required>
                        <option value="">Select School</option>
                        {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Class / Department</label>
                    <select className="form-select" name="department" value={formData.department} onChange={handleInputChange} required>
                      <option value="">Select Class</option>
                      {DEPARTMENTS.filter(d => d !== 'ALL').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Student</label>
                    <select className="form-select" name="studentId" value={formData.studentId} onChange={handleInputChange} required disabled={!formData.department || (user?.role === 'admin' && !formData.schoolId)}>
                      <option value="">{formData.department ? 'Select Student' : 'Select Class First'}</option>
                      {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {editingId && (
                <div className="form-group">
                  <label className="form-label">Student</label>
                  <input className="form-input" value={getStudentName(formData.studentId)} disabled />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Exam Type</label>
                <select className="form-select" name="examType" value={formData.examType} onChange={handleInputChange} required>
                  <option value="Unit Test 1">Unit Test 1</option>
                  <option value="Unit Test 2">Unit Test 2</option>
                  <option value="Quarterly Exam">Quarterly Exam</option>
                  <option value="Half Yearly Exam">Half Yearly Exam</option>
                  <option value="Pre-Final">Pre-Final</option>
                  <option value="Final Exam">Final Exam</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input type="text" className="form-input" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g. Mathematics" required />
              </div>

              <div className="form-group">
                <label className="form-label">Marks Obtained</label>
                <input type="number" className="form-input" name="marksObtained" value={formData.marksObtained} onChange={handleInputChange} min="0" max={formData.totalMarks} required />
              </div>

              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input type="number" className="form-input" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} min="1" required />
              </div>
            </div>
            
            <div className="form-group-row">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                <Plus size={18} /> {editingId ? 'Update Marks' : 'Add Marks'}
              </button>
              {editingId && (
                <button type="button" className="btn-primary" style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-primary)' }} onClick={() => { setEditingId(null); setFormData(prev => ({...prev, studentId: ''})); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="marks-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search student by name..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ minWidth: '200px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="marks-filters" style={{ display: 'flex', gap: '12px' }}>
          {user?.role === 'admin' && effectiveSchoolId === 'ALL' && (
            <select 
              value={filterSchool} 
              onChange={e => setFilterSchool(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              <option value="ALL">All Schools</option>
              {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          {user?.role !== 'student' && (
            <select 
              value={filterDept} 
              onChange={(e) => setFilterDept(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Classes' : d}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Marks Table */}
      <div className="marks-table-container">
        <table className="marks-table">
          <thead>
            <tr>
              <th>Date</th>
              {user?.role !== 'student' && <th>Student</th>}
              <th>Exam</th>
              <th>Subject</th>
              <th>Marks</th>
              <th>%</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {marks.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem' }}>
                  No marks found for the selected criteria.
                </td>
              </tr>
            ) : (
              marks
              .filter(mark => {
                // Apply frontend search query
                if (!searchQuery) return true;
                const studentName = getStudentName(mark.studentId).toLowerCase();
                return studentName.includes(searchQuery.toLowerCase());
              })
              .map(mark => {
                const percentage = ((mark.marksObtained / mark.totalMarks) * 100).toFixed(1);
                const isPass = percentage >= 35; // Assuming 35% is pass
                
                return (
                  <tr key={mark.id}>
                    <td>{new Date(mark.date).toLocaleDateString()}</td>
                    {user?.role !== 'student' && (
                      <td>
                        <strong>{getStudentName(mark.studentId)}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{mark.department}</div>
                      </td>
                    )}
                    <td>{mark.examType}</td>
                    <td>{mark.subject}</td>
                    <td>
                      <span className={`marks-score ${isPass ? 'pass' : 'fail'}`}>
                        {mark.marksObtained}
                      </span> / {mark.totalMarks}
                    </td>
                    <td>
                      <span className={`marks-score ${isPass ? 'pass' : 'fail'}`}>{percentage}%</span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="marks-actions">
                          <button className="mark-action-btn" onClick={() => handleEdit(mark)} title="Edit"><Edit2 size={16} /></button>
                          <button className="mark-action-btn delete" onClick={() => handleDelete(mark.id)} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
