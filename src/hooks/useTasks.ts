import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyPlan, UserProgress, TaskCompletion, DayData } from '@/types/tasks';
import { useAuth } from './useAuth';

export function useTasks(categorySlug?: string) {
  const { user } = useAuth();
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [completedTasks, setCompletedTasks] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState<DayData | null>(null);

  const fetchWeeklyPlan = useCallback(async () => {
    if (!categorySlug) return null;

    const { data, error } = await supabase
      .from('weekly_plans')
      .select('*, category:categories!inner(*)')
      .eq('is_active', true)
      .eq('category.slug', categorySlug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching weekly plan:', error);
      return null;
    }

    if (data) {
      // Parse days_data from JSONB
      const plan: WeeklyPlan = {
        ...(data as any),
        days_data: (data as any).days_data as DayData[],
      } as WeeklyPlan;

      setWeeklyPlan(plan);
      return plan;
    }
    return null;
  }, [categorySlug]);

  const fetchUserProgress = useCallback(async (planId: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('weekly_plan_id', planId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }

    if (data) {
      setUserProgress(data as UserProgress);
      return data as UserProgress;
    }
    return null;
  }, [user]);

  const createUserProgress = useCallback(async (planId: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        weekly_plan_id: planId,
        current_day: 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user progress:', error);
      return null;
    }

    setUserProgress(data as UserProgress);
    return data as UserProgress;
  }, [user]);

  const fetchCompletedTasks = useCallback(async (planId: string, dayNumber: number) => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('weekly_plan_id', planId)
      .eq('day_number', dayNumber);

    if (error) {
      console.error('Error fetching completed tasks:', error);
      return [];
    }

    setCompletedTasks(data as TaskCompletion[]);
    return data as TaskCompletion[];
  }, [user]);

  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    if (!user || !weeklyPlan || !userProgress) return;

    const isCompleted = completedTasks.some(t => t.task_id === taskId);

    if (isCompleted) {
      // Remove completion
      const { error } = await supabase
        .from('task_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('weekly_plan_id', weeklyPlan.id)
        .eq('day_number', userProgress.current_day)
        .eq('task_id', taskId);

      if (error) {
        console.error('Error removing task completion:', error);
        return;
      }

      setCompletedTasks(prev => prev.filter(t => t.task_id !== taskId));
    } else {
      // Add completion
      const { data, error } = await supabase
        .from('task_completions')
        .insert({
          user_id: user.id,
          weekly_plan_id: weeklyPlan.id,
          day_number: userProgress.current_day,
          task_id: taskId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding task completion:', error);
        return;
      }

      setCompletedTasks(prev => [...prev, data as TaskCompletion]);
    }
  }, [user, weeklyPlan, userProgress, completedTasks]);

  const advanceToNextDay = useCallback(async () => {
    if (!user || !weeklyPlan || !userProgress) return false;

    const nextDay = userProgress.current_day + 1;

    if (nextDay > weeklyPlan.days_data.length) {
      return false; // Week complete
    }

    const { error } = await supabase.rpc('advance_day');

    if (error) {
      console.error('Error advancing day:', error);
      return false;
    }

    setUserProgress(prev => prev ? { ...prev, current_day: nextDay } : null);
    setCompletedTasks([]);
    return true;
  }, [user, weeklyPlan, userProgress]);

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const plan = await fetchWeeklyPlan();

      if (plan) {
        let progress = await fetchUserProgress(plan.id);

        if (!progress) {
          progress = await createUserProgress(plan.id);
        }

        if (progress) {
          await fetchCompletedTasks(plan.id, progress.current_day);

          // Set current day data
          const dayData = plan.days_data.find(d => d.day === progress!.current_day);
          setCurrentDay(dayData || null);
        }
      }

      setLoading(false);
    };

    initData();
  }, [user, fetchWeeklyPlan, fetchUserProgress, createUserProgress, fetchCompletedTasks]);

  // Update current day when progress changes
  useEffect(() => {
    if (weeklyPlan && userProgress) {
      const dayData = weeklyPlan.days_data.find(d => d.day === userProgress.current_day);
      setCurrentDay(dayData || null);
    }
  }, [weeklyPlan, userProgress]);

  const isTaskCompleted = useCallback((taskId: string) => {
    return completedTasks.some(t => t.task_id === taskId);
  }, [completedTasks]);

  const allTasksCompleted = currentDay
    ? currentDay.tasks.every(task => isTaskCompleted(task.id))
    : false;

  return {
    weeklyPlan,
    userProgress,
    currentDay,
    completedTasks,
    loading,
    toggleTaskCompletion,
    isTaskCompleted,
    allTasksCompleted,
    advanceToNextDay,
  };
}
