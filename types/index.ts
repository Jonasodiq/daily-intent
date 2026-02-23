export interface Habit {
  id: string;
  name: string;
  category: string;
  createdAt: Date;
  userId: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
}