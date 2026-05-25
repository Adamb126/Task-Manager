import { useState } from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { CompleteModal } from './CompleteModal';
import { Plus, Search } from 'lucide-react';

interface Props {
  tasks: Task[];
  onAdd: (data: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onComplete: (id: string, actualHours?: number) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const SORT_OPTIONS = [
  { value: 'deadline',  label: 'Deadline' },
  { value: 'priority',  label: 'Priority' },
  { value: 'created',   label: 'Created' },
  { value: 'name',      label: 'Name' },
  { value: 'hours',     label: 'Est. Hours' },
];

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

export function TaskList({ tasks, onAdd, onComplete, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm]       = useState(false);
  const [editTask, setEditTask]       = useState<Task | null>(null);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [search, setSearch]           = useState('');
  const [sort, setSort]               = useState('deadline');
  const [filterPriority, setFilterPriority] = useState('all');

  const filtered = tasks
    .filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.notes.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchSearch && matchPriority;
    })
    .sort((a, b) => {
      if (sort === 'deadline')  return a.deadline.localeCompare(b.deadline);
      if (sort === 'priority')  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === 'created')   return b.createdAt.localeCompare(a.createdAt);
      if (sort === 'hours')     return (b.estimatedHours ?? 0) - (a.estimatedHours ?? 0);
      return a.name.localeCompare(b.name);
    });

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours ?? 0), 0);

  return (
    <div className="task-list-view">
      <div className="view-header">
        <div>
          <span className="view-title">Active Tasks — {tasks.length} items</span>
          {totalEstimatedHours > 0 && (
            <span className="hours-summary">{totalEstimatedHours.toFixed(1)}h estimated total</span>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={13} /> New Task
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
              onComplete={() => setCompletingTask(task)}
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
      {completingTask && (
        <CompleteModal
          task={completingTask}
          onConfirm={hours => {
            onComplete(completingTask.id, hours);
            setCompletingTask(null);
          }}
          onClose={() => setCompletingTask(null)}
        />
      )}
    </div>
  );
}
