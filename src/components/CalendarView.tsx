import { useState } from 'react';
import type { Task } from '../types';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addWeeks, subWeeks, addMonths, subMonths,
  isSameMonth, isSameDay, isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Timer } from 'lucide-react';

interface Props { tasks: Task[] }

type CalView = 'month' | 'week' | 'day';

const PRIORITY_DOT: Record<string, string> = {
  low: '#333', medium: '#2979ff', high: '#ffb300', urgent: '#ff3d3d',
};

const PRIORITY_COLOR: Record<string, string> = {
  low: '#555', medium: '#2979ff', high: '#ffb300', urgent: '#ff3d3d',
};

const WORKDAY_HOURS = 8;

function fmtHours(h: number) {
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

function HoursBar({ hours }: { hours: number }) {
  const pct = Math.min(hours / WORKDAY_HOURS * 100, 100);
  const cls = hours > WORKDAY_HOURS ? 'overloaded' : hours >= 6 ? 'busy' : 'clear';
  return (
    <div className="hours-bar-wrap">
      <div className="hours-bar">
        <div className="hours-bar-fill" data-level={cls} style={{ width: `${pct}%` }} />
      </div>
      <span className={`hours-bar-label ${cls}`}>{fmtHours(hours)}</span>
    </div>
  );
}

export function CalendarView({ tasks }: Props) {
  const [calView, setCalView] = useState<CalView>('month');
  const [current, setCurrent] = useState(new Date());

  function tasksForDay(d: Date) {
    const key = format(d, 'yyyy-MM-dd');
    return tasks.filter(t => t.deadline === key);
  }

  function totalHours(dayTasks: Task[]) {
    return dayTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);
  }

  // ── Navigation ──────────────────────────────────────────
  function prev() {
    if (calView === 'month') setCurrent(subMonths(current, 1));
    else if (calView === 'week') setCurrent(subWeeks(current, 1));
    else setCurrent(addDays(current, -1));
  }
  function next() {
    if (calView === 'month') setCurrent(addMonths(current, 1));
    else if (calView === 'week') setCurrent(addWeeks(current, 1));
    else setCurrent(addDays(current, 1));
  }
  function navLabel() {
    if (calView === 'month') return format(current, 'MMMM yyyy');
    if (calView === 'week') {
      const ws = startOfWeek(current);
      const we = endOfWeek(current);
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
    }
    return format(current, 'EEEE, MMMM d, yyyy');
  }

  // ── Month view ──────────────────────────────────────────
  function MonthView() {
    const [selected, setSelected] = useState<Date | null>(null);
    const monthStart = startOfMonth(current);
    const calStart   = startOfWeek(monthStart);
    const calEnd     = endOfWeek(endOfMonth(current));

    const days: Date[] = [];
    let d = calStart;
    while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

    const selectedTasks = selected ? tasksForDay(selected) : [];

    return (
      <>
        <div className="cal-grid">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h => (
            <div key={h} className="cal-day-header">{h}</div>
          ))}
          {days.map((day, i) => {
            const dayTasks = tasksForDay(day);
            const hrs = totalHours(dayTasks);
            const inMonth = isSameMonth(day, current);
            const isSel   = selected && isSameDay(day, selected);
            return (
              <div
                key={i}
                className={`cal-cell ${!inMonth ? 'other-month' : ''} ${isSel ? 'selected' : ''} ${isToday(day) ? 'today' : ''}`}
                onClick={() => setSelected(isSel ? null : day)}
              >
                <span className="cal-date">{format(day, 'd')}</span>
                <div className="cal-dots">
                  {dayTasks.slice(0, 3).map(t => (
                    <span key={t.id} className="cal-dot" style={{ background: PRIORITY_DOT[t.priority] }} title={t.name} />
                  ))}
                  {dayTasks.length > 3 && <span className="cal-more">+{dayTasks.length - 3}</span>}
                </div>
                {hrs > 0 && inMonth && (
                  <span className="cal-cell-hours">{fmtHours(hrs)}</span>
                )}
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="cal-detail">
            <div className="cal-detail-header">
              <h3>{format(selected, 'EEEE, MMMM d, yyyy')}</h3>
              {totalHours(selectedTasks) > 0 && (
                <span className="cal-detail-hours">
                  <Timer size={13} /> {fmtHours(totalHours(selectedTasks))} estimated
                </span>
              )}
            </div>
            {selectedTasks.length === 0
              ? <p className="cal-detail-empty">No tasks due on this day.</p>
              : <DayTaskList tasks={selectedTasks} />
            }
          </div>
        )}
      </>
    );
  }

  // ── Week view ──────────────────────────────────────────
  function WeekView() {
    const ws = startOfWeek(current);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(ws, i));

    return (
      <div className="week-grid">
        {weekDays.map((day, i) => {
          const dayTasks = tasksForDay(day);
          const hrs = totalHours(dayTasks);
          const today = isToday(day);
          return (
            <div key={i} className={`week-col ${today ? 'today' : ''}`}>
              <div className="week-col-header">
                <span className="week-col-dow">{format(day, 'EEE')}</span>
                <span className={`week-col-date ${today ? 'today-date' : ''}`}>{format(day, 'd')}</span>
              </div>
              <div className="week-col-tasks">
                {dayTasks.length === 0
                  ? <p className="week-empty">—</p>
                  : dayTasks.map(t => (
                    <div key={t.id} className={`week-task ${t.completed ? 'completed' : ''}`}>
                      <span className="week-task-dot" style={{ background: PRIORITY_COLOR[t.priority] }} />
                      <div className="week-task-info">
                        <span className="week-task-name">{t.name}</span>
                        {t.estimatedHours !== undefined && (
                          <span className="week-task-hours">{fmtHours(t.estimatedHours)}</span>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
              <div className="week-col-footer">
                {hrs > 0 && <HoursBar hours={hrs} />}
                {dayTasks.length > 0 && (
                  <span className="week-task-count">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Day view ──────────────────────────────────────────
  function DayViewFull() {
    const dayTasks = tasksForDay(current);
    const hrs = totalHours(dayTasks);
    return (
      <div className="day-view">
        <div className="day-view-header">
          <div className="day-view-summary">
            <span>{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</span>
            {hrs > 0 && (
              <>
                <span className="day-sep">·</span>
                <span className="day-view-hours">
                  <Timer size={13} />{fmtHours(hrs)} estimated
                </span>
                <HoursBar hours={hrs} />
              </>
            )}
          </div>
        </div>
        {dayTasks.length === 0
          ? <div className="empty-state"><p>No tasks due on this day.</p></div>
          : <DayTaskList tasks={dayTasks} />
        }
      </div>
    );
  }

  // ── Shared day task list ──────────────────────────────
  function DayTaskList({ tasks: dayTasks }: { tasks: Task[] }) {
    return (
      <div className="cal-task-list">
        {dayTasks.map(t => (
          <div key={t.id} className={`cal-task-item ${t.completed ? 'completed' : ''}`}>
            <span className="cal-priority-dot" style={{ background: PRIORITY_COLOR[t.priority] }} />
            <div className="cal-task-body">
              <div className="cal-task-top">
                <span className="cal-task-name">{t.name}</span>
                <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                {t.estimatedHours !== undefined && (
                  <span className="cal-task-hours">
                    <Timer size={11} />{fmtHours(t.estimatedHours)}
                  </span>
                )}
                {t.completed && <span className="completed-badge">Done</span>}
              </div>
              {t.notes && <p className="cal-task-notes">{t.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="calendar-view">
      {/* ── toolbar ── */}
      <div className="view-header">
        <span className="view-title">Calendar</span>
        <div className="cal-toolbar">
          <div className="cal-view-tabs">
            {(['month','week','day'] as CalView[]).map(v => (
              <button
                key={v}
                className={`cal-tab ${calView === v ? 'active' : ''}`}
                onClick={() => setCalView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div className="cal-nav">
            <button className="icon-btn" onClick={prev}><ChevronLeft size={18} /></button>
            <span className="cal-month">{navLabel()}</span>
            <button className="icon-btn" onClick={next}><ChevronRight size={18} /></button>
            <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(new Date())}>Today</button>
          </div>
        </div>
      </div>

      {calView === 'month' && <MonthView />}
      {calView === 'week'  && <WeekView />}
      {calView === 'day'   && <DayViewFull />}
    </div>
  );
}
