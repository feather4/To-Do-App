import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { playDeleteSound } from '../utils/sound';

export default function TaskItem({ task, onComplete, onDelete, animDelay = 0 }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const itemRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative',
    animationDelay: `${animDelay * 60}ms`,
  };

  const handleComplete = async () => {
    // Trigger ripple
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 500);

    if (!task.completed) {
      await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      onComplete(task.id);
    } else {
      await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      onComplete(task.id);
    }
  };

  const handleDelete = async () => {
    await Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
    playDeleteSound();
    setIsDeleting(true);
    // Wait for slide-out animation before actually removing
    setTimeout(() => {
      onDelete(task.id);
    }, 300);
  };

  return (
    <div 
      ref={(node) => { setNodeRef(node); itemRef.current = node; }} 
      style={style} 
      className={`task-item ${task.completed ? 'completed' : ''} ${isDeleting ? 'deleting' : ''} stagger-item`}
    >
      {/* Drag Handle - only this area triggers drag */}
      <div 
        ref={setActivatorNodeRef}
        className="drag-handle"
        {...attributes} 
        {...listeners}
      >
        ⠿
      </div>

      {/* Checkbox - independent of drag */}
      <div 
        className={`checkbox-container ${rippleActive ? 'ripple' : ''}`}
        onClick={handleComplete}
        role="button"
        tabIndex={0}
      >
        <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <div className="task-content">
        <span className="task-title">{task.title}</span>
      </div>
      


      {/* Delete Button - independent of drag */}
      <button 
        className="delete-btn"
        onClick={handleDelete}
        title="Delete task"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  );
}
