import React from 'react';

export default function VoiceRecorderModal({ isListening, isProcessing, transcript }) {
  if (!isListening && !isProcessing) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000
    }}>
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        padding: '2rem',
        borderRadius: '1rem',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        maxWidth: '80%',
        width: '300px',
        border: '1px solid var(--card-border, #e5e7eb)'
      }}>
        {isListening && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'white',
              animation: 'pulse 1.5s infinite'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </div>
            <h3 style={{ color: 'var(--text-main)' }}>Listening...</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', minHeight: '1.5rem' }}>
              {transcript || "Speak your task..."}
            </p>
          </>
        )}
        
        {isProcessing && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'white',
              animation: 'spin 2s linear infinite'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
            </div>
            <h3 style={{ color: 'var(--text-main)' }}>Processing...</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Extracting task with AI
            </p>
          </>
        )}
      </div>
    </div>
  );
}
