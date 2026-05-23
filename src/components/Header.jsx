import { useEffect, useState } from 'react';

export default function Header({ userName, streak, dayStartHour }) {
  const [greeting, setGreeting] = useState('Welcome');
  const [displayDate, setDisplayDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');

      const d = new Date(now);
      d.setHours(d.getHours() - (dayStartHour || 0));
      setDisplayDate(`${d.getDate()} ${d.toLocaleDateString('en-US', { weekday: 'short' })}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [dayStartHour]);

  return (
    <header className="app-header" style={{ paddingRight: '60px' }}>
      <h1 className="app-title">{greeting}, {userName || 'Friend'}!</h1>
      <div className="header-stats" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="streak-counter" title="Current Streak" style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '0.75rem 1rem',
          borderRadius: '999px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          🔥 {streak} {streak === 1 ? 'Day' : 'Days'}
        </div>
        <div className="date-display" title="Today's Date" style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '0.75rem 1rem',
          borderRadius: '999px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          {displayDate}
        </div>
      </div>
    </header>
  );
}
