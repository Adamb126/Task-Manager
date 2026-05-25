import { useState } from 'react';
import type { Task } from '../types';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  tasks: Task[];
}

const PRIORITY_DOT = {
  low:    '#444',
  medium: '#2979ff',
  high:   '#ffb300',
  urgent: '#ff3d3d',
};

export function CalendarView({ tasks }: Props) {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  function tasksForDay(d: Date) {
    const key = format(d, 'yyyy-MM-dd');
    return tasks.filter(t => t.deadline === key);
  }

  const selectedTasks = selected ? tasksForDay(selected) : [];

  return (
    <div className="calendar-view">
      <div className="view-header">
        <span className="view-title">Calendar View</span>
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => setCurrent(subMonths(current, 1))}>
            <ChevronLeft size={20} />
          </button>
          <span className="cal-month">{format(current, 'MMMM yyyy')}</span>
          <button className="icon-btn" onClick={() => setCurrent(addMonths(current, 1))}>
            <ChevronRight size={20} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(new Date())}>Today</button>
        </div>
      </div>

      <div className="cal-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {days.map((d, i) => {
          const dayTasks = tasksForDay(d);
          const isCurrentMonth = isSameMonth(d, current);
          const isSelected = selected && isSameDay(d, selected);
          const todayClass = isToday(d) ? 'today' : '';
          return (
            <div
              key={i}
              className={`cal-cell ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${todayClass}`}
              onClick={() => setSelected(isSameDay(d, selected ?? new Date('')) ? null : d)}
            >
              <span className="cal-date">{format(d, 'd')}</span>
              <div className="cal-dots">
                {dayTasks.slice(0, 3).map(t => (
                  <span
                    key={t.id}
                    className="cal-dot"
                    style={{ background: PRIORITY_DOT[t.priority] }}
                    title={t.name}
                  />
                ))}
                {dayTasks.length > 3 && (
                  <span className="cal-more">+{dayTasks.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="cal-detail">
          <h3>{format(selected, 'EEEE, MMMM d, yyyy')}</h3>
          {selectedTasks.length === 0 ? (
            <p className="cal-detail-empty">No tasks due on this day.</p>
          ) : (
            <div className="cal-task-list">
              {selectedTasks.map(t => (
                <div key={t.id} className={`cal-task-item ${t.completed ? 'completed' : ''}`}>
                  <span className="cal-priority-dot" style={{ background: PRIORITY_DOT[t.priority] }} />
                  <div>
                    <span className="cal-task-name">{t.name}</span>
                    <span className={`priority-badge priority-${t.priority}`} style={{ marginLeft: 8, fontSize: '0.7rem' }}>
                      {t.priority}
                    </span>
                    {t.completed && <span className="completed-badge" style={{ marginLeft: 8 }}>Done</span>}
                    {t.notes && <p className="cal-task-notes">{t.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
