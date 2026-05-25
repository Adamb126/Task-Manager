import { useState } from 'react';
import type { Priority, Recurrence, Task } from '../types';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Props {
  initial?: Task;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: 'none',     label: 'No recurrence' },
  { value: 'daily',    label: 'Daily' },
  { value: 'weekly',   label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly',  label: 'Monthly' },
  { value: 'yearly',   label: 'Yearly' },
];

export function TaskForm({ initial, onSave, onClose }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName]         = useState(initial?.name ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [deadline, setDeadline] = useState(initial?.deadline ?? today);
  const [notes, setNotes]       = useState(initial?.notes ?? '');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'none');
  const [estHoursStr, setEstHoursStr] = useState(
    initial?.estimatedHours !== undefined ? String(initial.estimatedHours) : ''
  );
  const [startTime, setStartTime] = useState(initial?.startTime ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !deadline) return;
    const estimatedHours = estHoursStr !== '' ? parseFloat(estHoursStr) : undefined;
    onSave({
      name: name.trim(), priority, deadline, notes, recurrence, estimatedHours,
      startTime: startTime || undefined,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Task' : 'New Task'}</h2>
          {initial && (
            <span className="form-created-date">
              Created {format(parseISO(initial.createdAt), 'MMM d, yyyy')}
            </span>
          )}
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="task-form">
          <label>
            Task Name *
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </label>
          <div className="form-row">
            <label>
              Deadline *
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                required
              />
            </label>
            <label>
              Start Time
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Priority
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </label>
            <label>
              Est. Hours
              <input
                type="number"
                min="0.5"
                max="999"
                step="0.5"
                value={estHoursStr}
                onChange={e => setEstHoursStr(e.target.value)}
                placeholder="e.g. 2.5"
              />
            </label>
          </div>
          <label>
            Recurrence
            <select value={recurrence} onChange={e => setRecurrence(e.target.value as Recurrence)}>
              {RECURRENCES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {initial ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
