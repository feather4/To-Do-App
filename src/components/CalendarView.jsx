import React, { useState, useEffect } from 'react';

const CalendarView = ({ tasks, selectedDate, onSelectDate }) => {
  // Parse a local YYYY-MM-DD string safely (no UTC shift)
  const parseLocalDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const [currentDate, setCurrentDate] = useState(() =>
    selectedDate ? parseLocalDate(selectedDate) : new Date()
  );

  // Keep calendar view in sync with selected date if it changes externally
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(parseLocalDate(selectedDate));
    }
  }, [selectedDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const [slideDirection, setSlideDirection] = useState('');
  const [touchStartX, setTouchStartX] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleDragStart = (clientX) => {
    setTouchStartX(clientX);
    setIsMouseDown(true);
  };

  const handleDragEnd = (clientX) => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    const diff = touchStartX - clientX;

    if (diff > 50) {
      setSlideDirection('slide-left');
      nextMonth();
      setTimeout(() => setSlideDirection(''), 500);
    } else if (diff < -50) {
      setSlideDirection('slide-right');
      prevMonth();
      setTimeout(() => setSlideDirection(''), 500);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  return (
    <div 
      className="calendar-container"
      onTouchStart={(e) => handleDragStart(e.changedTouches[0].screenX)}
      onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].screenX)}
      onMouseDown={(e) => handleDragStart(e.screenX)}
      onMouseUp={(e) => handleDragEnd(e.screenX)}
      onMouseLeave={(e) => isMouseDown && handleDragEnd(e.screenX)}
      style={{ overflow: 'hidden', touchAction: 'pan-y' }}
    >
      <div className="calendar-header" style={{ justifyContent: 'center' }}>
        <h2 className="calendar-title" style={{ fontSize: '1.25rem' }}>{monthNames[month]} {year}</h2>
      </div>
      <div 
        className={`calendar-grid ${slideDirection}`} 
        style={{ 
          animation: slideDirection === 'slide-left' ? 'slideInRightCalendar 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 
                     slideDirection === 'slide-right' ? 'slideInLeftCalendar 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none' 
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="calendar-day empty"></div>;
          
          const y = year;
          const m = String(month + 1).padStart(2, '0');
          const dayStr = String(day).padStart(2, '0');
          const dateStr = `${y}-${m}-${dayStr}`;
          
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          
          // Determine task status for indicator
          const dayTasks = tasks.filter(t => t.date === dateStr);
          const hasUncompleted = dayTasks.some(t => !t.completed);
          const allCompleted = dayTasks.length > 0 && dayTasks.every(t => t.completed);

          let indicatorClass = '';
          if (hasUncompleted) indicatorClass = 'indicator-uncompleted';
          else if (allCompleted) indicatorClass = 'indicator-completed';

          return (
            <div 
              key={day} 
              className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => onSelectDate(dateStr)}
            >
              <span className="day-number">{day}</span>
              {indicatorClass && <div className={`task-indicator ${indicatorClass}`}></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
