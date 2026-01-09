import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chrome, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/categories');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Failed to sign in with Google. Please try again.');
        console.error(error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="inline-flex h-14 w-14 rounded-xl gradient-bg items-center justify-center mb-4"
            >
              <span className="text-2xl font-bold text-primary-foreground">C</span>
            </motion.div>
            <h1 className="font-display text-3xl font-bold">
              Creator<span className="gradient-text">Daily</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Your daily guide to Instagram growth
            </p>
          </div>

          {/* Auth card */}
          <div className="glass rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to continue your daily tasks
              </p>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              className="w-full gap-2 h-11"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Chrome className="h-5 w-5" />
              )}
              Continue with Google
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By continuing, you verify that you are ready to commit to the challenge.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
