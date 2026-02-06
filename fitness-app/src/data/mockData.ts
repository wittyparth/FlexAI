
export const DUMMY_USER = {
    firstName: 'John',
    surname: 'Doe',
    username: '@johndoe',
    streak: 23,
    bestStreak: 45,
    level: 42,
    xp: 12450,
    xpToNext: 15000,
    avatar: 'https://i.pravatar.cc/150?u=johndoe',
    joinedDate: 'Jan 2024',
};

export const DUMMY_METRICS = {
    weeklyVolume: 52400,
    bestStreak: 45,
    recovery: 'Fresh',
};

export const DUMMY_RECENT_WORKOUTS = [
    {
        id: '1',
        name: 'Push Day A',
        date: 'Yesterday',
        volume: 12450,
        hasPR: true,
        iconName: 'ruler' as any,
        prCount: 2,
    },
    {
        id: '2',
        name: 'Pull Hypertrophy',
        date: '3 days ago',
        volume: 10200,
        hasPR: false,
        iconName: 'yoga' as any,
        prCount: 0,
    },
    {
        id: '3',
        name: 'Legs & Core',
        date: '5 days ago',
        volume: 15600,
        hasPR: true,
        iconName: 'run' as any,
        prCount: 1,
    },
];

export const WORKOUT_STATS = {
    streak: { current: 23 },
    weeklyVolume: 52400,
    recentWorkouts: DUMMY_RECENT_WORKOUTS,
};

export const ACTIVE_ROUTINES = [
    {
        id: '1',
        name: 'PPL Hypertrophy',
        daysPerWeek: 6,
        difficulty: 'Advanced',
    },
    {
        id: '2',
        name: 'Upper/Lower Strength',
        daysPerWeek: 4,
        difficulty: 'Intermediate',
    },
    {
        id: '3',
        name: 'Full Body Fundamentals',
        daysPerWeek: 3,
        difficulty: 'Beginner',
    },
];

export const EXPLORE_CATEGORIES = [
    { id: 'exercises', icon: 'dumbbell' as any, label: 'Exercises', count: 500, color: '#3B82F6' },
    { id: 'routines', icon: 'clipboard-list-outline' as any, label: 'Routines', count: 150, color: '#10B981' },
    { id: 'programs', icon: 'calendar-month' as any, label: 'Programs', count: 25, color: '#F59E0B' },
    { id: 'challenges', icon: 'trophy-outline' as any, label: 'Challenges', count: 12, color: '#EF4444' },
];

export const EXPLORE_FEATURED = [
    { id: 1, title: '12-Week Muscle Builder', type: 'Program', rating: 4.9, users: 2400, gradient: ['#6366F1', '#8B5CF6'] },
    { id: 2, title: 'PPL Split Mastery', type: 'Routine', rating: 4.8, users: 3100, gradient: ['#EC4899', '#F43F5E'] },
    { id: 3, title: '30-Day Core Challenge', type: 'Challenge', rating: 4.9, users: 890, gradient: ['#14B8A6', '#10B981'] },
];

export const EXPLORE_TRENDING = [
    { id: 1, name: 'Bulgarian Split Squat', muscle: 'Legs', trending: '+42%', icon: 'leg' as any },
    { id: 2, name: 'Face Pull', muscle: 'Shoulders', trending: '+38%', icon: 'human-handsup' as any },
    { id: 3, name: 'Pallof Press', muscle: 'Core', trending: '+31%', icon: 'human' as any },
];

export const EXPLORE_COACH_PICKS = [
    { id: 1, name: 'Hip Hinge Mastery', coach: 'Dr. Movement', avatar: 'https://i.pravatar.cc/100?img=11' },
    { id: 2, name: 'Scapular Health', coach: 'Coach Mike', avatar: 'https://i.pravatar.cc/100?img=12' },
];

export const SOCIAL_POSTS = [
    {
        id: '1',
        user: {
            id: 'u1',
            username: 'sarah_lifts',
            firstName: 'Sarah',
            avatarUrl: 'https://i.pravatar.cc/150?img=5',
        },
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        content: 'Finally hit a 100kg squat! So happy with the progress over the last 3 months.',
        isLiked: true,
        likesCount: 245,
        commentsCount: 42,
        workout: {
            name: 'Leg Day Crusher',
            exerciseCount: 6,
            duration: 3600 + 1200, // 1h 20m
            totalVolume: 8500,
        },
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop',
    },
    {
        id: '2',
        user: {
            id: 'u2',
            username: 'mike_gainz',
            firstName: 'Mike',
            avatarUrl: 'https://i.pravatar.cc/150?img=3',
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        content: 'Morning cardio done. Time to crush the day!',
        isLiked: false,
        likesCount: 12,
        commentsCount: 2,
        workout: {
            name: 'Morning Run',
            exerciseCount: 1,
            duration: 1800, // 30m
            totalVolume: 0,
        },
    },
    {
        id: '3',
        user: {
            id: 'u3',
            username: 'alex_fit',
            firstName: 'Alex',
            avatarUrl: 'https://i.pravatar.cc/150?img=12',
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        content: 'New active wear arrived. Feeling motivated!',
        isLiked: true,
        likesCount: 89,
        commentsCount: 15,
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
    },
];

export const PROFILE_STATS = [
    { label: 'Workouts', value: '342', icon: 'barbell-outline' as any, color: '#6366F1' },
    { label: 'PRs', value: '47', icon: 'trophy' as any, color: '#F59E0B' },
    { label: 'Streak', value: '127', icon: 'flame' as any, color: '#EF4444' },
];
