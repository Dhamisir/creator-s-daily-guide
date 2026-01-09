import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, ChevronDown, ChevronUp, CircleCheck, Circle } from 'lucide-react';
import { Task } from '@/types/tasks';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
  index: number;
}

export function TaskCard({ task, isCompleted, onToggle, index }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-xl border transition-all duration-300",
        isCompleted 
          ? "border-success/30 bg-success/5" 
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      {/* Main content */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <motion.button
            onClick={onToggle}
            className={cn(
              "mt-0.5 flex-shrink-0 transition-colors",
              isCompleted ? "text-success" : "text-muted-foreground hover:text-primary"
            )}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="checked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="animate-check-bounce"
                >
                  <CircleCheck className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="unchecked"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Circle className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Task info */}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-display text-lg font-semibold transition-all",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{task.estimated_time_min} min</span>
            </div>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 space-y-4 border-t border-border/50">
              <div className="pt-4" />
              
              {/* Do section */}
              <div>
                <h4 className="text-sm font-semibold text-success flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4" />
                  Do this
                </h4>
                <ul className="space-y-1.5">
                  {task.do.map((item, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="text-success mt-1.5 h-1 w-1 rounded-full bg-success flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don't section */}
              <div>
                <h4 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-2">
                  <span className="text-lg leading-none">×</span>
                  Avoid this
                </h4>
                <ul className="space-y-1.5">
                  {task.dont.map((item, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-destructive flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why section */}
              <div className="pt-2 border-t border-border/50">
                <h4 className="text-sm font-semibold text-accent flex items-center gap-2 mb-2">
                  💡 Why it matters
                </h4>
                <p className="text-sm text-muted-foreground">
                  {task.why}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion animation overlay */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-success/10 to-success/5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
