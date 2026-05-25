import { useState, useEffect } from 'react';
import type { Task } from './types';

const STORAGE_KEY = 'task-manager-tasks';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
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
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      )
    );
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
