import { useState } from 'react';
import type { Task } from '../types';
import { CheckCircle, X, Clock } from 'lucide-react';

interface Props {
  task: Task;
  onConfirm: (actualHours: number | undefined) => void;
  onClose: () => void;
}

export function CompleteModal({ task, onConfirm, onClose }: Props) {
  const [hoursStr, setHoursStr] = useState(
    task.estimatedHours !== undefined ? String(task.estimatedHours) : ''
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const actual = hoursStr !== '' ? parseFloat(hoursStr) : undefined;
    onConfirm(actual);
  }

  const estimated = task.estimatedHours;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal complete-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Task</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="complete-task-name">
            <CheckCircle size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
            {task.name}
          </div>

          <label>
            Actual Hours Taken
            <input
              type="number"
              min="0.5"
              max="999"
              step="0.5"
              value={hoursStr}
              onChange={e => setHoursStr(e.target.value)}
              placeholder="How long did this actually take?"
              autoFocus
            />
          </label>

          {estimated !== undefined && hoursStr !== '' && (
            <div className="hours-comparison">
              <Clock size={12} />
              <span>
                Est: <strong>{estimated}h</strong>
                {' · '}
                Actual: <strong>{hoursStr}h</strong>
                {' · '}
                {parseFloat(hoursStr) <= estimated
                  ? <span style={{ color: 'var(--green)' }}>Under by {(estimated - parseFloat(hoursStr)).toFixed(1)}h</span>
                  : <span style={{ color: 'var(--red)' }}>Over by {(parseFloat(hoursStr) - estimated).toFixed(1)}h</span>
                }
              </span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => onConfirm(undefined)}>
              Skip
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={14} /> Mark Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
