import { useState } from 'react';
import type { View } from './types';
import { useTasks } from './useTasks';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { ArchiveView } from './components/ArchiveView';
import { CheckSquare, Calendar, Archive, ClipboardList } from 'lucide-react';
import './App.css';

export default function App() {
  const [view, setView] = useState<View>('tasks');
  const { active, archived, tasks, addTask, updateTask, completeTask, deleteTask, restoreTask } = useTasks();

  const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'tasks',    label: 'Tasks',    icon: <ClipboardList size={20} />, badge: active.length },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
    { id: 'archive',  label: 'Archive',  icon: <Archive size={20} />, badge: archived.length },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <CheckSquare size={28} />
          <span>TaskFlow</span>
        </div>
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
      </main>
    </div>
  );
}
