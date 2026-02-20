/**
 * RestTimerOverlay — Premium fullscreen rest-timer with:
 *  - Solid opaque dark background (no blur dependency)
 *  - Animated SVG ring countdown
 *  - Close / Minimize / Maximize controls
 *  - +15s / +30s / Skip controls
 *  - "Next Up" card
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    StatusBar,
    Platform,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamilies } from '../../theme/typography';

const { width, height } = Dimensions.get('window');

// ─── Ring Config ─────────────────────────────────────────
const RING_SIZE = Math.min(width * 0.72, 280);
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Timer Mode ───────────────────────────────────────────
type TimerMode = 'fullscreen' | 'minimized';

interface RestTimerProps {
    isVisible: boolean;
    durationSeconds: number;
    elapsedSeconds: number;
    onAddTime: (seconds: number) => void;
    onSkip: () => void;
    onClose: () => void;
    onOpenSettings?: () => void;
    nextExerciseName?: string;
    nextSetNumber?: number;
    nextReps?: string;
}

export const RestTimerOverlay: React.FC<RestTimerProps> = ({
    isVisible,
    durationSeconds,
    elapsedSeconds,
    onAddTime,
    onSkip,
    onClose,
    onOpenSettings,
    nextExerciseName = 'Next Exercise',
    nextSetNumber = 1,
    nextReps = '8–12 Reps',
}) => {
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState<TimerMode>('fullscreen');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const ringProgress = useRef(new Animated.Value(0)).current;

    const remainingTime = Math.max(0, durationSeconds - elapsedSeconds);
    const progress = durationSeconds > 0 ? Math.min(1, elapsedSeconds / durationSeconds) : 0;

    // Format time
    const mins = Math.floor(remainingTime / 60).toString().padStart(2, '0');
    const secs = (remainingTime % 60).toString().padStart(2, '0');

    // Animate ring
    useEffect(() => {
        Animated.timing(ringProgress, {
            toValue: progress,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [progress]);

    // Animate in/out
    useEffect(() => {
        if (isVisible) {
            setMode('fullscreen');
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
            ]).start();
        } else {
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
            slideAnim.setValue(50);
        }
    }, [isVisible]);

    const strokeDashoffset = ringProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [CIRCUMFERENCE, 0],
    });

    if (!isVisible) return null;

    // ─── MINIMIZED pill ─────────────────────────────────
    if (mode === 'minimized') {
        return (
            <Animated.View
                style={[
                    styles.minimizedPill,
                    {
                        bottom: insets.bottom + 150,
                        opacity: fadeAnim,
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.minimizedInner}
                    onPress={() => setMode('fullscreen')}
                    activeOpacity={0.9}
                >
                    <View style={styles.minimizedGrad}>
                        {/* Mini ring indicator */}
                        <View style={styles.miniRingWrapper}>
                            <Svg width={36} height={36} style={{ transform: [{ rotate: '-90deg' }] }}>
                                <Circle cx={18} cy={18} r={14} stroke="#334155" strokeWidth={3} fill="none" />
                                <Circle
                                    cx={18} cy={18} r={14}
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 14}`}
                                    strokeDashoffset={(2 * Math.PI * 14) * progress}
                                    strokeLinecap="round"
                                />
                            </Svg>
                            <Text style={styles.miniTime}>{secs}</Text>
                        </View>

                        <View style={styles.miniInfo}>
                            <Text style={styles.miniLabel}>REST</Text>
                            <Text style={styles.miniTimeMain}>{mins}:{secs}</Text>
                        </View>

                        {/* Controls */}
                        <View style={styles.miniActions}>
                            <TouchableOpacity onPress={() => setMode('fullscreen')} style={styles.miniBtn}>
                                <Ionicons name="expand" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onSkip} style={[styles.miniBtn, styles.miniSkipBtn]}>
                                <Ionicons name="play-skip-forward" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    // ─── FULLSCREEN ──────────────────────────────────────
    return (
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: fadeAnim }]}>
            <StatusBar barStyle="light-content" />

            {/* Solid opaque dark background */}
            <View style={StyleSheet.absoluteFill}>
                <View
                    style={StyleSheet.absoluteFill}
                />
                {/* Subtle glow blob */}
                <View style={styles.glowBlob1} />
                <View style={styles.glowBlob2} />
            </View>

            {/* ── TOP BAR ── */}
            <Animated.View
                style={[
                    styles.topBar,
                    { paddingTop: insets.top + 12, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <Text style={styles.restingLabel}>REST TIMER</Text>

                <View style={styles.topActions}>
                    {/* Settings */}
                    {onOpenSettings && (
                        <TouchableOpacity
                            style={styles.topBtn}
                            onPress={onOpenSettings}
                        >
                            <Ionicons name="settings-outline" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    )}

                    {/* Minimize */}
                    <TouchableOpacity
                        style={styles.topBtn}
                        onPress={() => setMode('minimized')}
                    >
                        <Ionicons name="remove" size={20} color="#94A3B8" />
                    </TouchableOpacity>

                    {/* Close / Skip Rest */}
                    <TouchableOpacity
                        style={[styles.topBtn, styles.closeBtn]}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* ── RING + TIMER ── */}
            <Animated.View
                style={[styles.ringSection, { transform: [{ translateY: slideAnim }] }]}
            >
                {/* Outer glow ring */}
                <View style={[styles.ringGlow, { width: RING_SIZE + 32, height: RING_SIZE + 32, borderRadius: (RING_SIZE + 32) / 2 }]} />

                <Svg
                    width={RING_SIZE}
                    height={RING_SIZE}
                    style={{ transform: [{ rotate: '-90deg' }] }}
                >
                    <Defs>
                        <SvgGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#2563EB" />
                            <Stop offset="100%" stopColor="#7C3AED" />
                        </SvgGradient>
                    </Defs>
                    {/* Track */}
                    <Circle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RADIUS}
                        stroke="#1E293B"
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                    />
                    {/* Progress */}
                    <AnimatedCircle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RADIUS}
                        stroke="url(#ringGrad)"
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${CIRCUMFERENCE}`}
                        strokeDashoffset={strokeDashoffset}
                    />
                </Svg>

                {/* Center Timer Text */}
                <View style={styles.timerCenter}>
                    <Text style={styles.timerDigits}>{mins}:{secs}</Text>
                    <Text style={styles.timerSubLabel}>RECOVERY</Text>

                    {/* Progress % */}
                    <View style={styles.progressBadge}>
                        <Text style={styles.progressBadgeText}>
                            {Math.round(progress * 100)}%
                        </Text>
                    </View>
                </View>
            </Animated.View>

            {/* ── CONTROLS ── */}
            <Animated.View
                style={[styles.controls, { transform: [{ translateY: slideAnim }] }]}
            >
                {/* Add time buttons */}
                <View style={styles.addTimeRow}>
                    <TouchableOpacity
                        style={styles.addTimeBtn}
                        onPress={() => onAddTime(15)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.addTimeBtnText}>+15s</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.addTimeBtn}
                        onPress={() => onAddTime(30)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.addTimeBtnText}>+30s</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.addTimeBtn}
                        onPress={() => onAddTime(60)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.addTimeBtnText}>+1m</Text>
                    </TouchableOpacity>
                </View>

                {/* Skip Button */}
                <TouchableOpacity
                    style={styles.skipBtn}
                    onPress={onSkip}
                    activeOpacity={0.85}
                >
                    <View
                        style={styles.skipBtnGrad}
                    >
                        <Ionicons name="play-skip-forward" size={22} color="#FFFFFF" />
                        <Text style={styles.skipBtnText}>SKIP REST</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* ── NEXT UP CARD ── */}
            <Animated.View
                style={[
                    styles.nextUpCard,
                    { bottom: insets.bottom + 24, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <View style={styles.nextUpInner}>
                    <View style={styles.nextUpLeft}>
                        <Text style={styles.nextUpLabel}>NEXT UP</Text>
                        <Text style={styles.nextUpName} numberOfLines={1}>{nextExerciseName}</Text>
                        <View style={styles.nextUpMeta}>
                            <View style={styles.nextUpBadge}>
                                <Text style={styles.nextUpBadgeText}>Set {nextSetNumber}</Text>
                            </View>
                            <Text style={styles.nextUpReps}>{nextReps}</Text>
                        </View>
                    </View>
                    <View style={styles.nextUpIcon}>
                        <MaterialCommunityIcons name="dumbbell" size={26} color="#60A5FA" />
                    </View>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        zIndex: 1000,
        elevation: 1000,
    },
    // Glow FX
    glowBlob1: {
        position: 'absolute',
        top: -80,
        left: -80,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: '#2563EB',
        opacity: 0.08,
    },
    glowBlob2: {
        position: 'absolute',
        bottom: 100,
        right: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#7C3AED',
        opacity: 0.08,
    },

    // ── TOP BAR ──
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    restingLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#475569',
        letterSpacing: 2,
    },
    topActions: {
        flexDirection: 'row',
        gap: 10,
    },
    topBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    closeBtn: {
        backgroundColor: '#7F1D1D20',
        borderColor: '#EF444440',
    },

    // ── RING ──
    ringSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringGlow: {
        position: 'absolute',
        backgroundColor: '#2563EB',
        opacity: 0.04,
    },
    timerCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerDigits: {
        fontSize: 80,
        fontFamily: fontFamilies.mono,
        fontWeight: '700',
        color: '#F8FAFC',
        lineHeight: 88,
        letterSpacing: -2,
    },
    timerSubLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 3,
        marginTop: 4,
    },
    progressBadge: {
        marginTop: 10,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#334155',
    },
    progressBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#60A5FA',
    },

    // ── CONTROLS ──
    controls: {
        paddingHorizontal: 24,
        gap: 14,
        paddingBottom: 16,
    },
    addTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    addTimeBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    addTimeBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#CBD5E1',
        fontFamily: fontFamilies.mono,
    },
    skipBtn: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    skipBtnGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    skipBtnText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1,
    },

    // ── NEXT UP ──
    nextUpCard: {
        position: 'absolute',
        left: 20,
        right: 20,
    },
    nextUpInner: {
        backgroundColor: '#0F172A',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#1E293B',
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    nextUpLeft: {
        flex: 1,
        gap: 4,
    },
    nextUpLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#60A5FA',
        letterSpacing: 2,
    },
    nextUpName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F1F5F9',
    },
    nextUpMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    nextUpBadge: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    nextUpBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    nextUpReps: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    nextUpIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#172554',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        flexShrink: 0,
    },

    // ── MINIMIZED PILL ──
    minimizedPill: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 999,
        elevation: 999,
    },
    minimizedInner: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    minimizedGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 20,
    },
    miniRingWrapper: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    miniTime: {
        position: 'absolute',
        fontSize: 9,
        fontWeight: '800',
        color: '#60A5FA',
        fontFamily: fontFamilies.mono,
    },
    miniInfo: {
        flex: 1,
    },
    miniLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 1.5,
    },
    miniTimeMain: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F1F5F9',
        fontFamily: fontFamilies.mono,
        lineHeight: 24,
    },
    miniActions: {
        flexDirection: 'row',
        gap: 8,
    },
    miniBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    miniSkipBtn: {
        backgroundColor: '#2563EB',
        borderColor: '#3B82F6',
    },
});
