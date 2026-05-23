import React, { useMemo } from 'react';

const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
};

export default function AnalyticsDashboard({ tasks, pomodoroHistory }) {
  const stats = useMemo(() => {
    // 1. Overall Stats
    const totalCompleted = tasks.filter(t => t.completed).length;
    
    // Calculate total focus minutes from completed sessions
    const totalFocusMinutes = pomodoroHistory.reduce((acc, session) => {
      if (session.status === 'Completed' || session.loopsCompleted > 0) {
        return acc + (session.loopsCompleted * session.workDuration);
      }
      return acc;
    }, 0);
    const focusHours = (totalFocusMinutes / 60).toFixed(1);

    // 2. Last 7 Days Task Completion Data
    const last7Dates = getLast7Days();
    const completionByDay = last7Dates.map(dateStr => {
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const completed = dayTasks.filter(t => t.completed).length;
      const total = dayTasks.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const d = new Date(dateStr);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      return { date: dateStr, dayName, completed, total, percent };
    });

    // 3. Category Breakdown (Daily vs Calendar)
    const dailyCount = tasks.filter(t => t.category === 'daily').length;
    const calendarCount = tasks.filter(t => t.category === 'calendar').length;

    return { totalCompleted, focusHours, completionByDay, dailyCount, calendarCount };
  }, [tasks, pomodoroHistory]);

  return (
    <div className="analytics-dashboard" style={{ padding: '0.5rem' }}>
      <div className="board-header" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: '800' }}>
          Your Productivity
        </h3>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'var(--card-bg)', backdropFilter: 'blur(10px)',
          padding: '1.5rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-glass)'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.5rem' }}>Tasks Done</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-main)' }}>{stats.totalCompleted}</div>
        </div>
        
        <div style={{
          background: 'var(--card-bg)', backdropFilter: 'blur(10px)',
          padding: '1.5rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-glass)'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.5rem' }}>Focus Time</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>{stats.focusHours} <span style={{fontSize: '1rem'}}>hrs</span></div>
        </div>
      </div>

      {/* 7-Day Completion Chart */}
      <div style={{
        background: 'var(--card-bg)', backdropFilter: 'blur(10px)',
        padding: '1.5rem', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-glass)',
        marginBottom: '2rem'
      }}>
        <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontWeight: '700' }}>Last 7 Days Completion</h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '150px', gap: '0.5rem' }}>
          {stats.completionByDay.map((day, i) => (
            <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div 
                title={`${day.completed}/${day.total} tasks completed`}
                style={{ 
                  width: '100%', 
                  maxWidth: '30px', 
                  height: `${day.percent}%`, 
                  minHeight: '4px',
                  background: 'var(--primary-gradient)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 1s cubic-bezier(0.16, 1, 0.3, 1)',
                  opacity: day.percent === 0 ? 0.2 : 1
                }} 
              />
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {day.dayName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{
        background: 'var(--card-bg)', backdropFilter: 'blur(10px)',
        padding: '1.5rem', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-glass)'
      }}>
        <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontWeight: '700' }}>Task Categories</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '600' }}>
              <span style={{ color: 'var(--text-main)' }}>Daily Goals</span>
              <span style={{ color: 'var(--text-muted)' }}>{stats.dailyCount}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${(stats.dailyCount / Math.max(1, stats.dailyCount + stats.calendarCount)) * 100}%`, height: '100%', background: 'var(--accent-main)' }} />
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '600' }}>
              <span style={{ color: 'var(--text-main)' }}>Calendar Tasks</span>
              <span style={{ color: 'var(--text-muted)' }}>{stats.calendarCount}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${(stats.calendarCount / Math.max(1, stats.dailyCount + stats.calendarCount)) * 100}%`, height: '100%', background: 'var(--accent-hover)' }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
