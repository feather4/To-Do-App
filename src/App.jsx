import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import PomodoroTimer from './components/PomodoroTimer';
import BottomNav from './components/BottomNav';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SettingsModal from './components/SettingsModal';
import { playDingSound } from './utils/sound';
import confetti from 'canvas-confetti';
import { arrayMove } from '@dnd-kit/sortable';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import { extractTaskFromSpeech } from './utils/aiHelper';
import VoiceRecorderModal from './components/VoiceRecorderModal';

const getTodayDateString = (dayStartHour = 0) => {
  const d = new Date();
  d.setHours(d.getHours() - dayStartHour);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const INITIAL_TASKS = [
  { id: '1', title: 'Drink 2L of water', category: 'daily', completed: false, date: getTodayDateString() },
  { id: '2', title: 'Read 30 pages', category: 'daily', completed: false, date: getTodayDateString() },
];

function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('gamified-todo-username') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(!localStorage.getItem('gamified-todo-username'));
  const [tempName, setTempName] = useState('');

  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('gamified-todo-theme') || 'default');
  const [dayStartHour, setDayStartHour] = useState(() => parseInt(localStorage.getItem('gamified-todo-daystart') || '0', 10));

  const [activeTab, setActiveTab] = useState('daily');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gamified-todo-gemini-key') || '');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    if (error) {
      alert(`Speech recognition error: ${error}`);
    }
  }, [error]);


  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('gamified-todo-tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Filter out removed categories from old data
      return parsed
        .filter(t => t.category === 'daily' || t.category === 'calendar' || t.category === undefined)
        .map(t => t.date ? t : { ...t, date: getTodayDateString(0) });
    }
    return INITIAL_TASKS;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('gamified-todo-streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastActiveDate, setLastActiveDate] = useState(() => {
    return localStorage.getItem('gamified-todo-last-active') || null;
  });

  // Rollover logic
  const [showRolloverPrompt, setShowRolloverPrompt] = useState(false);
  const [tasksToRollover, setTasksToRollover] = useState([]);

  useEffect(() => {
    const logicalToday = getTodayDateString(dayStartHour);
    if (lastActiveDate && logicalToday > lastActiveDate) {
      const pastUncompleted = tasks.filter(t => t.category === 'daily' && !t.completed && t.date <= lastActiveDate);
      if (pastUncompleted.length > 0) {
        setTasksToRollover(pastUncompleted);
        setShowRolloverPrompt(true);
      } else {
        setLastActiveDate(logicalToday);
      }
    } else if (!lastActiveDate) {
      setLastActiveDate(logicalToday);
    }
  }, [dayStartHour, lastActiveDate, tasks]);

  const handleRolloverChoice = (carryForward) => {
    const logicalToday = getTodayDateString(dayStartHour);
    if (carryForward) {
      const taskIds = tasksToRollover.map(t => t.id);
      setTasks(prev => prev.map(t => taskIds.includes(t.id) ? { ...t, date: logicalToday } : t));
    }
    setLastActiveDate(logicalToday);
    setShowRolloverPrompt(false);
    setTasksToRollover([]);
  };

  // Pomodoro state
  const [pomodoroHistory, setPomodoroHistory] = useState(() => {
    const saved = localStorage.getItem('gamified-todo-pomodoro');
    return saved ? JSON.parse(saved) : [];
  });

  // Undo delete state
  const [deletedTaskInfo, setDeletedTaskInfo] = useState(null); // { task, index }
  const [undoTimeLeft, setUndoTimeLeft] = useState(0);
  const undoTimerRef = useRef(null);
  const undoCountdownRef = useRef(null);

  const clearUndoTimers = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (undoCountdownRef.current) clearInterval(undoCountdownRef.current);
  }, []);

  const dismissUndo = useCallback(() => {
    clearUndoTimers();
    setDeletedTaskInfo(null);
    setUndoTimeLeft(0);
  }, [clearUndoTimers]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('gamified-todo-tasks', JSON.stringify(tasks));
    localStorage.setItem('gamified-todo-streak', streak.toString());
    if (lastActiveDate) {
      localStorage.setItem('gamified-todo-last-active', lastActiveDate);
    }
    localStorage.setItem('gamified-todo-pomodoro', JSON.stringify(pomodoroHistory));
    localStorage.setItem('gamified-todo-theme', currentTheme);
    localStorage.setItem('gamified-todo-daystart', dayStartHour.toString());
  }, [tasks, streak, lastActiveDate, pomodoroHistory, currentTheme, dayStartHour]);

  // Apply theme to body
  useEffect(() => {
    document.body.className = currentTheme === 'default' ? '' : currentTheme;
  }, [currentTheme]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('gamified-todo-username', tempName.trim());
      setShowNamePrompt(false);
    }
  };

  const handleCompleteTask = (taskId, startPos) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const isCompleting = !task.completed;
        
        if (isCompleting) {
          playDingSound();

          if (task.category === 'daily') {
            const logicalToday = getTodayDateString(dayStartHour);
            if (lastActiveDate !== logicalToday) {
              const d = new Date();
              d.setHours(d.getHours() - dayStartHour);
              d.setDate(d.getDate() - 1);
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              const yesterdayStr = `${y}-${m}-${day}`;

              if (lastActiveDate === yesterdayStr) {
                setStreak(prev => prev + 1);
              } else {
                setStreak(1);
              }
              setLastActiveDate(logicalToday);
            }
          }
        }

        return { ...task, completed: isCompleting };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId) => {
    clearUndoTimers();
    setTasks(prevTasks => {
      const index = prevTasks.findIndex(task => task.id === taskId);
      if (index === -1) return prevTasks;
      const deletedTask = prevTasks[index];
      setDeletedTaskInfo({ task: deletedTask, index });
      setUndoTimeLeft(5);

      undoCountdownRef.current = setInterval(() => {
        setUndoTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(undoCountdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      undoTimerRef.current = setTimeout(() => {
        setDeletedTaskInfo(null);
        setUndoTimeLeft(0);
      }, 5000);

      return prevTasks.filter(task => task.id !== taskId);
    });
  };

  const handleUndoDelete = async () => {
    if (!deletedTaskInfo) return;
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    clearUndoTimers();
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const insertAt = Math.min(deletedTaskInfo.index, newTasks.length);
      newTasks.splice(insertAt, 0, deletedTaskInfo.task);
      return newTasks;
    });
    setDeletedTaskInfo(null);
    setUndoTimeLeft(0);
  };

  const handleAddTask = (title, category, date) => {
    if (!date) date = getTodayDateString(dayStartHour);
    const newTask = {
      id: Date.now().toString(),
      title,
      category,
      completed: false,
      date
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((prevTasks) => {
        const activeTask = prevTasks.find(t => t.id === active.id);
        if (!activeTask) return prevTasks;
        
        const category = activeTask.category;
        
        const categoryTasks = prevTasks.filter(t => t.category === category);
        const otherTasks = prevTasks.filter(t => t.category !== category);

        const oldIndex = categoryTasks.findIndex((t) => t.id === active.id);
        const newIndex = categoryTasks.findIndex((t) => t.id === over.id);

        const newCategoryTasks = arrayMove(categoryTasks, oldIndex, newIndex);

        return [...otherTasks, ...newCategoryTasks];
      });
    }
  };

  // Persist API key
  useEffect(() => {
    localStorage.setItem('gamified-todo-gemini-key', geminiApiKey);
  }, [geminiApiKey]);

  // Voice Processing Effect
  useEffect(() => {
    if (!isListening && transcript && !isProcessingVoice) {
      const processVoice = async () => {
        setIsProcessingVoice(true);
        try {
          if (!geminiApiKey) {
            alert('Please add your Gemini API Key in Settings to use voice commands.');
            return;
          }
          const extractedTask = await extractTaskFromSpeech(transcript, geminiApiKey);
          if (extractedTask) {
            handleAddTask(extractedTask, 'daily', getTodayDateString(dayStartHour));
            playDingSound();
          }
        } catch (err) {
          alert('Error processing voice task: ' + err.message);
        } finally {
          setIsProcessingVoice(false);
        }
      };
      processVoice();
    }
  }, [isListening, transcript]);

  return (
    <>
      <SettingsModal 
        currentTheme={currentTheme} 
        onThemeChange={setCurrentTheme} 
        dayStartHour={dayStartHour}
        onDayStartChange={setDayStartHour}
        geminiApiKey={geminiApiKey}
        onGeminiApiKeyChange={setGeminiApiKey}
      />

      <VoiceRecorderModal 
        isListening={isListening} 
        isProcessing={isProcessingVoice} 
        transcript={transcript} 
      />

      {showNamePrompt && (
        <div className="name-modal-overlay">
          <div className="name-modal-content">
            <h2>Welcome! 👋</h2>
            <p>What should we call you?</p>
            <form onSubmit={handleSaveName}>
              <input 
                type="text" 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)} 
                placeholder="Enter your name"
                autoFocus
              />
              <button type="submit" disabled={!tempName.trim()}>Let's Go</button>
            </form>
          </div>
        </div>
      )}

      {showRolloverPrompt && (
        <div className="name-modal-overlay" style={{ zIndex: 2000 }}>
          <div className="name-modal-content" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>A New Day! 🌅</h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
              You have {tasksToRollover.length} uncompleted task(s) from yesterday. 
              <br/>Would you like to carry them forward to today?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => handleRolloverChoice(false)}
                style={{ 
                  background: 'rgba(0,0,0,0.1)', color: 'var(--text-main)', 
                  padding: '0.75rem 1.5rem', borderRadius: '999px', border: 'none', 
                  fontWeight: '700', cursor: 'pointer' 
                }}
              >
                No, leave them
              </button>
              <button 
                onClick={() => handleRolloverChoice(true)}
                style={{ 
                  background: 'var(--primary-gradient)', color: 'white', 
                  padding: '0.75rem 1.5rem', borderRadius: '999px', border: 'none', 
                  fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--primary-shadow)' 
                }}
              >
                Yes, carry forward
              </button>
            </div>
          </div>
        </div>
      )}

      <Header 
        userName={userName} 
        streak={streak} 
        isNightOwlGracePeriod={new Date().getDate() !== (() => {
          const d = new Date();
          d.setHours(d.getHours() - dayStartHour);
          return d.getDate();
        })()}
        displayDate={(() => {
          const d = new Date();
          d.setHours(d.getHours() - dayStartHour);
          return `${d.getDate()} ${d.toLocaleDateString('en-US', { weekday: 'short' })}`;
        })()}
      />
      <main>
        {activeTab === 'analytics' ? (
          <AnalyticsDashboard tasks={tasks} pomodoroHistory={pomodoroHistory} />
        ) : (
          <TaskBoard 
            tasks={tasks} 
            activeTab={activeTab}
            onCompleteTask={handleCompleteTask} 
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onDragEnd={handleDragEnd}
            currentDateString={getTodayDateString(dayStartHour)}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
          />
        )}
      </main>

      <BottomNav 
        activeTab={activeTab} 
        isAdding={isAdding}
        onAddClick={() => {
          setIsAdding(!isAdding);
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
        }}
        onTabChange={(tab) => {
          setActiveTab(tab);
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
        }}
        onTimerClick={() => setIsTimerOpen(true)}
      />

      {/* Undo Delete Toast */}
      {deletedTaskInfo && (
        <div className="undo-toast">
          <div className="undo-toast-content">
            <span className="undo-toast-icon">🗑️</span>
            <div className="undo-toast-text">
              <strong>Task deleted</strong>
              <span className="undo-toast-title">{deletedTaskInfo.task.title}</span>
            </div>
          </div>
          <div className="undo-toast-actions">
            <button className="undo-btn" onClick={handleUndoDelete}>
              Undo ({undoTimeLeft}s)
            </button>
            <button className="dismiss-btn" onClick={dismissUndo}>
              ✕
            </button>
          </div>
          <div className="undo-toast-progress">
            <div className="undo-toast-progress-bar" style={{ animationDuration: '5s' }} />
          </div>
        </div>
      )}

      <PomodoroTimer 
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        history={pomodoroHistory}
        onSaveSession={(session) => {
          setPomodoroHistory(prev => [session, ...prev]);
        }}
      />
    </>
  );
}

export default App;
