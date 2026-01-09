import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Trophy, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/categories');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute top-40 -left-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />

                <div className="container px-4 py-24 mx-auto relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-secondary/50 border border-border text-sm font-medium mb-6 inline-block">
                            🚀 Level up your daily routine
                        </span>
                        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-8">
                            Daily <span className="gradient-text">Creators</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Master new skills with structured weekly plans.
                            Track your progress, build consistency, and achieve your goals one day at a time.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform"
                                onClick={() => navigate('/login')}
                            >
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="container px-4 py-20 mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Trophy className="h-8 w-8 text-accent" />}
                        title="Weekly Themes"
                        description="Focused objectives for every week to ensure steady progress in your journey."
                    />
                    <FeatureCard
                        icon={<CheckCircle2 className="h-8 w-8 text-success" />}
                        title="Daily Tasks"
                        description="Clear, actionable tasks designed to be completed in less than an hour."
                    />
                    <FeatureCard
                        icon={<Rocket className="h-8 w-8 text-primary" />}
                        title="Track Growth"
                        description="Visualize your consistency and celebrate milestones as you advance."
                    />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors text-center md:text-left"
        >
            <div className="mb-4 inline-flex p-3 rounded-xl bg-secondary/50">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </motion.div>
    );
}
