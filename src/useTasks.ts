import { useState, useEffect } from 'react';
import type { Task } from './types';
import { parseISO, addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

const STORAGE_KEY = 'task-manager-tasks';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const tasks: Task[] = JSON.parse(raw);
    // backfill recurrence for tasks created before this field existed
    return tasks.map(t => ({ ...t, recurrence: t.recurrence ?? 'none' }));
  } catch {
    return [];
  }
}

function nextDeadline(deadline: string, recurrence: Task['recurrence']): string {
  const d = parseISO(deadline);
  switch (recurrence) {
    case 'daily':    return format(addDays(d, 1), 'yyyy-MM-dd');
    case 'weekly':   return format(addWeeks(d, 1), 'yyyy-MM-dd');
    case 'biweekly': return format(addWeeks(d, 2), 'yyyy-MM-dd');
    case 'monthly':  return format(addMonths(d, 1), 'yyyy-MM-dd');
    case 'yearly':   return format(addYears(d, 1), 'yyyy-MM-dd');
    default:         return deadline;
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTask(task: Omit<Task, 'id' | 'createdAt' | 'completed'>) {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setTasks(prev => [newTask, ...prev]);
  }

  function updateTask(id: string, updates: Partial<Task>) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }

  function completeTask(id: string) {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;

      const completed = prev.map(t =>
        t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      );

      // For recurring tasks, auto-create the next instance
      if (task.recurrence !== 'none') {
        const next: Task = {
          ...task,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          deadline: nextDeadline(task.deadline, task.recurrence),
          completed: false,
          completedAt: undefined,
        };
        return [next, ...completed];
      }

      return completed;
    });
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function restoreTask(id: string) {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: false, completedAt: undefined } : t))
    );
  }

  const active = tasks.filter(t => !t.completed);
  const archived = tasks.filter(t => t.completed);

  return { tasks, active, archived, addTask, updateTask, completeTask, deleteTask, restoreTask };
}
