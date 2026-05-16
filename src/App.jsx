import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import PomodoroTimer from './components/PomodoroTimer';
import { playDingSound } from './utils/sound';
import confetti from 'canvas-confetti';
import { arrayMove } from '@dnd-kit/sortable';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const FlyingToken = ({ token, onArrive }) => {
  const [style, setStyle] = useState({
    position: 'fixed',
    left: token.startPos.x,
    top: token.startPos.y,
    transform: 'translate(-50%, -50%) scale(1.5)',
    transition: 'none',
    zIndex: 9999,
    opacity: 1,
    pointerEvents: 'none'
  });

  useEffect(() => {
    const targetEl = document.getElementById('total-tokens-counter');
    if (!targetEl) {
      onArrive(token.reward, token.id);
      return;
    }
    
    const targetRect = targetEl.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    const timer1 = setTimeout(() => {
      setStyle(prev => ({
        ...prev,
        transform: 'translate(-50%, -100%) scale(2)',
        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }));
    }, 10);

    const timer2 = setTimeout(() => {
      setStyle(prev => ({
        ...prev,
        left: targetX,
        top: targetY,
        transform: 'translate(-50%, -50%) scale(0.5)',
        transition: 'all 0.6s cubic-bezier(0.5, 0, 0.2, 1)',
        opacity: 0.2
      }));
    }, 350);

    const timer3 = setTimeout(() => {
      onArrive(token.reward, token.id);
    }, 950);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [token, onArrive]);

  return (
    <div className={`task-reward reward-${token.category}`} style={style}>
      +{token.reward}
    </div>
  );
};

const INITIAL_TASKS = [
  { id: '1', title: 'Drink 2L of water', category: 'daily', reward: 10, completed: false },
  { id: '2', title: 'Read 30 pages', category: 'daily', reward: 10, completed: false },
  { id: '3', title: 'Workout 3x this week', category: 'weekly', reward: 50, completed: false },
  { id: '4', title: 'Finish MVP prototype', category: 'monthly', reward: 100, completed: false },
];

const INITIAL_REWARDS = [
  { id: 'r1', title: 'Watch 1 episode of Netflix', cost: 100 },
  { id: 'r2', title: 'Buy a coffee', cost: 50 }
];

const REWARDS_VALS = { daily: 10, weekly: 50, monthly: 100 };

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('gamified-todo-tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [rewards, setRewards] = useState(() => {
    const saved = localStorage.getItem('gamified-todo-rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [totalTokens, setTotalTokens] = useState(() => {
    const saved = localStorage.getItem('gamified-todo-tokens');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('gamified-todo-streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastActiveDate, setLastActiveDate] = useState(() => {
    return localStorage.getItem('gamified-todo-last-active') || null;
  });

  const [flyingTokens, setFlyingTokens] = useState([]);
  const [isVibrating, setIsVibrating] = useState(false);

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

  const handleTokenArrival = (reward, tokenId) => {
    setTotalTokens(prev => prev + reward);
    setFlyingTokens(prev => prev.filter(t => t.id !== tokenId));
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 400);
  };

  // Persist state
  useEffect(() => {
    localStorage.setItem('gamified-todo-tasks', JSON.stringify(tasks));
    localStorage.setItem('gamified-todo-rewards', JSON.stringify(rewards));
    localStorage.setItem('gamified-todo-tokens', totalTokens.toString());
    localStorage.setItem('gamified-todo-streak', streak.toString());
    if (lastActiveDate) {
      localStorage.setItem('gamified-todo-last-active', lastActiveDate);
    }
    localStorage.setItem('gamified-todo-pomodoro', JSON.stringify(pomodoroHistory));
  }, [tasks, rewards, totalTokens, streak, lastActiveDate, pomodoroHistory]);

  const handleCompleteTask = (taskId, startPos) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const isCompleting = !task.completed;
        
        if (isCompleting) {
          if (startPos) {
            const newFlyingToken = {
              id: Date.now().toString() + Math.random(),
              reward: task.reward,
              category: task.category,
              startPos
            };
            setFlyingTokens(prev => [...prev, newFlyingToken]);
          } else {
            setTotalTokens(prev => prev + task.reward);
          }
          
          
          playDingSound();

          if (task.category === 'daily') {
            const today = new Date().toDateString();
            if (lastActiveDate !== today) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              if (lastActiveDate === yesterday.toDateString()) {
                setStreak(prev => prev + 1);
              } else {
                setStreak(1);
              }
              setLastActiveDate(today);
            }
          } else if (task.category === 'monthly') {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#3b82f6']
            });
          }
        } else {
          setTotalTokens(prev => Math.max(0, prev - task.reward));
        }

        return { ...task, completed: isCompleting };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId) => {
    // If there's a pending undo from a previous delete, discard it
    clearUndoTimers();

    setTasks(prevTasks => {
      const index = prevTasks.findIndex(task => task.id === taskId);
      if (index === -1) return prevTasks;
      const deletedTask = prevTasks[index];
      setDeletedTaskInfo({ task: deletedTask, index });
      setUndoTimeLeft(5);

      // Start countdown display
      undoCountdownRef.current = setInterval(() => {
        setUndoTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(undoCountdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-dismiss after 5 seconds
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
      // Insert back at original position, or at the end if the list is shorter now
      const insertAt = Math.min(deletedTaskInfo.index, newTasks.length);
      newTasks.splice(insertAt, 0, deletedTaskInfo.task);
      return newTasks;
    });
    setDeletedTaskInfo(null);
    setUndoTimeLeft(0);
  };

  const handleAddTask = (title, category) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      category,
      reward: REWARDS_VALS[category],
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleAddReward = (title, cost) => {
    const newReward = {
      id: Date.now().toString(),
      title,
      cost: parseInt(cost, 10)
    };
    setRewards(prev => [...prev, newReward]);
  };

  const handleRedeemReward = (cost) => {
    if (totalTokens >= cost) {
      setTotalTokens(prev => prev - cost);
      return true;
    }
    return false;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((prevTasks) => {
        const activeTask = prevTasks.find(t => t.id === active.id);
        if (!activeTask) return prevTasks;
        
        const category = activeTask.category;
        
        // Isolate sorting to the specific category
        const categoryTasks = prevTasks.filter(t => t.category === category);
        const otherTasks = prevTasks.filter(t => t.category !== category);

        const oldIndex = categoryTasks.findIndex((t) => t.id === active.id);
        const newIndex = categoryTasks.findIndex((t) => t.id === over.id);

        const newCategoryTasks = arrayMove(categoryTasks, oldIndex, newIndex);

        return [...otherTasks, ...newCategoryTasks];
      });
    }
  };

  return (
    <>
      <Header totalTokens={totalTokens} streak={streak} isVibrating={isVibrating} />
      <main>
        {flyingTokens.map(ft => (
          <FlyingToken key={ft.id} token={ft} onArrive={handleTokenArrival} />
        ))}
        <TaskBoard 
          tasks={tasks} 
          rewards={rewards}
          totalTokens={totalTokens}
          onCompleteTask={handleCompleteTask} 
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onAddReward={handleAddReward}
          onRedeemReward={handleRedeemReward}
          onDragEnd={handleDragEnd}
        />
      </main>

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
      {/* Pomodoro Timer Feature */}
      <PomodoroTimer 
        history={pomodoroHistory}
        onSaveSession={(session) => {
          setPomodoroHistory(prev => [session, ...prev]);
        }}
      />
    </>
  );
}

export default App;
