import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { createNoticeApi, updateNoticeApi, getNoticesApi } from '../lib/api';
import { generateId, showToast, DEPARTMENTS, CATEGORIES, PRIORITIES, CATEGORY_CONFIG, PRIORITY_CONFIG, SCHOOLS } from '../lib/utils';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Heading2, Eye, Save, Send, ArrowLeft } from 'lucide-react';
import './CreateNotice.css';

export default function CreateNotice() {
  const { user, isAdmin } = useAuth();
  const { notifyAllUsers } = useNotifications();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    title: '', department: 'ALL', category: 'general', priority: 'normal',
    isPinned: isAdmin, publishDate: new Date().toISOString().slice(0, 16),
    expiryDate: '', status: 'active',
    schoolId: isAdmin ? 'ALL' : (user?.schoolId || ''),
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      getNoticesApi().then(notices => {
        const notice = notices.find(n => n.id === editId);
        if (notice) {
          setForm({
            title: notice.title, department: notice.department, category: notice.category,
            priority: notice.priority, isPinned: notice.isPinned,
            publishDate: notice.publishDate?.slice(0, 16) || '',
            expiryDate: notice.expiryDate?.slice(0, 16) || '',
            status: notice.status,
          });
          if (editorRef.current) editorRef.current.innerHTML = notice.content || '';
        }
      });
    }
  }, [editId]);

  const execCommand = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };

  const handleSubmit = async (asDraft = false) => {
    if (!form.title.trim()) { showToast('Please enter a title', 'error'); return; }
    const content = editorRef.current?.innerHTML || '';
    if (!content.trim() || content === '<br>') { showToast('Please enter notice content', 'error'); return; }

    setLoading(true);
    try {
        // Determine schoolId and auto-pin for admin
        const noticeSchoolId = isAdmin ? (form.schoolId || 'ALL') : user.schoolId;
        const notice = {
          id: editId || generateId('ntc'),
          title: form.title.trim(),
          content,
          author: user.id,
          department: form.department,
          category: form.category,
          priority: form.priority,
          isPinned: noticeSchoolId === 'ALL' ? true : form.isPinned,
          attachments: [],
          publishDate: form.publishDate ? new Date(form.publishDate).toISOString() : new Date().toISOString(),
          expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
          status: asDraft ? 'draft' : 'active',
          schoolId: noticeSchoolId,
          views: editId ? undefined : 0,
          reactions: editId ? undefined : {},
          createdAt: editId ? undefined : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

      // Remove undefined values
      Object.keys(notice).forEach(k => notice[k] === undefined && delete notice[k]);

      if (editId) {
        await updateNoticeApi(editId, notice);
        showToast('Notice updated successfully!', 'success');
      } else {
        await createNoticeApi(notice);
        if (!asDraft) {
          await notifyAllUsers({
            type: 'new_notice', title: `New ${PRIORITY_CONFIG[form.priority].label} Notice`,
            message: form.title, relatedNoticeId: notice.id,
          });
        }
        showToast(asDraft ? 'Draft saved!' : 'Notice published!', 'success');
      }
      navigate('/notices');
    } catch (e) {
      showToast('Error saving notice: ' + e.message, 'error');
    }
    setLoading(false);
  };

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="create-notice page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <div>
            <h2>{editId ? 'Edit Notice' : 'Create Notice'}</h2>
            <p>{editId ? 'Update this notice' : 'Compose a new notice for your school'}</p>
          </div>
        </div>
        <div className="cn-actions">
          <button className="btn-secondary" onClick={() => handleSubmit(true)} disabled={loading}>
            <Save size={16} /> Save Draft
          </button>
          <button className="btn-primary" onClick={() => handleSubmit(false)} disabled={loading}>
            {loading ? <div className="btn-spinner" /> : <><Send size={16} /> Publish</>}
          </button>
        </div>
      </div>

      <div className="cn-layout">
        {/* Editor */}
        <div className="cn-editor-section">
          <div className="cn-title-input">
            <input type="text" placeholder="Notice title..." value={form.title}
              onChange={e => updateForm('title', e.target.value)} />
          </div>

          <div className="cn-toolbar">
            <button onClick={() => execCommand('bold')} title="Bold"><Bold size={16} /></button>
            <button onClick={() => execCommand('italic')} title="Italic"><Italic size={16} /></button>
            <button onClick={() => execCommand('underline')} title="Underline"><Underline size={16} /></button>
            <div className="toolbar-divider" />
            <button onClick={() => execCommand('formatBlock', 'h3')} title="Heading"><Heading2 size={16} /></button>
            <button onClick={() => execCommand('insertUnorderedList')} title="Bullet List"><List size={16} /></button>
            <button onClick={() => execCommand('insertOrderedList')} title="Numbered List"><ListOrdered size={16} /></button>
            <button onClick={insertLink} title="Insert Link"><LinkIcon size={16} /></button>
            <div className="toolbar-divider" />
            <button className={`preview-toggle ${showPreview ? 'active' : ''}`}
              onClick={() => setShowPreview(!showPreview)} title="Preview">
              <Eye size={16} /> Preview
            </button>
          </div>

          {showPreview ? (
            <div className="cn-preview">
              <h3>{form.title || 'Untitled'}</h3>
              <div className="notice-content" dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || '' }} />
            </div>
          ) : (
            <div className="cn-editor" ref={editorRef} contentEditable suppressContentEditableWarning
              data-placeholder="Write your notice content here... (supports rich text formatting)" />
          )}
        </div>

        {/* Settings Panel */}
        <div className="cn-settings">
          <h4>Notice Settings</h4>

          <div className="cn-field">
            <label>Priority</label>
            <div className="priority-picker">
              {PRIORITIES.map(p => (
                <button key={p} className={`priority-option ${form.priority === p ? 'selected' : ''}`}
                  style={form.priority === p ? { background: PRIORITY_CONFIG[p].bg, borderColor: PRIORITY_CONFIG[p].color, color: PRIORITY_CONFIG[p].color } : {}}
                  onClick={() => updateForm('priority', p)}>
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          <div className="cn-field">
            <label>Department</label>
            <select value={form.department} onChange={e => updateForm('department', e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>)}
            </select>
          </div>

          <div className="cn-field">
            <label>Category</label>
            <select value={form.category} onChange={e => updateForm('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_CONFIG[c]?.icon} {CATEGORY_CONFIG[c]?.label}</option>)}
            </select>
          </div>

          <div className="cn-field">
            <label>Publish Date</label>
            <input type="datetime-local" value={form.publishDate} onChange={e => updateForm('publishDate', e.target.value)} />
          </div>

          <div className="cn-field">
            <label>Expiry Date (optional)</label>
            <input type="datetime-local" value={form.expiryDate} onChange={e => updateForm('expiryDate', e.target.value)} />
          </div>

          {/* Admin: pick target school */}
          {isAdmin && (
            <div className="cn-field">
              <label>Target School</label>
              <select value={form.schoolId} onChange={e => updateForm('schoolId', e.target.value)}>
                <option value="ALL">All Schools (Global)</option>
                {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {form.schoolId === 'ALL' && <small style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>Global notices are auto-pinned to all schools</small>}
            </div>
          )}

          <div className="cn-field">
            <label className="cn-checkbox">
              <input type="checkbox" checked={form.isPinned} onChange={e => updateForm('isPinned', e.target.checked)} disabled={isAdmin && form.schoolId === 'ALL'} />
              <span>Pin this notice</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
