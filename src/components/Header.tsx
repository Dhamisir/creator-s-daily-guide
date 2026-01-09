import { motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full glass"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/categories'}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="h-9 w-9 rounded-lg gradient-bg flex items-center justify-center"
          >
            <span className="text-lg font-bold text-primary-foreground">C</span>
          </motion.div>
          <span className="font-display text-xl font-bold">
            Creator<span className="gradient-text">Daily</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-secondary text-sm">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => window.location.href = '/login'}
              className="px-6 rounded-full"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
