import React from 'react';

const icons = {
  daily: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  ),

  calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  analytics: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  timer: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8"></circle>
      <path d="M12 9v4l2 2"></path>
      <path d="M5 3L2 6"></path>
      <path d="M19 3l3 3"></path>
    </svg>
  ),
  add: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  mic: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  )
};

export default function BottomNav({ activeTab, onTabChange, onTimerClick, onAddClick, isAdding, onMicClick, isListening }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        <button 
          className={`nav-item ${activeTab === 'daily' ? 'active' : ''}`} 
          onClick={() => onTabChange('daily')}
          title="Daily Goals"
        >
          {icons.daily}
        </button>

        <button 
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} 
          onClick={() => onTabChange('calendar')}
          title="Calendar"
        >
          {icons.calendar}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-20px)', gap: '4px' }}>
          <button 
            className={`nav-item add-btn ${isAdding ? 'rotate' : ''}`} 
            onClick={onAddClick}
            title="Add Task"
            style={{
              background: 'var(--primary-gradient)',
              color: 'white',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              border: '4px solid var(--bg-main, #ffffff)',
              margin: 0
            }}
          >
            {icons.add}
          </button>
          
          <button
            onClick={onMicClick}
            title="Voice Command"
            style={{
               background: isListening ? '#ef4444' : 'var(--card-bg, #ffffff)',
               color: isListening ? 'white' : 'var(--text-main)',
               borderRadius: '50%',
               width: '36px',
               height: '36px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               border: '2px solid var(--card-border, #e5e7eb)',
               boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
               cursor: 'pointer',
               animation: isListening ? 'pulse 1.5s infinite' : 'none',
               margin: 0
            }}
          >
             {icons.mic}
          </button>
        </div>

        <button 
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} 
          onClick={() => onTabChange('analytics')}
          title="Analytics"
        >
          {icons.analytics}
        </button>
        <div className="nav-divider" />
        <button 
          className="nav-item timer-btn" 
          onClick={onTimerClick}
          title="Pomodoro Timer"
        >
          {icons.timer}
        </button>
      </div>
    </nav>
  );
}
