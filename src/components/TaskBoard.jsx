import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import TaskItem from './TaskItem';
import CalendarView from './CalendarView';
import { playAddSound } from '../utils/sound';

const getTodayDateString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function TaskBoard({
  tasks, activeTab, onCompleteTask, onAddTask, onDeleteTask, onDragEnd
}) {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayDateString());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [tabKey, setTabKey] = useState(0); // forces re-render for stagger
  const inputRef = useRef(null);

  const filteredTasks = activeTab === 'calendar' 
    ? tasks.filter(t => t.date === selectedCalendarDate)
    : tasks.filter(t => t.category === activeTab);

  // Progress Bar calculation for daily tasks
  const dailyTasks = tasks.filter(t => t.category === 'daily');
  const completedDaily = dailyTasks.filter(t => t.completed).length;
  const progressPercent = dailyTasks.length > 0 ? (completedDaily / dailyTasks.length) * 100 : 0;
  const allDailyDone = dailyTasks.length > 0 && completedDaily === dailyTasks.length;

  // Configure sensors for touch and mouse independently to prevent conflicts
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms press-and-hold to initiate drag
        tolerance: 5,
      },
    })
  );

  const lastOverId = useRef(null);

  // Focus input when FAB is opened
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleDragStart = async (event) => {
    // Vibrate when lifting the task
    lastOverId.current = event.active.id;
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
  };

  const handleDragOver = async (event) => {
    const { over } = event;
    if (over && over.id !== lastOverId.current) {
      lastOverId.current = over.id;
      // Vibrate precisely when passing another task
      await Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
    }
  };

  const handleDragEndInternal = async (event) => {
    lastOverId.current = null;
    onDragEnd(event);
    await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { });
  };

  const handleFabToggle = async () => {
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
    setIsAdding(!isAdding);
    if (isAdding) setNewTaskTitle('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      await Haptics.notification({ type: NotificationType.Success }).catch(() => { });
      playAddSound();
      const category = activeTab === 'calendar' ? 'daily' : activeTab;
      const date = activeTab === 'calendar' ? selectedCalendarDate : getTodayDateString();
      onAddTask(newTaskTitle, category, date);
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const getEmptyStateMessage = () => {
    if (filteredTasks.length === 0) return { emoji: '🌱', text: `Time to set some ${activeTab} goals!` };
    const allDone = filteredTasks.every(t => t.completed);
    if (allDone) {
      if (activeTab === 'daily') return { emoji: '🎉', text: "All done for today! Time to relax." };
      if (activeTab === 'calendar') return { emoji: '🎉', text: "All done for this date!" };
    }
    return null;
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="task-board">
      {activeTab === 'daily' && dailyTasks.length > 0 && (
        <div className={`progress-container ${allDailyDone ? 'progress-complete' : ''}`}>
          <div className="progress-header">
            <span>Daily Progress</span>
            <span>{completedDaily} / {dailyTasks.length}</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      )}

      <>
        {activeTab === 'calendar' && (
          <CalendarView 
            tasks={tasks}
            selectedDate={selectedCalendarDate}
            onSelectDate={setSelectedCalendarDate}
          />
        )}

        <div className="board-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: activeTab === 'calendar' ? '2rem' : '0' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '700' }}>
            {activeTab === 'daily' ? "Today's Focus" : `Tasks for ${selectedCalendarDate}`}
          </h3>
        </div>

        <div className="task-list" key={tabKey}>
            {emptyState && (
              <div className="empty-state">
                <span className="empty-emoji">{emptyState.emoji}</span>
                <p>{emptyState.text}</p>
              </div>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEndInternal}
            >
              <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {filteredTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={(id, pos) => onCompleteTask(id, pos)}
                    onDelete={onDeleteTask}
                    animDelay={index}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

        {/* FAB Backdrop */}
        {isAdding && (
          <div className="fab-backdrop" onClick={handleFabToggle} />
        )}

        <div className="fab-container">
          {isAdding && (
            <form className="fab-form" onSubmit={handleAdd}>
              <input
                ref={inputRef}
                type="text"
                className="fab-input"
                placeholder={`Add ${activeTab} goal...`}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <button type="submit" className="fab-submit">Add</button>
            </form>
          )}
          <button
            className={`fab-button ${isAdding ? 'rotate' : ''}`}
            onClick={handleFabToggle}
            type="button"
            aria-label={isAdding ? "Close" : "Add task"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </>
    </div>
  );
}
