export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface Task {
  id: string;
  name: string;
  priority: Priority;
  createdAt: string;   // ISO date string
  deadline: string;    // YYYY-MM-DD
  notes: string;
  completed: boolean;
  completedAt?: string;
  recurrence: Recurrence;
}

export type View = 'tasks' | 'calendar' | 'archive';
