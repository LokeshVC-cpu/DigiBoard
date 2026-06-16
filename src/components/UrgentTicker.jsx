import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNoticesApi } from '../lib/api';
import { isVisibleToSchool } from '../lib/utils';
import { AlertTriangle } from 'lucide-react';
import './UrgentTicker.css';

export default function UrgentTicker() {
  const [urgentNotices, setUrgentNotices] = useState([]);
  const { effectiveSchoolId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUrgent();
  }, [effectiveSchoolId]);

  async function loadUrgent() {
    try {
      const all = await getNoticesApi();
      const urgent = all.filter(n =>
        n.priority === 'urgent' &&
        n.status === 'active' &&
        isVisibleToSchool(n, effectiveSchoolId)
      );
      setUrgentNotices(urgent);
    } catch (e) {
      console.error('Ticker error:', e);
    }
  }

  if (urgentNotices.length === 0) return null;

  return (
    <div className="urgent-ticker">
      <div className="ticker-label">
        <AlertTriangle size={14} />
        <span>URGENT</span>
      </div>
      <div className="ticker-track">
        <div className="ticker-content">
          {urgentNotices.map((n, i) => (
            <span key={`a-${i}`} className="ticker-item" onClick={() => navigate(`/notices?open=${n.id}`)}>
              ⚠️ {n.title}
              <span className="ticker-dot">•</span>
            </span>
          ))}
          {urgentNotices.map((n, i) => (
            <span key={`b-${i}`} className="ticker-item" onClick={() => navigate(`/notices?open=${n.id}`)}>
              ⚠️ {n.title}
              <span className="ticker-dot">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
