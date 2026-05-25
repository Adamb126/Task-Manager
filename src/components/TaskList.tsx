import { useState } from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Plus, Search } from 'lucide-react';

interface Props {
  tasks: Task[];
  onAdd: (data: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const SORT_OPTIONS = [
  { value: 'deadline', label: 'Deadline' },
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Created' },
  { value: 'name', label: 'Name' },
];

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

export function TaskList({ tasks, onAdd, onComplete, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('deadline');
  const [filterPriority, setFilterPriority] = useState('all');

  const filtered = tasks
    .filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.notes.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchSearch && matchPriority;
    })
    .sort((a, b) => {
      if (sort === 'deadline') return a.deadline.localeCompare(b.deadline);
      if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === 'created') return b.createdAt.localeCompare(a.createdAt);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="task-list-view">
      <div className="view-header">
        <div>
          <h1>Tasks</h1>
          <span className="task-count">{tasks.length} active</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>Sort: {o.label}</option>
          ))}
        </select>
      </div>

      <div className="task-cards">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{tasks.length === 0 ? 'No tasks yet. Add your first task!' : 'No tasks match your filters.'}</p>
          </div>
        ) : (
          filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => onComplete(task.id)}
              onEdit={() => setEditTask(task)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        )}
      </div>

      {showForm && (
        <TaskForm
          onSave={onAdd}
          onClose={() => setShowForm(false)}
        />
      )}
      {editTask && (
        <TaskForm
          initial={editTask}
          onSave={data => onUpdate(editTask.id, data)}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
}
