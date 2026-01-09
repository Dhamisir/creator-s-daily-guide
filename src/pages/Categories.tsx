import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/tasks';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ArrowRight, Briefcase, Camera, Code, Mic, Palette } from 'lucide-react';

// Map icon strings to components
const iconMap: Record<string, any> = {
    camera: Camera,
    mic: Mic,
    message: Briefcase, // using briefcase as placeholder
    social: Briefcase,
    code: Code,
    design: Palette,
};

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCategories() {
            const { data, error } = await supabase
                .from('categories')
                .select('*, platform:platforms(*)');
            if (error) {
                console.error('Error fetching categories:', error);
            } else {
                setCategories(data as unknown as Category[] || []);
            }
            setLoading(false);
        }
        fetchCategories();
    }, []);

    if (loading) return <LoadingSpinner />;

    // Group categories by platform
    const groupedCategories = categories.reduce((acc, cat) => {
        const platformName = cat.platform?.name || 'Other';
        if (!acc[platformName]) {
            acc[platformName] = [];
        }
        acc[platformName].push(cat);
        return acc;
    }, {} as Record<string, Category[]>);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-12">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h1 className="font-display text-4xl font-bold">Choose Your Path</h1>
                    <p className="text-muted-foreground text-lg">
                        Select a skill track to start your daily journey.
                    </p>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-muted-foreground">No active categories found.</p>
                        <p className="text-sm text-muted-foreground mt-2">Come back later for new challenges!</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {Object.entries(groupedCategories).map(([platformName, platformCategories]) => (
                            <div key={platformName} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold">{platformName}</h2>
                                    <div className="h-px flex-1 bg-border" />
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                    {platformCategories.map((cat, index) => {
                                        const Icon = iconMap[cat.icon] || Briefcase;
                                        return (
                                            <motion.div
                                                key={cat.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => navigate(`/plan/${cat.slug}`)}
                                                className="group cursor-pointer p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                                        <Icon size={24} />
                                                    </div>
                                                    <ArrowRight className="text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                                </div>

                                                <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {cat.description}
                                                </p>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
