import { useState } from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

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

  // Hours accuracy stats (only tasks with both est and actual)
  const measured = tasks.filter(t => t.estimatedHours !== undefined && t.actualHours !== undefined);
  const totalEst    = measured.reduce((s, t) => s + t.estimatedHours!, 0);
  const totalActual = measured.reduce((s, t) => s + t.actualHours!, 0);
  const avgDelta    = measured.length > 0
    ? ((totalActual - totalEst) / measured.length)
    : null;

  return (
    <div className="task-list-view">
      <div className="view-header">
        <span className="view-title">Archive — {tasks.length} completed</span>
      </div>

      {measured.length > 0 && (
        <div className="archive-stats">
          <div className="archive-stat">
            <span className="archive-stat-label">Tasks Tracked</span>
            <span className="archive-stat-value">{measured.length}</span>
          </div>
          <div className="archive-stat">
            <span className="archive-stat-label">Total Est.</span>
            <span className="archive-stat-value">{totalEst.toFixed(1)}h</span>
          </div>
          <div className="archive-stat">
            <span className="archive-stat-label">Total Actual</span>
            <span className="archive-stat-value">{totalActual.toFixed(1)}h</span>
          </div>
          <div className="archive-stat">
            <span className="archive-stat-label">Avg. Diff</span>
            <span className={`archive-stat-value ${avgDelta === null ? '' : avgDelta > 0 ? 'red' : avgDelta < 0 ? 'green' : ''}`}>
              {avgDelta === null ? '—' : (
                <>
                  {avgDelta > 0
                    ? <TrendingUp size={13} />
                    : avgDelta < 0
                    ? <TrendingDown size={13} />
                    : <Minus size={13} />
                  }
                  {avgDelta > 0 ? '+' : ''}{avgDelta.toFixed(1)}h
                </>
              )}
            </span>
          </div>
        </div>
      )}

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
