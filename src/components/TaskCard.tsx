import type { Task } from '../types';
import { CheckCircle, Clock, Edit2, Trash2, RotateCcw, AlertCircle, AlertTriangle, Minus, ChevronDown, ChevronUp, RefreshCw, CalendarDays, Timer } from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { useState } from 'react';

interface Props {
  task: Task;
  onComplete?: () => void;
  onRestore?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
}

const PRIORITY_CONFIG = {
  low:    { icon: Minus,         color: 'priority-low',    label: 'Low' },
  medium: { icon: Clock,         color: 'priority-medium', label: 'Medium' },
  high:   { icon: AlertTriangle, color: 'priority-high',   label: 'High' },
  urgent: { icon: AlertCircle,   color: 'priority-urgent', label: 'Urgent' },
};

const RECURRENCE_LABEL: Record<string, string> = {
  daily:    'Daily',
  weekly:   'Weekly',
  biweekly: 'Every 2 wks',
  monthly:  'Monthly',
  yearly:   'Yearly',
};

export function TaskCard({ task, onComplete, onRestore, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY_CONFIG[task.priority];
  const PriorityIcon = cfg.icon;
  const deadline   = parseISO(task.deadline);
  const overdue    = !task.completed && isPast(deadline) && !isToday(deadline);
  const dueToday   = !task.completed && isToday(deadline);
  const isRecurring = task.recurrence && task.recurrence !== 'none';
  const hasNotes   = Boolean(task.notes);

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''} ${dueToday ? 'due-today' : ''}`}>
      <div className="task-card-main">
        <div className="task-card-left">
          {onComplete && (
            <button className="complete-btn" onClick={onComplete} title="Mark complete">
              <CheckCircle size={22} />
            </button>
          )}
          {onRestore && (
            <button className="restore-btn" onClick={onRestore} title="Restore task">
              <RotateCcw size={18} />
            </button>
          )}
          <div className="task-info">
            <div className="task-name-row">
              <span className="task-name">{task.name}</span>
              {isRecurring && (
                <span className="recurrence-badge" title={`Repeats ${RECURRENCE_LABEL[task.recurrence]}`}>
                  <RefreshCw size={10} />
                  {RECURRENCE_LABEL[task.recurrence]}
                </span>
              )}
            </div>
            <div className="task-meta">
              <span className={`priority-badge ${cfg.color}`}>
                <PriorityIcon size={12} />
                {cfg.label}
              </span>
              <span className={`deadline-badge ${overdue ? 'overdue-text' : dueToday ? 'today-text' : ''}`}>
                <Clock size={12} />
                {overdue ? 'Overdue · ' : dueToday ? 'Due today · ' : ''}
                {format(deadline, 'MMM d, yyyy')}
              </span>
              {task.estimatedHours !== undefined && (
                <span className="hours-badge">
                  <Timer size={11} />
                  Est: {task.estimatedHours}h
                  {task.actualHours !== undefined && (
                    <>
                      {' · '}Actual: {task.actualHours}h
                      {task.actualHours <= task.estimatedHours
                        ? <span className="hours-under"> ▼{(task.estimatedHours - task.actualHours).toFixed(1)}h</span>
                        : <span className="hours-over"> ▲{(task.actualHours - task.estimatedHours).toFixed(1)}h</span>
                      }
                    </>
                  )}
                </span>
              )}
              {task.actualHours !== undefined && task.estimatedHours === undefined && (
                <span className="hours-badge">
                  <Timer size={11} />
                  Took: {task.actualHours}h
                </span>
              )}
              <span className="created-badge">
                <CalendarDays size={11} />
                Created {format(parseISO(task.createdAt), 'MMM d, yyyy')}
              </span>
              {task.completed && task.completedAt && (
                <span className="completed-badge">
                  Done {format(parseISO(task.completedAt), 'MMM d')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="task-card-actions">
          {hasNotes && (
            <button className="icon-btn" onClick={() => setExpanded(e => !e)} title="Toggle notes">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          {onEdit && (
            <button className="icon-btn" onClick={onEdit} title="Edit task">
              <Edit2 size={16} />
            </button>
          )}
          <button className="icon-btn danger" onClick={onDelete} title="Delete task">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {expanded && task.notes && (
        <div className="task-notes">
          <p>{task.notes}</p>
        </div>
      )}
    </div>
  );
}
