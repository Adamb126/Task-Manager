import { useState, useRef, useEffect } from 'react';
import type { Task } from '../types';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addWeeks, subWeeks, addMonths, subMonths,
  isSameMonth, isSameDay, isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Timer, Clock } from 'lucide-react';

interface Props { tasks: Task[] }
type CalView = 'month' | 'week' | 'day';

// ── Time grid constants ────────────────────────────────
const HOUR_HEIGHT = 64;   // px per hour
const GRID_START  = 6;    // 6 AM
const GRID_END    = 23;   // 11 PM
const HOURS = Array.from({ length: GRID_END - GRID_START }, (_, i) => GRID_START + i);
const TOTAL_HEIGHT = HOURS.length * HOUR_HEIGHT;

// ── Priority colours ───────────────────────────────────
const DOT: Record<string, string> = {
  low: '#333', medium: '#2979ff', high: '#ffb300', urgent: '#ff3d3d',
};
const BLOCK_BG: Record<string, string> = {
  low:    'rgba(68,68,68,0.25)',
  medium: 'rgba(41,121,255,0.18)',
  high:   'rgba(255,179,0,0.15)',
  urgent: 'rgba(255,61,61,0.15)',
};
const BLOCK_BORDER: Record<string, string> = {
  low: '#444', medium: '#2979ff', high: '#ffb300', urgent: '#ff3d3d',
};

// ── Helpers ────────────────────────────────────────────
function fmtHour(h: number) {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}
function fmtHours(h: number) {
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}
function parseTimeFrac(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}
function getTop(startTime: string): number {
  return (parseTimeFrac(startTime) - GRID_START) * HOUR_HEIGHT;
}
function getHeight(estimatedHours?: number): number {
  return Math.max((estimatedHours ?? 0.5) * HOUR_HEIGHT, 28);
}

const WORKDAY = 8;
function HoursBar({ hours }: { hours: number }) {
  const pct = Math.min(hours / WORKDAY * 100, 100);
  const lvl = hours > WORKDAY ? 'overloaded' : hours >= 6 ? 'busy' : 'clear';
  return (
    <div className="hours-bar-wrap">
      <div className="hours-bar">
        <div className="hours-bar-fill" data-level={lvl} style={{ width: `${pct}%` }} />
      </div>
      <span className={`hours-bar-label ${lvl}`}>{fmtHours(hours)}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────
export function CalendarView({ tasks }: Props) {
  const [calView, setCalView] = useState<CalView>('month');
  const [current, setCurrent] = useState(new Date());

  function tasksForDay(d: Date) {
    const key = format(d, 'yyyy-MM-dd');
    return tasks.filter(t => t.deadline === key);
  }
  function totalHours(ts: Task[]) {
    return ts.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);
  }

  function prev() {
    if (calView === 'month') setCurrent(c => subMonths(c, 1));
    else if (calView === 'week') setCurrent(c => subWeeks(c, 1));
    else setCurrent(c => addDays(c, -1));
  }
  function next() {
    if (calView === 'month') setCurrent(c => addMonths(c, 1));
    else if (calView === 'week') setCurrent(c => addWeeks(c, 1));
    else setCurrent(c => addDays(c, 1));
  }
  function navLabel() {
    if (calView === 'month') return format(current, 'MMMM yyyy');
    if (calView === 'week') {
      const ws = startOfWeek(current), we = endOfWeek(current);
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
    }
    return format(current, 'EEEE, MMMM d, yyyy');
  }

  // ── Month view ───────────────────────────────────────
  function MonthView() {
    const [selected, setSelected] = useState<Date | null>(null);
    const monthStart = startOfMonth(current);
    const calStart   = startOfWeek(monthStart);
    const calEnd     = endOfWeek(endOfMonth(current));
    const days: Date[] = [];
    let d = calStart;
    while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

    const selTasks = selected ? tasksForDay(selected) : [];

    return (
      <>
        <div className="cal-grid">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h => (
            <div key={h} className="cal-day-header">{h}</div>
          ))}
          {days.map((day, i) => {
            const dt = tasksForDay(day);
            const hrs = totalHours(dt);
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
                  {dt.slice(0, 3).map(t => (
                    <span key={t.id} className="cal-dot" style={{ background: DOT[t.priority] }} title={t.name} />
                  ))}
                  {dt.length > 3 && <span className="cal-more">+{dt.length - 3}</span>}
                </div>
                {hrs > 0 && inMonth && <span className="cal-cell-hours">{fmtHours(hrs)}</span>}
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="cal-detail">
            <div className="cal-detail-header">
              <h3>{format(selected, 'EEEE, MMMM d, yyyy')}</h3>
              {totalHours(selTasks) > 0 && (
                <span className="cal-detail-hours">
                  <Timer size={13} /> {fmtHours(totalHours(selTasks))} estimated
                </span>
              )}
            </div>
            {selTasks.length === 0
              ? <p className="cal-detail-empty">No tasks due on this day.</p>
              : <DayTaskList tasks={selTasks} />}
          </div>
        )}
      </>
    );
  }

  // ── Shared task list for month day-detail ────────────
  function DayTaskList({ tasks: dt }: { tasks: Task[] }) {
    return (
      <div className="cal-task-list">
        {dt.map(t => (
          <div key={t.id} className={`cal-task-item ${t.completed ? 'completed' : ''}`}>
            <span className="cal-priority-dot" style={{ background: DOT[t.priority] }} />
            <div className="cal-task-body">
              <div className="cal-task-top">
                <span className="cal-task-name">{t.name}</span>
                <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                {t.startTime && (
                  <span className="cal-task-time"><Clock size={10} />{t.startTime}</span>
                )}
                {t.estimatedHours !== undefined && (
                  <span className="cal-task-hours"><Timer size={11} />{fmtHours(t.estimatedHours)}</span>
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

  // ── Shared time grid (Day + Week) ────────────────────
  function TimeGrid({ days }: { days: Date[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const now = new Date();
    const nowFrac = now.getHours() + now.getMinutes() / 60;
    const nowTop  = (nowFrac - GRID_START) * HOUR_HEIGHT;

    useEffect(() => {
      if (!scrollRef.current) return;
      const targetH = isToday(days[0]) ? Math.max(nowFrac - 1.5, GRID_START) : 7.5;
      scrollRef.current.scrollTop = (targetH - GRID_START) * HOUR_HEIGHT;
    }, []);

    const isDay = days.length === 1;

    return (
      <div className="time-view">
        {/* ── Sticky header with day names ── */}
        <div className="time-header">
          <div className="time-gutter" />
          {days.map((day, i) => {
            const dt = tasksForDay(day);
            const hrs = totalHours(dt);
            return (
              <div key={i} className={`time-day-header-cell ${isToday(day) ? 'today' : ''}`}>
                <span className="time-day-dow">{format(day, isDay ? 'EEEE' : 'EEE')}</span>
                <span className={`time-day-num ${isToday(day) ? 'today-num' : ''}`}>
                  {format(day, isDay ? 'MMMM d, yyyy' : 'd')}
                </span>
                {hrs > 0 && (
                  <div className="time-day-hours-bar">
                    <HoursBar hours={hrs} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── All-day / unscheduled row ── */}
        {days.some(d => tasksForDay(d).some(t => !t.startTime)) && (
          <div className="allday-row">
            <div className="time-gutter allday-label">All Day</div>
            {days.map((day, i) => {
              const unscheduled = tasksForDay(day).filter(t => !t.startTime);
              return (
                <div key={i} className="allday-cell">
                  {unscheduled.map(t => (
                    <div
                      key={t.id}
                      className={`allday-chip ${t.completed ? 'completed' : ''}`}
                      style={{ borderLeftColor: BLOCK_BORDER[t.priority], background: BLOCK_BG[t.priority] }}
                      title={t.estimatedHours ? `${t.name} · ${fmtHours(t.estimatedHours)}` : t.name}
                    >
                      <span className="allday-chip-name">{t.name}</span>
                      {t.estimatedHours !== undefined && (
                        <span className="allday-chip-hours">{fmtHours(t.estimatedHours)}</span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Scrollable time grid ── */}
        <div className="time-scroll" ref={scrollRef}>
          <div className="time-body" style={{ height: TOTAL_HEIGHT }}>
            {/* Hour labels */}
            <div className="time-gutter">
              {HOURS.map(h => (
                <div key={h} className="time-label" style={{ height: HOUR_HEIGHT }}>
                  <span>{fmtHour(h)}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, di) => {
              const scheduled = tasksForDay(day).filter(t => t.startTime);
              const showNow   = isToday(day) && nowTop >= 0 && nowTop <= TOTAL_HEIGHT;
              return (
                <div key={di} className={`time-day-col ${isToday(day) ? 'today' : ''}`}>
                  {/* Hour lines */}
                  {HOURS.map((_, hi) => (
                    <div key={hi} className="hour-line"  style={{ top: hi * HOUR_HEIGHT }} />
                  ))}
                  {/* Half-hour lines */}
                  {HOURS.map((_, hi) => (
                    <div key={`hh${hi}`} className="half-hour-line" style={{ top: hi * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
                  ))}

                  {/* Current time indicator */}
                  {showNow && (
                    <div className="now-line" style={{ top: nowTop }}>
                      <div className="now-dot" />
                    </div>
                  )}

                  {/* Task blocks */}
                  {scheduled.map(t => {
                    const top    = getTop(t.startTime!);
                    const height = getHeight(t.estimatedHours);
                    if (top < 0 || top > TOTAL_HEIGHT) return null;
                    return (
                      <div
                        key={t.id}
                        className={`task-block ${t.completed ? 'completed' : ''}`}
                        style={{
                          top,
                          height,
                          background: BLOCK_BG[t.priority],
                          borderLeftColor: BLOCK_BORDER[t.priority],
                        }}
                        title={`${t.name}${t.estimatedHours ? ` · ${fmtHours(t.estimatedHours)}` : ''}`}
                      >
                        <span className="task-block-name">{t.name}</span>
                        <span className="task-block-meta">
                          {t.startTime}
                          {t.estimatedHours !== undefined && ` · ${fmtHours(t.estimatedHours)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function WeekView() {
    const ws = startOfWeek(current);
    const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    return <TimeGrid days={days} />;
  }

  function DayViewFull() {
    return <TimeGrid days={[current]} />;
  }

  // ── Toolbar ──────────────────────────────────────────
  return (
    <div className="calendar-view">
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
