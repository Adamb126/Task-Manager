import { useState } from 'react';
import type { View } from './types';
import { useTasks } from './useTasks';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { ArchiveView } from './components/ArchiveView';
import { Zap, ClipboardList, Calendar, Archive } from 'lucide-react';
import { isToday, isPast, parseISO } from 'date-fns';
import './App.css';

export default function App() {
  const [view, setView] = useState<View>('tasks');
  const { active, archived, tasks, addTask, updateTask, completeTask, deleteTask, restoreTask } = useTasks();

  const overdue  = active.filter(t => isPast(parseISO(t.deadline)) && !isToday(parseISO(t.deadline))).length;
  const dueToday = active.filter(t => isToday(parseISO(t.deadline))).length;
  const urgent   = active.filter(t => t.priority === 'urgent').length;

  const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'tasks',    label: 'Tasks',    icon: <ClipboardList size={15} />, badge: active.length },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={15} /> },
    { id: 'archive',  label: 'Archive',  icon: <Archive size={15} />, badge: archived.length },
  ];

  return (
    <div className="app">
      <header className="top-bar">
        <div className="top-bar-brand">
          <Zap size={18} />
          Task Manager
        </div>
        <div className="top-bar-subtitle">
          <span>Priority Tracking</span>
          <span>Deadline Management</span>
          <span>Archive System</span>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <nav>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`nav-item ${view === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <div className="stat-strip">
            <div className="stat-card">
              <div className="stat-label">Active Tasks</div>
              <div className="stat-value">{active.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Overdue</div>
              <div className={`stat-value ${overdue > 0 ? 'red' : 'white'}`}>{overdue}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Due Today</div>
              <div className={`stat-value ${dueToday > 0 ? 'yellow' : 'white'}`}>{dueToday}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Urgent</div>
              <div className={`stat-value ${urgent > 0 ? 'red' : 'white'}`}>{urgent}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value green">{archived.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value white">{tasks.length}</div>
            </div>
          </div>

          <div className="view-content">
            {view === 'tasks' && (
              <TaskList
                tasks={active}
                onAdd={addTask}
                onComplete={completeTask}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            )}
            {view === 'calendar' && <CalendarView tasks={tasks} />}
            {view === 'archive' && (
              <ArchiveView
                tasks={archived}
                onRestore={restoreTask}
                onDelete={deleteTask}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
