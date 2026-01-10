import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DayProgressProps {
  currentDay: number;
  totalDays: number;
  completedTasks: number;
  totalTasks: number;
  onDaySelect?: (day: number) => void;
  selectedDay?: number;
}

export function DayProgress({
  currentDay,
  totalDays,
  completedTasks,
  totalTasks,
  onDaySelect,
  selectedDay
}: DayProgressProps) {
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Week progress dots */}
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length: totalDays }).map((_, index) => {
          const dayNum = index + 1;
          const isPast = dayNum < currentDay;
          const isCurrent = dayNum === currentDay;
          const isSelected = selectedDay === dayNum;

          return (
            <motion.button
              key={dayNum}
              onClick={() => onDaySelect?.(dayNum)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative flex items-center justify-center",
                "h-10 w-10 rounded-full text-sm font-display font-semibold",
                "transition-all duration-300",
                isPast && "bg-success/20 text-success",
                isCurrent && "border-2 border-primary ring-2 ring-primary/20",
                isSelected && "gradient-bg text-primary-foreground shadow-lg glow",
                !isPast && !isSelected && "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {dayNum}
              {isPast && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center opacity-20"
                >
                  <span className="text-success text-[10px] mt-4">✓</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Today's progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Today's Progress</span>
          <span className="font-semibold text-foreground">
            {completedTasks}/{totalTasks} tasks
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-all",
              progress === 100 ? "bg-success animate-pulse-glow" : "gradient-bg"
            )}
          />
        </div>
      </div>
    </div>
  );
}
