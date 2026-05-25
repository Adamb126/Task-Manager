import { useState } from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import { Search } from 'lucide-react';

interface Props {
  tasks: Task[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ArchiveView({ tasks, onRestore, onDelete }: Props) {
  const [search, setSearch] = useState('');

  const filtered = tasks
    .filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.notes.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  return (
    <div className="task-list-view">
      <div className="view-header">
        <span className="view-title">Archive — {tasks.length} completed</span>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search archive..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="task-cards">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{tasks.length === 0
              ? 'No completed tasks yet. Complete a task to see it here.'
              : 'No tasks match your search.'}</p>
          </div>
        ) : (
          filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onRestore={() => onRestore(task.id)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
