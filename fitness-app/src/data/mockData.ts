
// ============================================================
// MOCK DATA — FlexAI Fitness App
// ============================================================

// Heatmap data (last 365 days: 0=rest, 1=light, 2=moderate, 3=heavy)
export const HEATMAP_DATA: { date: string; intensity: 0 | 1 | 2 | 3 }[] = (() => {
    const data = [];
    const today = new Date();
    const seed = [1, 3, 0, 2, 1, 0, 3, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 0, 1, 2, 0];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        // Pattern: rest on Sundays mostly, heavier mid-week, mix in some zeros
        const dayOfWeek = d.getDay();
        const seedVal = seed[(364 - i) % seed.length];
        const intensity: 0 | 1 | 2 | 3 = dayOfWeek === 0
            ? (Math.random() > 0.7 ? 1 : 0)  // Sundays lighter
            : seedVal as 0 | 1 | 2 | 3;
        data.push({ date: d.toISOString().split('T')[0], intensity });
    }
    return data;
})();

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
    totalWorkouts: 342,
    totalVolume: 1240500, // lbs
    weeklyWorkouts: 5,
};

export const DUMMY_METRICS = {
    weeklyVolume: 52400,
    bestStreak: 45,
    recovery: 'Fresh',
    weeklyWorkouts: 4,
    totalWorkouts: 342,
};

// Active workout today — shown as a banner on the dashboard
export const ACTIVE_WORKOUT_TODAY = {
    id: 'aw1',
    name: 'Push Day A',
    startedAt: new Date(Date.now() - 2700000).toISOString(), // 45 min ago
    exercisesDone: 4,
    totalExercises: 6,
    volume: 8200,
    isActive: true,
};

// Today's planned workout — shown on dashboard when no active workout
export const TODAYS_PLANNED_WORKOUT = {
    routineId: 1,
    routineName: 'PPL Hypertrophy – Push Day',
    scheduledTime: '7:00 AM',
    estimatedDuration: 65, // minutes
    exercises: [
        { id: 'e1', name: 'Barbell Bench Press', sets: 4, reps: '8-10', muscle: 'Chest' },
        { id: 'e2', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', muscle: 'Chest' },
        { id: 'e3', name: 'Cable Fly', sets: 3, reps: '12-15', muscle: 'Chest' },
        { id: 'e4', name: 'Overhead Press', sets: 4, reps: '8-10', muscle: 'Shoulders' },
        { id: 'e5', name: 'Lateral Raises', sets: 3, reps: '15-20', muscle: 'Shoulders' },
        { id: 'e6', name: 'Tricep Pushdown', sets: 3, reps: '12-15', muscle: 'Triceps' },
    ],
};

export const DUMMY_RECENT_WORKOUTS = [
    {
        id: '1',
        name: 'Push Day A',
        date: 'Today, 8:30 AM',
        volume: 12450,
        duration: 3600,
        hasPR: true,
        iconName: 'weight-lifter' as any,
        prCount: 2,
        exercises: 8,
    },
    {
        id: '2',
        name: 'Pull Hypertrophy',
        date: 'Yesterday',
        volume: 10200,
        duration: 2880,
        hasPR: false,
        iconName: 'yoga' as any,
        prCount: 0,
        exercises: 7,
    },
    {
        id: '3',
        name: 'Legs & Core',
        date: '3 days ago',
        volume: 15600,
        duration: 4200,
        hasPR: true,
        iconName: 'run' as any,
        prCount: 1,
        exercises: 9,
    },
];

export const WORKOUT_STATS = {
    streak: { current: 23 },
    weeklyVolume: 52400,
    weeklyWorkouts: 4,
    recentWorkouts: DUMMY_RECENT_WORKOUTS,
};

export const ACTIVE_ROUTINES = [
    {
        id: '1',
        name: 'PPL Hypertrophy',
        daysPerWeek: 6,
        difficulty: 'Advanced',
        exercises: 24,
        color: '#6366F1',
    },
    {
        id: '2',
        name: 'Upper/Lower Strength',
        daysPerWeek: 4,
        difficulty: 'Intermediate',
        exercises: 18,
        color: '#3B82F6',
    },
    {
        id: '3',
        name: 'Full Body Fundamentals',
        daysPerWeek: 3,
        difficulty: 'Beginner',
        exercises: 12,
        color: '#10B981',
    },
];

export const MY_TEMPLATES = [
    {
        id: 't1',
        name: 'Quick Push (30 min)',
        exercises: 5,
        lastUsed: '2 days ago',
        color: '#F59E0B',
    },
    {
        id: 't2',
        name: 'Chest & Triceps',
        exercises: 7,
        lastUsed: 'Last week',
        color: '#EC4899',
    },
    {
        id: 't3',
        name: 'Back & Biceps',
        exercises: 6,
        lastUsed: '10 days ago',
        color: '#8B5CF6',
    },
];



// ============================================================
// SOCIAL
// ============================================================

export const SOCIAL_POSTS = [
    {
        id: '1',
        user: { id: 'u1', username: 'sarah_lifts', firstName: 'Sarah', avatarUrl: 'https://i.pravatar.cc/150?img=5' },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        content: 'Finally hit a 100kg squat! 3 months of grinding has paid off. 💪',
        isLiked: true,
        likesCount: 245,
        commentsCount: 42,
        workout: { name: 'Leg Day Crusher', exerciseCount: 6, duration: 4800, totalVolume: 8500 },
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop',
    },
    {
        id: '2',
        user: { id: 'u2', username: 'mike_gainz', firstName: 'Mike', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        content: 'Morning cardio done. 5am club 🌅 Time to crush the day!',
        isLiked: false,
        likesCount: 89,
        commentsCount: 12,
        workout: { name: 'Morning Run 5K', exerciseCount: 1, duration: 1800, totalVolume: 0 },
    },
    {
        id: '3',
        user: { id: 'u3', username: 'alex_fit', firstName: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?img=12' },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        content: 'New PR on bench! 120kg x 3 reps. 1 year ago I couldn\'t do 80kg. Progress is real!',
        isLiked: true,
        likesCount: 156,
        commentsCount: 28,
        workout: { name: 'Chest Day', exerciseCount: 7, duration: 3600, totalVolume: 12000 },
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
    },
];

export const SOCIAL_LEADERBOARD = [
    { rank: 1, username: 'powerking99', avatar: 'https://i.pravatar.cc/100?img=1', volume: 98400, change: '+2' },
    { rank: 2, username: 'sarah_lifts', avatar: 'https://i.pravatar.cc/100?img=5', volume: 87200, change: '0' },
    { rank: 3, username: 'mike_gainz', avatar: 'https://i.pravatar.cc/100?img=3', volume: 78900, change: '-1' },
    { rank: 4, username: 'johndoe', avatar: 'https://i.pravatar.cc/100?img=15', volume: 72400, change: '+1', isMe: true },
    { rank: 5, username: 'alex_fit', avatar: 'https://i.pravatar.cc/100?img=12', volume: 65100, change: '0' },
];

export const SOCIAL_FRIENDS = [
    { id: 'f1', username: 'sarah_lifts', firstName: 'Sarah', avatar: 'https://i.pravatar.cc/100?img=5', isActive: true },
    { id: 'f2', username: 'mike_gainz', firstName: 'Mike', avatar: 'https://i.pravatar.cc/100?img=3', isActive: false },
    { id: 'f3', username: 'alex_fit', firstName: 'Alex', avatar: 'https://i.pravatar.cc/100?img=12', isActive: true },
    { id: 'f4', username: 'lisa_reps', firstName: 'Lisa', avatar: 'https://i.pravatar.cc/100?img=9', isActive: false },
    { id: 'f5', username: 'tom_iron', firstName: 'Tom', avatar: 'https://i.pravatar.cc/100?img=7', isActive: true },
];

export const SOCIAL_CHALLENGES = [
    { id: 'sc1', name: '100 Push-ups / Day', participants: 8920, daysLeft: 12, isJoined: true, badge: '🏋️' },
    { id: 'sc2', name: 'February Volume Month', participants: 3400, daysLeft: 8, isJoined: false, badge: '🔥' },
    { id: 'sc3', name: '30-Day Squat Challenge', participants: 5200, daysLeft: 18, isJoined: false, badge: '💪' },
];

// ============================================================
// PROFILE
// ============================================================

export const PROFILE_STATS = [
    { label: 'Workouts', value: '342', icon: 'barbell-outline' as any, color: '#6366F1' },
    { label: 'Volume', value: '1.2M', icon: 'fitness-outline' as any, color: '#3B82F6' },
    { label: 'Streak', value: '23d', icon: 'flame' as any, color: '#F59E0B' },
];

export const PROFILE_ANALYTICS_SUMMARY = [
    { label: 'Best Squat', value: '140 kg', icon: 'trophy-outline' as any, color: '#F59E0B' },
    { label: 'Avg Weekly Vol', value: '52.4k', icon: 'trending-up' as any, color: '#10B981' },
    { label: 'Muscle Focus', value: 'Chest', icon: 'body-outline' as any, color: '#EC4899' },
];

// ============================================================
// EXPLORE SCREEN DATA
// ============================================================

export const EXPLORE_CATEGORIES = [
    { id: 'exercises', label: 'Exercises', icon: 'dumbbell', color: '#6366F1', count: 1200 },
    { id: 'routines', label: 'Routines', icon: 'notebook-outline', color: '#3B82F6', count: 850 },
    { id: 'templates', label: 'Templates', icon: 'file-document-outline', color: '#10B981', count: 45 },
    { id: 'challenges', label: 'Challenges', icon: 'trophy-outline', color: '#F59E0B', count: 12 },
];

export const EXPLORE_FEATURED = [
    {
        id: 'feat1',
        title: '5-Day Hypertrophy Split',
        type: 'ROUTINE',
        rating: 4.8,
        users: 12500,
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2670&auto=format&fit=crop',
    },
    {
        id: 'feat2',
        title: 'Full Body Power',
        type: 'ROUTINE',
        rating: 4.9,
        users: 8200,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2670&auto=format&fit=crop',
    },
    {
        id: 'feat3',
        title: 'Mobility & Flow',
        type: 'SESSION',
        rating: 4.7,
        users: 5400,
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2670&auto=format&fit=crop',
    },
];

export const EXPLORE_COMMUNITY_ROUTINES = [
    {
        id: 'cr1',
        name: 'Arnold Split (Modified)',
        author: 'gymrat99',
        difficulty: 'Advanced',
        days: 6,
        likes: 342,
    },
    {
        id: 'cr2',
        name: 'PPL for Beginners',
        author: 'fitness_jane',
        difficulty: 'Beginner',
        days: 3,
        likes: 890,
    },
    {
        id: 'cr3',
        name: 'Upper/Lower Strength',
        author: 'powerlifter_dave',
        difficulty: 'Intermediate',
        days: 4,
        likes: 567,
    },
];

export const EXPLORE_CHALLENGES = [
    {
        id: 'ch1',
        name: '30-Day Squat Challenge',
        participants: 1240,
        daysLeft: 12,
        badge: '🦵',
    },
    {
        id: 'ch2',
        name: 'Summer Shred 2024',
        participants: 5600,
        daysLeft: 45,
        badge: '🔥',
    },
];
