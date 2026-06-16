import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNoticesApi, getUsersApi, getBookmarksApi, getCommentsApi, toggleBookmarkApi, updateNoticeApi, createCommentApi, deleteNoticeApi } from '../lib/api';
import { relativeTime, stripHtml, truncateText, debounce, generateId, isVisibleToSchool, DEPARTMENTS, CATEGORIES, PRIORITIES, CATEGORY_CONFIG, PRIORITY_CONFIG } from '../lib/utils';
import { Search, Filter, Pin, Eye, MessageCircle, Bookmark, BookmarkCheck, X, Send, ChevronDown, Clock, Paperclip, Trash2 } from 'lucide-react';
import './NoticeBoard.css';

export default function NoticeBoard() {
  const { user, effectiveSchoolId } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notices, setNotices] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({ department: 'ALL', category: '', priority: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadData(); }, [effectiveSchoolId]);

  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId && notices.length > 0) {
      const n = notices.find(n => n.id === openId);
      if (n) openNotice(n);
    }
  }, [searchParams, notices]);

  async function loadData() {
    try {
      const [allNotices, allUsers, allBookmarks, allComments] = await Promise.all([
        getNoticesApi(), getUsersApi(), getBookmarksApi(), getCommentsApi()
      ]);
      const active = allNotices.filter(n => n.status === 'active' && isVisibleToSchool(n, effectiveSchoolId));
      const sorted = active.sort((a, b) => {
        // Admin global notices (schoolId='ALL') always pin to top
        const aGlobal = a.schoolId === 'ALL';
        const bGlobal = b.schoolId === 'ALL';
        if (aGlobal && !bGlobal) return -1;
        if (!aGlobal && bGlobal) return 1;
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.publishDate) - new Date(a.publishDate);
      });
      setNotices(sorted);
      setUsers(allUsers);
      setBookmarks(allBookmarks);
      setComments(allComments);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filteredNotices = useMemo(() => {
    let result = notices;
    if (filters.department && filters.department !== 'ALL') {
      result = result.filter(n => n.department === filters.department || n.department === 'ALL');
    }
    if (filters.category) result = result.filter(n => n.category === filters.category);
    if (filters.priority) result = result.filter(n => n.priority === filters.priority);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        stripHtml(n.content).toLowerCase().includes(q)
      );
    }
    return result;
  }, [notices, filters, searchQuery]);

  const getAuthor = (id) => users.find(u => u.id === id);
  const isBookmarked = (noticeId) => bookmarks.some(b => b.noticeId === noticeId);
  const getComments = (noticeId) => comments.filter(c => c.noticeId === noticeId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  async function toggleBookmark(noticeId) {
    const existing = bookmarks.find(b => b.noticeId === noticeId);
    await toggleBookmarkApi(noticeId, !!existing, existing?.id);
    const updated = await getBookmarksApi();
    setBookmarks(updated);
  }

  async function toggleReaction(notice, emoji) {
    const reactions = { ...notice.reactions };
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    const updated = { ...notice, reactions };
    await updateNoticeApi(notice.id, updated);
    setNotices(prev => prev.map(n => n.id === notice.id ? updated : n));
    if (selectedNotice?.id === notice.id) setSelectedNotice(updated);
  }

  async function addComment(noticeId) {
    if (!commentText.trim()) return;
    const newComment = {
      id: generateId('cmt'),
      noticeId: selectedNotice.id,
      userId: user.id,
      userName: user.name,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };
    await createCommentApi(newComment);
    const updatedComments = await getCommentsApi();
    setComments(updatedComments);
    setCommentText('');
  }

  async function openNotice(notice) {
    const updated = { ...notice, views: (notice.views || 0) + 1 };
    await updateNoticeApi(notice.id, updated);
    setNotices(prev => prev.map(n => n.id === notice.id ? updated : n));
    setSelectedNotice(updated);
  }

  function closeModal() {
    setSelectedNotice(null);
    setCommentText('');
    if (searchParams.get('open')) {
      searchParams.delete('open');
      setSearchParams(searchParams);
    }
  }

  const handleDeleteNotice = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this notice?')) return;
    try {
      await deleteNoticeApi(id);
      setNotices(prev => prev.filter(n => n.id !== id));
      closeModal();
    } catch (err) {
      console.error('Failed to delete notice:', err);
      alert('Failed to delete notice');
    }
  };

  const activeFilters = [filters.department !== 'ALL' && filters.department, filters.category, filters.priority].filter(Boolean).length;

  return (
    <div className="noticeboard page-enter">
      <div className="page-header">
        <div>
          <h2>Notice Board</h2>
          <p>{filteredNotices.length} notice{filteredNotices.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="nb-toolbar">
        <div className="nb-search">
          <Search size={18} />
          <input type="text" placeholder="Search notices..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && <button className="nb-search-clear" onClick={() => setSearchQuery('')}><X size={16} /></button>}
        </div>
        <button className={`nb-filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={16} /> Filters {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="nb-filters">
          <div className="filter-group">
            <label>Department</label>
            <select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <div className="filter-pills">
              <button className={`pill ${!filters.category ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, category: '' }))}>All</button>
              {CATEGORIES.map(c => (
                <button key={c} className={`pill ${filters.category === c ? 'active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, category: f.category === c ? '' : c }))}>
                  {CATEGORY_CONFIG[c]?.icon} {CATEGORY_CONFIG[c]?.label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Priority</label>
            <div className="filter-pills">
              <button className={`pill ${!filters.priority ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, priority: '' }))}>All</button>
              {PRIORITIES.map(p => (
                <button key={p} className={`pill ${filters.priority === p ? 'active' : ''}`}
                  style={filters.priority === p ? { background: PRIORITY_CONFIG[p].color, color: 'white', borderColor: PRIORITY_CONFIG[p].color } : {}}
                  onClick={() => setFilters(f => ({ ...f, priority: f.priority === p ? '' : p }))}>
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>
          {activeFilters > 0 && (
            <button className="clear-filters" onClick={() => setFilters({ department: 'ALL', category: '', priority: '' })}>
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Notice Grid */}
      {loading ? (
        <div className="notice-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="notice-skeleton" />)}
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="nb-empty">
          <ClipboardList size={48} />
          <h3>No notices found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="notice-grid">
          {filteredNotices.map((n, i) => {
            const author = getAuthor(n.author);
            const noticeComments = getComments(n.id);
            const totalReactions = Object.values(n.reactions || {}).reduce((a, b) => a + b, 0);
            return (
              <div key={n.id} className="notice-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => openNotice(n)}>
                <div className="notice-priority-strip" style={{ background: PRIORITY_CONFIG[n.priority]?.color }} />
                <div className="notice-card-body">
                  <div className="notice-card-top">
                    <div className="notice-badges">
                      {n.isPinned && <span className="badge-pin"><Pin size={12} /> Pinned</span>}
                      <span className="badge-cat" style={{ background: CATEGORY_CONFIG[n.category]?.color + '18', color: CATEGORY_CONFIG[n.category]?.color }}>
                        {CATEGORY_CONFIG[n.category]?.icon} {CATEGORY_CONFIG[n.category]?.label}
                      </span>
                      {n.department !== 'ALL' && <span className="badge-dept">{n.department}</span>}
                    </div>
                    <button className="bookmark-btn" onClick={(e) => { e.stopPropagation(); toggleBookmark(n.id); }}>
                      {isBookmarked(n.id) ? <BookmarkCheck size={18} className="bookmarked" /> : <Bookmark size={18} />}
                    </button>
                  </div>
                  <h3 className="notice-title">{n.title}</h3>
                  <p className="notice-preview">{truncateText(stripHtml(n.content), 100)}</p>
                  <div className="notice-card-footer">
                    <div className="notice-author">
                      <div className="avatar-sm">{author?.name?.[0] || '?'}</div>
                      <span>{author?.name?.split(' ')[0] || 'Unknown'}</span>
                    </div>
                    <div className="notice-meta">
                      <span><Eye size={13} /> {n.views}</span>
                      <span><MessageCircle size={13} /> {noticeComments.length}</span>
                      {totalReactions > 0 && <span>👍 {totalReactions}</span>}
                      <span><Clock size={13} /> {relativeTime(n.publishDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="notice-modal" onClick={e => e.stopPropagation()}>
            <div className="notice-modal-header">
              <div className="modal-badges">
                <span className="badge-priority" style={{ background: PRIORITY_CONFIG[selectedNotice.priority]?.bg, color: PRIORITY_CONFIG[selectedNotice.priority]?.color }}>
                  {PRIORITY_CONFIG[selectedNotice.priority]?.label}
                </span>
                <span className="badge-cat" style={{ background: CATEGORY_CONFIG[selectedNotice.category]?.color + '18', color: CATEGORY_CONFIG[selectedNotice.category]?.color }}>
                  {CATEGORY_CONFIG[selectedNotice.category]?.icon} {CATEGORY_CONFIG[selectedNotice.category]?.label}
                </span>
                {selectedNotice.department !== 'ALL' && <span className="badge-dept">{selectedNotice.department}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDeleteNotice(selectedNotice.id)} style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                )}
                <button className="modal-close" onClick={closeModal}><X size={20} /></button>
              </div>
            </div>
            <div className="notice-modal-body">
              <h2>{selectedNotice.title}</h2>
              <div className="modal-author-row">
                <div className="avatar-sm">{getAuthor(selectedNotice.author)?.name?.[0] || '?'}</div>
                <div>
                  <span className="modal-author-name">{getAuthor(selectedNotice.author)?.name || 'Unknown'}</span>
                  <span className="modal-date">{relativeTime(selectedNotice.publishDate)} · {selectedNotice.views} views</span>
                </div>
              </div>
              <div className="notice-content" dangerouslySetInnerHTML={{ __html: selectedNotice.content }} />

              {/* Reactions */}
              <div className="notice-reactions">
                {['👍', '❤️', '📌'].map(emoji => (
                  <button key={emoji} className="reaction-btn" onClick={() => toggleReaction(selectedNotice, emoji)}>
                    {emoji} <span>{selectedNotice.reactions?.[emoji] || 0}</span>
                  </button>
                ))}
                <button className={`reaction-btn bookmark ${isBookmarked(selectedNotice.id) ? 'active' : ''}`}
                  onClick={() => toggleBookmark(selectedNotice.id)}>
                  {isBookmarked(selectedNotice.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  <span>{isBookmarked(selectedNotice.id) ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {/* Comments */}
              <div className="notice-comments">
                <h4>Comments ({getComments(selectedNotice.id).length})</h4>
                <div className="comments-list">
                  {getComments(selectedNotice.id).map(c => (
                    <div key={c.id} className="comment-item">
                      <div className="avatar-sm">{c.userName?.[0] || '?'}</div>
                      <div className="comment-body">
                        <div className="comment-header">
                          <strong>{c.userName}</strong>
                          <span>{relativeTime(c.createdAt)}</span>
                        </div>
                        <p>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="comment-input">
                  <input type="text" placeholder="Write a comment..." value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addComment(selectedNotice.id)} />
                  <button onClick={() => addComment(selectedNotice.id)} disabled={!commentText.trim()}>
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
