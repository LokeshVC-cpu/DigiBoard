import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PERIODS, DAYS, SUBJECT_COLORS, TIMETABLES } from '../lib/timetable';
import { CalendarDays, ChevronDown } from 'lucide-react';
import './Timetable.css';

export default function Timetable() {
  const { user } = useAuth();

  // Determine which class to show
  const userClass = user?.department;
  const availableClasses = Object.keys(TIMETABLES);
  const isStudent = user?.role === 'student';

  // Students see only their class, admin/teacher can switch
  const [selectedClass, setSelectedClass] = useState(
    availableClasses.includes(userClass) ? userClass : 'Class 6'
  );

  // Highlight today
  const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon...6=Sat
  const todayName = DAYS[todayIndex - 1]; // Mon=0 in our array

  const timetable = TIMETABLES[selectedClass];

  if (!timetable) {
    return (
      <div className="timetable-page page-enter">
        <div className="page-header">
          <h2>Timetable</h2>
          <p>No timetable available for your class.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timetable-page page-enter">
      <div className="page-header">
        <div>
          <h2>📅 Timetable</h2>
          <p>
            {isStudent
              ? `Your weekly schedule — ${selectedClass}`
              : `Viewing timetable for ${selectedClass}`}
          </p>
        </div>

        {/* Class selector for admin/teacher */}
        {!isStudent && (
          <div className="class-selector">
            <label>Select Class:</label>
            <div className="class-pills">
              {availableClasses.map(cls => (
                <button
                  key={cls}
                  className={`class-pill ${selectedClass === cls ? 'active' : ''}`}
                  onClick={() => setSelectedClass(cls)}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Today's highlight card */}
      {todayName && timetable[todayName] && (
        <div className="today-card">
          <div className="today-header">
            <CalendarDays size={20} />
            <h3>Today — {todayName}</h3>
          </div>
          <div className="today-subjects">
            {PERIODS.map((period, i) => {
              if (period.isBreak) return null;
              const subject = timetable[todayName]?.[i];
              if (!subject) return null;
              const style = SUBJECT_COLORS[subject] || { bg: '#f1f5f9', color: '#475569', border: '#94a3b8' };
              return (
                <div key={i} className="today-chip" style={{ background: style.bg, color: style.color, borderColor: style.border }}>
                  <span className="today-period">P{period.num}</span>
                  <span className="today-subject">{subject}</span>
                  <span className="today-time">{period.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full timetable grid */}
      <div className="timetable-scroll">
        <table className="timetable-table">
          <thead>
            <tr>
              <th className="th-day">Day / Period</th>
              {PERIODS.map((p, i) => (
                <th key={i} className={p.isBreak ? 'th-break' : ''}>
                  {p.isBreak ? p.label : `P${p.num}`}
                  <span className="th-time">{p.time}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day} className={day === todayName ? 'row-today' : ''}>
                <td className="td-day">
                  <span className="day-name">{day}</span>
                  {day === todayName && <span className="today-badge">Today</span>}
                </td>
                {PERIODS.map((period, i) => {
                  if (period.isBreak) {
                    return <td key={i} className="td-break">{period.label}</td>;
                  }
                  const subject = timetable[day]?.[i] || '—';
                  const style = SUBJECT_COLORS[subject] || {};
                  return (
                    <td key={i} className="td-subject">
                      <div
                        className="subject-cell"
                        style={style.bg ? { background: style.bg, color: style.color, borderLeft: `3px solid ${style.border}` } : {}}
                      >
                        {subject}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="timetable-legend">
        <h4>Subjects</h4>
        <div className="legend-grid">
          {Object.entries(SUBJECT_COLORS)
            .filter(([name]) => {
              // Only show subjects that appear in this class's timetable
              return Object.values(timetable).some(daySubjects =>
                daySubjects.includes(name)
              );
            })
            .map(([name, style]) => (
              <div key={name} className="legend-item" style={{ background: style.bg, color: style.color, borderColor: style.border }}>
                {name}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
