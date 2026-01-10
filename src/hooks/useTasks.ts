import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyPlan, UserProgress, TaskCompletion, DayData } from '@/types/tasks';
import { useAuth } from './useAuth';

export function useTasks(categorySlug?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Weekly Plan
  const { data: weeklyPlan, isLoading: planLoading } = useQuery({
    queryKey: ['weeklyPlan', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*, category:categories!inner(*)')
        .eq('is_active', true)
        .eq('category.slug', categorySlug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        days_data: data.days_data as unknown as WeeklyPlan['days_data'],
      } as WeeklyPlan;
    },
    enabled: !!categorySlug,
  });

  // 2. Fetch User Progress (or Create if missing)
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress', weeklyPlan?.id, user?.id],
    queryFn: async () => {
      if (!user || !weeklyPlan) return null;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('weekly_plan_id', weeklyPlan.id)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as UserProgress;

      // Create progress if it doesn't exist
      const { data: newData, error: createError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          weekly_plan_id: weeklyPlan.id,
          current_day: 1,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newData as UserProgress;
    },
    enabled: !!user && !!weeklyPlan,
  });

  // 3. Fetch Completed Tasks
  const { data: completedTasks = [], isLoading: completedLoading } = useQuery({
    queryKey: ['completedTasks', weeklyPlan?.id, user?.id],
    queryFn: async () => {
      if (!user || !weeklyPlan) return [];

      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('weekly_plan_id', weeklyPlan.id);

      if (error) throw error;
      return data as TaskCompletion[];
    },
    enabled: !!user && !!weeklyPlan,
  });

  // Mutations
  const toggleTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user || !weeklyPlan || !userProgress) return;

      const isCompleted = completedTasks.some(t => t.task_id === taskId);

      if (isCompleted) {
        const { error } = await supabase
          .from('task_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('weekly_plan_id', weeklyPlan.id)
          .eq('day_number', userProgress.current_day)
          .eq('task_id', taskId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('task_completions')
          .insert({
            user_id: user.id,
            weekly_plan_id: weeklyPlan.id,
            day_number: userProgress.current_day,
            task_id: taskId,
          });
        if (error) throw error;
      }
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['completedTasks', weeklyPlan?.id, user?.id] });
      const previousCompletions = queryClient.getQueryData(['completedTasks', weeklyPlan?.id, user?.id]);

      queryClient.setQueryData(['completedTasks', weeklyPlan?.id, user?.id], (old: any[] = []) => {
        const isCompleted = old.some(t => t.task_id === taskId);
        if (isCompleted) {
          return old.filter(t => t.task_id !== taskId);
        } else {
          return [...old, {
            task_id: taskId,
            day_number: userProgress?.current_day,
            user_id: user?.id,
            weekly_plan_id: weeklyPlan?.id
          }];
        }
      });

      return { previousCompletions };
    },
    onError: (err, taskId, context: any) => {
      if (context?.previousCompletions) {
        queryClient.setQueryData(['completedTasks', weeklyPlan?.id, user?.id], context.previousCompletions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['completedTasks', weeklyPlan?.id, user?.id] });
    },
  });

  const advanceDayMutation = useMutation({
    mutationFn: async () => {
      if (!user || !weeklyPlan || !userProgress) return false;
      const nextDay = userProgress.current_day + 1;

      if (nextDay > weeklyPlan.days_data.days.length) {
        return false;
      }

      const { error } = await supabase.rpc('advance_day');
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress', weeklyPlan?.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
    },
  });

  const currentDay = weeklyPlan?.days_data?.days?.find(d => d.day === userProgress?.current_day) || weeklyPlan?.days_data?.days?.[0] || null;

  const isTaskCompleted = (taskId: string) => completedTasks.some(t => t.task_id === taskId);

  const allTasksCompleted = currentDay
    ? (currentDay.tasks || []).every(task => isTaskCompleted(task.id))
    : false;

  return {
    weeklyPlan,
    userProgress,
    currentDay,
    completedTasks,
    isPublic: !user,
    isAuthenticated: !!user,
    loading: planLoading || progressLoading || completedLoading,
    toggleTaskCompletion: (taskId: string) => toggleTaskMutation.mutate(taskId),
    isTaskCompleted,
    allTasksCompleted,
    advanceToNextDay: async () => advanceDayMutation.mutateAsync(),
  };
}

