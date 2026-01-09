export interface Task {
  id: string;
  title: string;
  do: string[];
  dont: string[];
  why: string;
  estimated_time_min: number;
}

export interface DayData {
  day: number;
  title: string;
  goal: string;
  tasks: Task[];
}

export interface WeeklyPlan {
  id: string;
  week_number: number;
  theme: string;
  days_data: DayData[];
  created_at: string;
  is_active: boolean;
}

export interface UserProgress {
  id: string;
  user_id: string;
  weekly_plan_id: string;
  current_day: number;
  started_at: string;
  last_activity_at: string;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  weekly_plan_id: string;
  day_number: number;
  task_id: string;
  completed_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}
