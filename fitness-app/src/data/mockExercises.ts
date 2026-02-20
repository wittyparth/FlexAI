import { Exercise } from '../types/backend.types';

export const MOCK_EXERCISES: Exercise[] = [
    {
        id: 1,
        name: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        description: 'A classic compound exercise that targets the chest, shoulders, and triceps. Essential for building upper body pushing strength and muscle mass.',
        muscleGroup: 'Chest',
        secondaryMuscleGroups: ['Triceps', 'Shoulders'],
        equipment: 'Barbell',
        equipmentList: ['Barbell', 'Bench'],
        difficulty: 'intermediate',
        exerciseType: 'strength',
        exerciseClass: 'compound',
        instructions: [
            'Lie flat on a bench and grip the bar with a medium-width grip.',
            'Unrack the bar and hold it straight over your chest with arms locked.',
            'Lower the bar slowly until it lightly touches your mid-chest.',
            'Press the bar back up to the starting position.'
        ],
        pros: [
            'Excellent for overall chest development',
            'Allows for high weight loading',
            'Improves upper body pushing power'
        ],
        cons: [
            'Can be harsh on shoulders if form is poor',
            'Typically requires a spotter for maximal safety'
        ],
        videoUrl: 'https://cdn.pixabay.com/video/2016/06/07/3400-171542385_tiny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2670&auto=format&fit=crop',
        isFeatured: true
    },
    {
        id: 2,
        name: 'Incline Dumbbell Press',
        slug: 'incline-dumbbell-press',
        description: 'An upper chest focused pressing movement using dumbbells, allowing for a greater range of motion and independent arm action.',
        muscleGroup: 'Chest',
        secondaryMuscleGroups: ['Shoulders', 'Triceps'],
        equipment: 'Dumbbells',
        equipmentList: ['Dumbbells', 'Incline Bench'],
        difficulty: 'intermediate',
        exerciseType: 'strength',
        exerciseClass: 'compound',
        instructions: [
            'Set bench to a 30-45 degree incline.',
            'Sit with a dumbbell in each hand, resting on your thighs.',
            'Kick the weights up to your shoulders and press them overhead.',
            'Lower the dumbbells slowly until you feel a stretch in your chest.'
        ],
        pros: [
            'Targets the often-neglected upper chest',
            'Fixes strength imbalances between arms',
            'Safer on the shoulders than barbell incline press'
        ],
        cons: [
            'Getting heavy dumbbells into position can be difficult'
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2670&auto=format&fit=crop',
        isFeatured: false
    },
    {
        id: 3,
        name: 'Cable Flyes',
        slug: 'cable-flyes',
        description: 'An isolation exercise for the chest that maintains constant tension throughout the entire range of motion.',
        muscleGroup: 'Chest',
        secondaryMuscleGroups: ['Shoulders'],
        equipment: 'Cable',
        equipmentList: ['Cable Machine'],
        difficulty: 'beginner',
        exerciseType: 'strength',
        exerciseClass: 'isolation',
        instructions: [
            'Set pulleys to a high or middle position.',
            'Grab a handle in each hand and step forward.',
            'With a slight bend in your elbows, bring your hands together in front of your chest.',
            'Slowly return to the starting position.'
        ],
        pros: [
            'Provides constant tension on the chest',
            'Great for a deep stretch and contraction',
            'Very joint-friendly'
        ],
        cons: [
            'Not suited for very heavy weights',
            'Requires access to a dual cable machine'
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop',
        isFeatured: false
    },
    {
        id: 4,
        name: 'Tricep Rope Pushdown',
        slug: 'tricep-rope-pushdown',
        description: 'A versatile isolation exercise for the triceps that allows for a strong contraction at the bottom of the movement.',
        muscleGroup: 'Triceps',
        secondaryMuscleGroups: [],
        equipment: 'Cable',
        equipmentList: ['Cable Machine', 'Rope Attachment'],
        difficulty: 'beginner',
        exerciseType: 'strength',
        exerciseClass: 'isolation',
        instructions: [
            'Attach a rope to a high pulley.',
            'Keep your elbows tucked in at your sides.',
            'Push the rope down until your arms are fully extended, spreading the ends apart at the bottom.',
            'Slowly let the rope back up.'
        ],
        pros: [
            'Easy to learn and execute safely',
            'The rope allows for a natural wrist position',
            'Excellent for finishing the triceps'
        ],
        cons: [
            'Can limit the weight used compared to a straight bar'
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2670&auto=format&fit=crop',
        isFeatured: false
    },
    {
        id: 5,
        name: 'Deadlift',
        slug: 'barbell-deadlift',
        description: 'The ultimate test of total body strength, targeting the posterior chain including the back, glutes, and hamstrings.',
        muscleGroup: 'Back',
        secondaryMuscleGroups: ['Glutes', 'Hamstrings', 'Core'],
        equipment: 'Barbell',
        equipmentList: ['Barbell', 'Weights'],
        difficulty: 'advanced',
        exerciseType: 'strength',
        exerciseClass: 'compound',
        instructions: [
            'Stand with feet hip-width apart, barbell over mid-foot.',
            'Bend at the hips and knees to grip the bar outside your legs.',
            'Keep your back straight, chest up, and pull the bar up by extending your hips and knees.',
            'Stand tall, then lower the bar under control.'
        ],
        pros: [
            'Builds massive overall total body strength',
            'Develops a strong posterior chain',
            'High hormonal response due to muscle mass recruited'
        ],
        cons: [
            'High risk of lower back injury if form is incorrect',
            'Very taxing on the central nervous system'
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2670&auto=format&fit=crop',
        isFeatured: true
    },
    {
        id: 6,
        name: 'Pull-ups',
        slug: 'pull-ups',
        description: 'A fundamental bodyweight exercise that builds the lats and upper back for a wide "V-taper" look.',
        muscleGroup: 'Back',
        secondaryMuscleGroups: ['Biceps', 'Forearms', 'Core'],
        equipment: 'Bodyweight',
        equipmentList: ['Pull-up Bar'],
        difficulty: 'intermediate',
        exerciseType: 'strength',
        exerciseClass: 'compound',
        instructions: [
            'Grab the bar with an overhand grip, slightly wider than shoulder-width.',
            'Hang freely with straight arms.',
            'Pull yourself up until your chin clears the bar.',
            'Lower yourself down with control.'
        ],
        pros: [
            'Excellent for lat width development',
            'Requires minimal equipment',
            'Highly scalable with added weight or assistance'
        ],
        cons: [
            'Can be very difficult for beginners',
            'Hard to progress incrementally without micro-plates'
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=2670&auto=format&fit=crop',
        isFeatured: true
    },
    {
        id: 7,
        name: 'Barbell Curl',
        slug: 'barbell-curl',
        description: 'The standard mass builder for the biceps. Allows for heavy weight to be lifted to overload the arm flexors.',
        muscleGroup: 'Biceps',
        secondaryMuscleGroups: ['Forearms'],
        equipment: 'Barbell',
        equipmentList: ['Barbell'],
        difficulty: 'beginner',
        exerciseType: 'strength',
        exerciseClass: 'isolation',
        instructions: [
            'Stand holding a barbell with an underhand grip, shoulder-width apart.',
            'Keep your torso still and elbows tucked to your sides.',
            'Curl the bar up toward your shoulders, squeezing the biceps at the top.',
            'Lower the bar slowly to the starting position.'
        ],
        pros: [
            'Allows for the heaviest weight on bicep curls',
            'Straightforward to learn and progress'
        ],
        cons: [
            'Can cause wrist discomfort for some individuals',
            'Easy to cheat by using momentum from the back'
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1581009137042-c552e48ce53f?q=80&w=2670&auto=format&fit=crop',
        isFeatured: false
    },
    {
        id: 8,
        name: 'Barbell Squat',
        slug: 'barbell-squat',
        description: 'The undisputed king of leg exercises. A demanding multi-joint movement that builds lower body power, thigh size, and core strength.',
        muscleGroup: 'Legs',
        secondaryMuscleGroups: ['Glutes', 'Core', 'Lower Back'],
        equipment: 'Barbell',
        equipmentList: ['Barbell', 'Squat Rack'],
        difficulty: 'advanced',
        exerciseType: 'strength',
        exerciseClass: 'compound',
        instructions: [
            'Rest the barbell on your upper back/shoulders.',
            'Stand with feet somewhat wider than shoulder-width.',
            'Descend by bending your knees and pushing your hips back as if sitting in a chair.',
            'Go until your thighs are parallel to the floor or lower, then drive back up.'
        ],
        pros: [
            'Unmatched for overall leg development',
            'Spurs total body growth',
            'Highly functional movement'
        ],
        cons: [
            'Requires significant mobility and technique',
            'Can be dangerous if failing without safeties or a spotter'
        ],
        videoUrl: 'https://cdn.pixabay.com/video/2020/05/24/40056-424169622_tiny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop',
        isFeatured: true
    },
    {
        id: 9,
        name: 'Romanian Deadlift',
        slug: 'romanian-deadlift',
        description: 'A deadlift variation focusing intensely on the hamstrings and glutes through a deep stretch.',
        muscleGroup: 'Legs',
        secondaryMuscleGroups: ['Glutes', 'Lower Back'],
        equipment: 'Barbell',
        equipmentList: ['Barbell'],
        difficulty: 'intermediate',
        exerciseType: 'strength',
        exerciseClass: 'compound',
        instructions: [
            'Hold a barbell with an overhand grip at hip level.',
            'Keep your legs mostly straight with only a slight bend in the knees.',
            'Push your hips far back, lowering the bar along your shins until you feel a deep stretch in the hamstrings.',
            'Drive your hips forward to return to standing.'
        ],
        pros: [
            'Incredible for hamstring hypertrophy',
            'Teaches the hip hinge mechanic',
            'Less taxing on the CNS than standard deadlifts'
        ],
        cons: [
            'Easy to round the lower back if flexibility is poor'
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2669&auto=format&fit=crop',
        isFeatured: false
    },
    {
        id: 10,
        name: 'Leg Press',
        slug: 'leg-press',
        description: 'A machine-based compound movement that allows for incredibly heavy loading of the quads and glutes without lower back strain.',
        muscleGroup: 'Legs',
        secondaryMuscleGroups: ['Glutes', 'Calves'],
        equipment: 'Machine',
        equipmentList: ['Leg Press Machine'],
        difficulty: 'beginner',
        exerciseType: 'strength',
        exerciseClass: 'compound',
        instructions: [
            'Sit in the machine and place your feet on the sled at shoulder width.',
            'Release the safeties and lower the weight slowly toward you.',
            'Press the weight back up without fully locking out your knees at the top.'
        ],
        pros: [
            'Allows for extremely heavy loads safely',
            'Great for isolating the legs without lower back involvement',
            'Simple to learn and execute to failure'
        ],
        cons: [
            'Lacks the core engagement of free-weight squats',
            'Can cause lower back rounding at the bottom if taken too deep'
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop',
        isFeatured: false
    }
];
