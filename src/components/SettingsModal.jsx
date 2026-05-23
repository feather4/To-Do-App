import React, { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const themes = [
  { id: 'default', name: 'Light', color1: '#6366f1', color2: '#ec4899' },
  { id: 'theme-midnight', name: 'Midnight', color1: '#1e293b', color2: '#818cf8' },
  { id: 'theme-sakura', name: 'Sakura', color1: '#fdf2f8', color2: '#f472b6' },
  { id: 'theme-forest', name: 'Forest', color1: '#ecfdf5', color2: '#10b981' },
  { id: 'theme-cyberpunk', name: 'Cyberpunk', color1: '#18181b', color2: '#facc15' },
];

export default function SettingsModal({ currentTheme, onThemeChange, dayStartHour, onDayStartChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = async () => {
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    setIsOpen(!isOpen);
  };

  const handleThemeSelect = async (themeId) => {
    await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    onThemeChange(themeId);
  };

  const handleDayStartChange = async (e) => {
    const newValue = Number(e.target.value);
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    onDayStartChange(newValue);
  };

  return (
    <div className="settings-container" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
      <button 
        className="settings-toggle-btn" 
        onClick={toggleOpen}
        title="Settings"
        style={{
          background: 'rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-main)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="settings-backdrop" 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          <div 
            className="settings-modal"
            style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-hover)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              minWidth: '260px'
            }}
          >
            <div>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.125rem' }}>UI Theme</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: currentTheme === theme.id ? 'var(--primary-gradient)' : 'transparent',
                      cursor: 'pointer',
                      color: currentTheme === theme.id ? 'white' : 'var(--text-main)',
                      fontWeight: '600',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.color1}, ${theme.color2})`,
                      border: currentTheme === theme.id ? '2px solid white' : '2px solid rgba(0,0,0,0.1)'
                    }} />
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.125rem' }}>Day Start Time</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                For night owls: Choose when your new day resets.
              </p>
              <select 
                value={dayStartHour} 
                onChange={handleDayStartChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--card-border)',
                  background: 'rgba(255,255,255,0.5)',
                  color: 'var(--text-main)',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={0}>Midnight (12:00 AM)</option>
                <option value={1}>1:00 AM</option>
                <option value={2}>2:00 AM</option>
                <option value={3}>3:00 AM</option>
                <option value={4}>4:00 AM</option>
                <option value={5}>5:00 AM</option>
                <option value={6}>6:00 AM</option>
              </select>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
