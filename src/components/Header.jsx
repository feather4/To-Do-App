import { useEffect, useState } from 'react';

export default function Header({ userName, streak }) {
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <header className="app-header">
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
      </div>
    </header>
  );
}
