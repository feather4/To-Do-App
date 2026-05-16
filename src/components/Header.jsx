export default function Header({ totalTokens, streak, isVibrating }) {
  return (
    <header className="app-header">
      <h1 className="app-title">Gamified To-Do</h1>
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
        <div id="total-tokens-counter" className={`token-counter ${isVibrating ? 'vibrate-animation' : ''}`}>
          <span className="token-label">Total Tokens</span>
          <span className="token-value">{totalTokens}</span>
        </div>
      </div>
    </header>
  );
}
