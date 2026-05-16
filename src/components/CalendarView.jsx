import React, { useState, useEffect } from 'react';

const CalendarView = ({ tasks, selectedDate, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate || Date.now()));

  // Keep calendar view in sync with selected date if it changes externally
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(new Date(selectedDate));
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
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav-btn">&lt;</button>
        <h2 className="calendar-title">{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="calendar-nav-btn">&gt;</button>
      </div>
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="calendar-day empty"></div>;
          
          const d = new Date(year, month, day);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          const dateStr = d.toISOString().split('T')[0];
          
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
