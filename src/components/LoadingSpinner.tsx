import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 mx-auto rounded-full border-4 border-muted border-t-primary"
        />
        <p className="text-muted-foreground">Loading your tasks...</p>
      </motion.div>
    </div>
  );
}
