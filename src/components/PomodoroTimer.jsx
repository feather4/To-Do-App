import { useState, useEffect, useRef } from 'react';
import { Haptics, NotificationType, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { playTimerRingSound, playDingSound } from '../utils/sound';

export default function PomodoroTimer({ isOpen, onClose, onOpen, history, onSaveSession }) {
  const [view, setView] = useState('setup'); // 'setup', 'running', 'history'
  
  // Setup State
  const [sessionName, setSessionName] = useState('');
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [totalLoops, setTotalLoops] = useState(4);

  // Running State
  const [timeLeft, setTimeLeft] = useState(0);
  const [targetEndTime, setTargetEndTime] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('work'); // 'work' or 'break'
  const [currentLoop, setCurrentLoop] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await LocalNotifications.requestPermissions();
      } catch (e) {
        console.warn('LocalNotifications permissions request failed', e);
      }
    };
    requestPermissions();
  }, []);

  const scheduleNotification = async (durationMinutes, phase, sName) => {
    const fireTime = new Date(Date.now() + durationMinutes * 60 * 1000);
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: phase === 'work' ? 'Focus Session Complete!' : 'Break Time Over!',
            body: phase === 'work' ? `Great job on ${sName}! Time for a break.` : 'Time to get back to focus!',
            id: 1, 
            schedule: { at: fireTime },
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (e) {
      console.warn('Failed to schedule notification', e);
    }
  };

  const cancelNotification = async () => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    } catch (e) {
      console.warn('Failed to cancel notification', e);
    }
  };

  // Start Session
  const handleStart = async () => {
    if (!sessionName.trim()) {
      await Haptics.notification({ type: NotificationType.Error }).catch(() => {});
      return;
    }
    
    await Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
    setTimeLeft(workDuration * 60);
    setTargetEndTime(Date.now() + workDuration * 60 * 1000);
    scheduleNotification(workDuration, 'work', sessionName);
    
    setCurrentPhase('work');
    setCurrentLoop(1);
    setIsActive(true);
    setIsPaused(false);
    setView('running');
  };

  // Timer Logic
  useEffect(() => {
    if (isActive && !isPaused && targetEndTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        if (now >= targetEndTime) {
          setTimeLeft(0);
          handlePhaseComplete();
        } else {
          setTimeLeft(Math.ceil((targetEndTime - now) / 1000));
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused, targetEndTime]);

  const handlePhaseComplete = async () => {
    playTimerRingSound();
    await Haptics.notification({ type: NotificationType.Success }).catch(() => {});

    if (currentPhase === 'work') {
      if (currentLoop >= totalLoops) {
        // Session Complete!
        finishSession(true);
      } else {
        setCurrentPhase('break');
        setTimeLeft(breakDuration * 60);
        setTargetEndTime(Date.now() + breakDuration * 60 * 1000);
        scheduleNotification(breakDuration, 'break', sessionName);
      }
    } else {
      // Break done, back to work
      setCurrentPhase('work');
      setCurrentLoop((prev) => prev + 1);
      setTimeLeft(workDuration * 60);
      setTargetEndTime(Date.now() + workDuration * 60 * 1000);
      scheduleNotification(workDuration, 'work', sessionName);
    }
  };

  const finishSession = (completed) => {
    cancelNotification();
    setIsActive(false);
    setTargetEndTime(null);
    clearInterval(timerRef.current);
    
    // Save to history
    const sessionData = {
      id: Date.now().toString(),
      name: sessionName,
      date: new Date().toLocaleDateString(),
      workDuration,
      breakDuration,
      loopsCompleted: completed ? totalLoops : (currentPhase === 'work' ? currentLoop - 1 : currentLoop),
      totalLoops,
      status: completed ? 'Completed' : 'Cancelled'
    };
    
    if (sessionData.loopsCompleted > 0 || completed) {
      onSaveSession(sessionData);
    }

    setView('setup');
    setSessionName('');
  };

  const handleCancel = async () => {
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    finishSession(false);
  };

  const togglePause = async () => {
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    if (isPaused) {
      // Resuming
      const newTarget = Date.now() + timeLeft * 1000;
      setTargetEndTime(newTarget);
      scheduleNotification(timeLeft / 60, currentPhase, sessionName);
    } else {
      // Pausing
      cancelNotification();
      setTargetEndTime(null);
    }
    setIsPaused(!isPaused);
  };

  // Format time display
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = currentPhase === 'work' 
    ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  if (!isOpen) {
    if (isActive) {
      return (
        <div className="pomo-minimized-wrapper">
          <div className="pomo-minimized-container">
            <div className="pomo-minimized" onClick={onOpen} title="Open Timer">
              <div className={`pomo-min-phase ${currentPhase}`}>
                {currentPhase === 'work' ? '🧠 Focus' : '☕ Break'}
              </div>
              <div className="pomo-min-time">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="pomodoro-modal">
      <div className="pomodoro-content">
        <div className="pomodoro-modal-header">
          <div className="pomodoro-tabs">
          <button 
            className={`pomo-tab ${view === 'setup' ? 'active' : ''}`}
            onClick={() => { if (!isActive) setView('setup'); }}
            disabled={isActive}
          >
            Timer
          </button>
          <button 
            className={`pomo-tab ${view === 'history' ? 'active' : ''}`}
            onClick={() => { if (!isActive) setView('history'); }}
            disabled={isActive}
          >
            History
          </button>
        </div>
        <button className="pomodoro-close" onClick={onClose} title="Minimize">➖</button>
      </div>

        {view === 'setup' && (
          <div className="pomo-setup">
            <h2>Focus Session</h2>
            
            <div className="pomo-input-group">
              <label>Session Name</label>
              <input 
                type="text" 
                placeholder="e.g. Study Math" 
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </div>
            
            <div className="pomo-row">
              <div className="pomo-input-group pomo-half">
                <label>Work (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={workDuration}
                  onChange={(e) => setWorkDuration(Number(e.target.value))}
                />
              </div>
              <div className="pomo-input-group pomo-half">
                <label>Break (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="pomo-input-group">
              <label>Number of Loops</label>
              <div className="loops-control">
                <button onClick={() => setTotalLoops(Math.max(1, totalLoops - 1))}>-</button>
                <span>{totalLoops}</span>
                <button onClick={() => setTotalLoops(totalLoops + 1)}>+</button>
              </div>
            </div>

            <button 
              className="pomo-start-btn" 
              onClick={handleStart}
              disabled={!sessionName.trim()}
            >
              Start Focus
            </button>
          </div>
        )}

        {view === 'running' && (
          <div className="pomo-running">
            <h2 className="pomo-running-title">{sessionName}</h2>
            <div className="pomo-status">
              {currentPhase === 'work' ? '🧠 Focus Time' : '☕ Break Time'} 
              <span className="pomo-loop-count">(Loop {currentLoop}/{totalLoops})</span>
            </div>
            
            <div className="pomo-timer-circle">
              <svg className="pomo-progress-ring" viewBox="0 0 100 100">
                <circle className="pomo-ring-bg" cx="50" cy="50" r="45"></circle>
                <circle 
                  className={`pomo-ring-fill ${currentPhase}`} 
                  cx="50" cy="50" r="45"
                  style={{ strokeDashoffset: 283 - (283 * progressPercent) / 100 }}
                ></circle>
              </svg>
              <div className="pomo-time-display">
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="pomo-controls">
              <button className="pomo-pause-btn" onClick={togglePause}>
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button className="pomo-cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="pomo-history">
            <h2>Session History</h2>
            {history.length === 0 ? (
              <p className="pomo-empty">No focus sessions completed yet.</p>
            ) : (
              <div className="pomo-history-list">
                {history.map((session) => (
                  <div key={session.id} className="pomo-history-item">
                    <div className="pomo-hist-header">
                      <strong>{session.name}</strong>
                      <span className="pomo-hist-date">{session.date}</span>
                    </div>
                    <div className="pomo-hist-stats">
                      <span>Loops: {session.loopsCompleted}/{session.totalLoops}</span>
                      <span>Work: {session.workDuration}m | Break: {session.breakDuration}m</span>
                    </div>
                    <span className={`pomo-hist-status ${session.status.toLowerCase()}`}>
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
