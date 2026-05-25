export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  name: string;
  priority: Priority;
  createdAt: string;   // ISO date string
  deadline: string;    // ISO date string (YYYY-MM-DD)
  notes: string;
  completed: boolean;
  completedAt?: string;
}

export type View = 'tasks' | 'calendar' | 'archive';
