import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { DayHeader } from '@/components/DayHeader';
import { DayProgress } from '@/components/DayProgress';
import { TaskCard } from '@/components/TaskCard';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTasks } from '@/hooks/useTasks';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useParams } from 'react-router-dom';

export default function Dashboard() {
  const { slug } = useParams();
  const {
    weeklyPlan,
    userProgress,
    currentDay,
    completedTasks,
    loading,
    toggleTaskCompletion,
    isTaskCompleted,
    allTasksCompleted,
    advanceToNextDay,
  } = useTasks(slug);

  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);

  useEffect(() => {
    if (allTasksCompleted && !hasShownCelebration && currentDay) {
      setShowCelebration(true);
      setHasShownCelebration(true);
    }
  }, [allTasksCompleted, hasShownCelebration, currentDay]);

  // Reset celebration state when day changes
  useEffect(() => {
    setHasShownCelebration(false);
    setShowCelebration(false);
  }, [userProgress?.current_day]);

  const handleNextDay = async () => {
    const success = await advanceToNextDay();
    if (success) {
      setShowCelebration(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!weeklyPlan || !currentDay || !userProgress) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold font-display">No Plan Found</h2>
            <p className="text-muted-foreground">
              We couldn't find a plan for this category or you haven't started it yet.
            </p>
            <Button onClick={() => window.location.href = '/categories'}>
              Browse Categories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalTime = currentDay.tasks.reduce((acc, task) => acc + task.estimated_time_min, 0);
  const isLastDay = userProgress.current_day >= weeklyPlan.days_data.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Header />

      <main className="container relative z-10 py-8 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Day header */}
          <DayHeader day={currentDay} theme={weeklyPlan.theme} />

          {/* Progress section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <DayProgress
              currentDay={userProgress.current_day}
              totalDays={weeklyPlan.days_data.length}
              completedTasks={completedTasks.length}
              totalTasks={currentDay.tasks.length}
            />
          </motion.div>

          {/* Time estimate */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-muted-foreground"
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm">Estimated time: ~{totalTime} minutes</span>
          </motion.div>

          {/* Tasks list */}
          <div className="space-y-4">
            {currentDay.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={isTaskCompleted(task.id)}
                onToggle={() => toggleTaskCompletion(task.id)}
                index={index}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Celebration modal */}
      <AnimatePresence>
        {showCelebration && (
          <CompletionCelebration
            onNextDay={handleNextDay}
            isLastDay={isLastDay}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
