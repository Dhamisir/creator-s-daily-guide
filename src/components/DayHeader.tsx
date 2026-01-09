import { motion } from 'framer-motion';
import { Target, Sparkles } from 'lucide-react';
import { DayData } from '@/types/tasks';

interface DayHeaderProps {
  day: DayData;
  theme: string;
}

export function DayHeader({ day, theme }: DayHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-4"
    >
      {/* Week theme badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-sm text-muted-foreground"
      >
        <Sparkles className="h-4 w-4 text-accent" />
        <span>Week 1: {theme}</span>
      </motion.div>

      {/* Day title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-3xl md:text-4xl font-bold"
      >
        <span className="gradient-text">Day {day.day}:</span>{' '}
        <span className="text-foreground">{day.title}</span>
      </motion.h1>

      {/* Goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-lg text-muted-foreground"
      >
        <Target className="h-5 w-5 text-primary" />
        <span>{day.goal}</span>
      </motion.div>
    </motion.div>
  );
}
