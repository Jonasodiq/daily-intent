export interface Habit {
  id: string;
  name: string;
  category: string;
  createdAt: Date;
  userId: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
}