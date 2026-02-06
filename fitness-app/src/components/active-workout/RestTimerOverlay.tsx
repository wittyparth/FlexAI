import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Image,
    Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fontFamilies } from '../../theme/typography';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

interface RestTimerProps {
    isVisible: boolean;
    durationSeconds: number; // e.g., 90
    elapsedSeconds: number; // e.g. 5
    onAddFirst: () => void; // +15s
    onAddSecond: () => void; // +30s
    onSkip: () => void;
    nextExerciseName?: string;
    nextSetNumber?: number;
    nextReps?: string;
}

// Timer Ring Config
const SIZE = 340;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const RestTimerOverlay: React.FC<RestTimerProps> = ({
    isVisible,
    durationSeconds,
    elapsedSeconds,
    onAddFirst,
    onAddSecond,
    onSkip,
    nextExerciseName = 'Incline Dumbbell Press',
    nextSetNumber = 2,
    nextReps = '8-10 Reps'
}) => {
    // Animations
    const animatedProgress = useRef(new Animated.Value(0)).current;

    // Derived state
    const remainingTime = Math.max(0, durationSeconds - elapsedSeconds);
    const progress = Math.min(1, elapsedSeconds / durationSeconds); // 0 to 1

    useEffect(() => {
        // Animate the ring smoothly
        Animated.timing(animatedProgress, {
            toValue: progress,
            duration: 1000, // Update every second basically
            useNativeDriver: true,
        }).start();
    }, [progress]);

    // Calculate stroke dashoffset
    // We want the ring to be "empty" or "full"?
    // User design: "Progress Circle (Dashed) ... stroke-dashoffset=245"
    // Usually timers fill up or empty down. Let's assume empties down (remaining time).
    // Or fills up (elapsed time).
    // User HTML: stroke-dasharray="980", stroke-dashoffset="245" (~75% full/empty).
    // Let's make it fill UP generally, or just match visual.
    // implementation: strokeDashoffset = CIRCUMFERENCE * (1 - progress)

    const strokeDashoffset = animatedProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [CIRCUMFERENCE, 0]
    });

    if (!isVisible) return null;

    // Format time MM:SS
    const mins = Math.floor(remainingTime / 60).toString().padStart(2, '0');
    const secs = (remainingTime % 60).toString().padStart(2, '0');

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Image Layer */}
            <View style={StyleSheet.absoluteFill}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop' }}
                    style={[StyleSheet.absoluteFill, { opacity: 0.4 }]} // Dark mode opacity usually 0.2-0.4
                    resizeMode="cover"
                />
            </View>

            {/* Glass Blur Layer */}
            <BlurView
                intensity={80} // Heavy blur
                tint="dark" // "light" or "dark" based on theme, user requested specific dark/light logic
                style={[StyleSheet.absoluteFill, styles.glassContainer]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.spacer} />
                    <Text style={styles.headerTitle}>Resting...</Text>
                    <TouchableOpacity style={styles.moreButton}>
                        <MaterialIcons name="more-horiz" size={24} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {/* Main Timer Ring */}
                <View style={styles.ringContainer}>
                    <View style={{ width: SIZE, height: SIZE, transform: [{ rotate: '-90deg' }] }}>
                        <Svg width={SIZE} height={SIZE}>
                            {/* Track Circle */}
                            <Circle
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                stroke="#334155" // slate-700
                                strokeWidth="2"
                                fill="transparent"
                            />
                            {/* Progress Circle (Dashed) */}
                            <AnimatedCircle
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                stroke={colors.primary.main} // "#0d59f2"
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                                strokeDasharray={`${CIRCUMFERENCE}`} // No dashes for seamless fill usually, User asked for dashed "10 10 10 10" style though in HTML
                                // strokeDasharray="10, 10"  <-- If we want dashed look
                                strokeLinecap="round"
                                strokeDashoffset={strokeDashoffset}
                            />
                            {/* Knob? Complex to animate along path with just SVG in RN without Reanimated 2/3 path parsing. 
                                Skipping knob for now or static position logic would be complex. 
                            */}
                        </Svg>
                    </View>

                    {/* Digital Timer Text */}
                    <View style={styles.digitalTimerContainer}>
                        <Text style={styles.timerText}>
                            {mins}:{secs}
                        </Text>
                        <Text style={styles.timerLabel}>RECOVERY</Text>
                    </View>
                </View>

                {/* Controls & Next Up */}
                <View style={styles.controlsSection}>
                    {/* Ghost Buttons */}
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={styles.ghostButton} onPress={onAddFirst}>
                            <Text style={styles.ghostButtonText}>+15s</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.ghostButton} onPress={onAddSecond}>
                            <Text style={styles.ghostButtonText}>+30s</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.skipLabel}>SKIP</Text>
                                <MaterialIcons name="fast-forward" size={20} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Next Up Card */}
                    <View style={styles.nextUpWrapper}>
                        {/* Gradient Border Hack: View with background color? LinearGradient implies expo-linear-gradient */}
                        {/* We will use a simple border for now or simplified implementation, 
                             User code used `bg-gradient-to-r from-primary ...` as padding wrapper 
                         */}
                        <View style={[styles.gradientBorder, { backgroundColor: colors.primary.main }]}>
                            <View style={styles.nextUpCard}>
                                <View style={{ flex: 1, zIndex: 10 }}>
                                    <Text style={styles.nextUpLabel}>Next Up</Text>
                                    <Text style={styles.nextUpTitle} numberOfLines={1}>{nextExerciseName}</Text>
                                    <View style={styles.nextUpMetaRow}>
                                        <View style={styles.setTag}>
                                            <Text style={styles.setTagText}>Set {nextSetNumber}</Text>
                                        </View>
                                        <Text style={styles.metaText}>{nextReps}</Text>
                                    </View>
                                </View>

                                {/* Icon */}
                                <View style={styles.nextUpIconBox}>
                                    <MaterialCommunityIcons name="dumbbell" size={28} color={colors.primary.main} />
                                </View>

                                {/* Decorative Background Blob */}
                                <View style={styles.blob} />
                            </View>
                        </View>
                    </View>
                </View>

            </BlurView>
        </View>
    );
};

// Styles based on Tailwind config provided
/*
    colors: {
        "primary": "#0d59f2",
        "background-light": "#f5f6f8",
        "background-dark": "#101622",
    },
    text-slate-900 / white
*/

const styles = StyleSheet.create({
    glassContainer: {
        flex: 1,
        // backgroundColor: 'rgba(16, 22, 34, 0.9)', // Fallback / Base tint. BlurView tint="dark" helps.
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    spacer: { width: 40 },
    headerTitle: {
        fontSize: 20,
        fontFamily: fontFamilies.display, // "Calistoga" requested as headline font? No, User HTML says h1 is "font-headline" -> Calistoga.
        // Wait, User HTML config: "headline": ["Calistoga", "serif"]
        // Let's try to map fontFamilies.display (Calistoga)
        color: '#F1F5F9', // slate-100
        opacity: 0.8,
        letterSpacing: 0.5,
    },
    moreButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    ringContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -40, // Visual offset from header
    },
    digitalTimerContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 100, // md:text-[120px] might be too big for narrow phones, 100 safe
        fontFamily: fontFamilies.mono, // "JetBrains Mono"
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 100, // tight
    },
    timerLabel: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B', // slate-500
        textTransform: 'uppercase',
        letterSpacing: 2, // tracking-widest
    },
    controlsSection: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 32,
        width: '100%',
    },
    buttonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        maxWidth: 450, // max-w-md
        alignSelf: 'center',
        width: '100%',
    },
    ghostButton: {
        flex: 1,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155', // slate-700
        alignItems: 'center',
        justifyContent: 'center',
    },
    ghostButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#E2E8F0', // slate-200
    },
    skipButton: {
        flex: 1,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800 hoverish
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94A3B8', // slate-400
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    nextUpWrapper: {
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 16,
        opacity: 0.8, // subtle glow
    },
    nextUpCard: {
        backgroundColor: '#0F172A', // slate-900
        borderRadius: 14, // calc(1rem - 2px)
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    nextUpLabel: {
        fontFamily: fontFamilies.display, // Calistoga match? Or "headline"
        fontSize: 18,
        color: colors.primary.main, // primary text
        marginBottom: 4,
    },
    nextUpTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 24,
        marginBottom: 8,
    },
    nextUpMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    setTag: {
        backgroundColor: '#1E293B', // slate-800
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    setTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8', // slate-400
    },
    metaText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B', // slate-500
    },
    nextUpIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(13, 89, 242, 0.1)', // primary/10
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    blob: {
        position: 'absolute',
        right: -40,
        bottom: -40,
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(13, 89, 242, 0.05)', // primary/5
        zIndex: 0,
    }
});
