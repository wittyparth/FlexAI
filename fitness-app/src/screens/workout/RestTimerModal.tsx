import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    Animated,
    Easing,
    Vibration,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const TIMER_SIZE = width * 0.75;
const STROKE_WIDTH = 12;

interface RestTimerModalProps {
    visible: boolean;
    onClose: () => void;
    initialSeconds: number;
    exerciseName?: string;
    nextExercise?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function RestTimerModal({
    visible,
    onClose,
    initialSeconds,
    exerciseName = 'Current Set',
    nextExercise = 'Next Set'
}: RestTimerModalProps) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(true);
    const [totalSeconds] = useState(initialSeconds);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const circumference = 2 * Math.PI * ((TIMER_SIZE - STROKE_WIDTH) / 2);
    const progress = seconds / totalSeconds;

    // Entry animation
    useEffect(() => {
        if (visible) {
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    // Pulse animation when low on time
    useEffect(() => {
        if (seconds <= 5 && seconds > 0 && isRunning) {
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
            Vibration.vibrate(50);
        }
    }, [seconds, isRunning]);

    // Timer countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            Vibration.vibrate([0, 200, 100, 200, 100, 200]);
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, seconds]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (seconds <= 5) return colors.error;
        if (seconds <= 15) return colors.warning;
        return colors.primary.main;
    };

    const handleAddTime = (delta: number) => {
        setSeconds((prev) => Math.max(0, prev + delta));
    };

    const handlePlayPause = () => {
        setIsRunning((prev) => !prev);
    };

    const handleSkip = () => {
        onClose();
    };

    const strokeDashoffset = circumference * (1 - progress);

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <BlurView intensity={80} style={styles.blurContainer} tint="dark">
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {/* Header */}
                    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                        <Text style={[styles.headerLabel, { color: 'rgba(255,255,255,0.6)' }]}>REST TIME</Text>
                        <Text style={[styles.exerciseLabel, { color: '#FFF' }]}>{exerciseName}</Text>
                    </View>

                    {/* Center Timer Ring */}
                    <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
                        <Svg width={TIMER_SIZE} height={TIMER_SIZE} style={styles.svgContainer}>
                            {/* Background Circle */}
                            <Circle
                                cx={TIMER_SIZE / 2}
                                cy={TIMER_SIZE / 2}
                                r={(TIMER_SIZE - STROKE_WIDTH) / 2}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                            />
                            {/* Progress Circle */}
                            <Circle
                                cx={TIMER_SIZE / 2}
                                cy={TIMER_SIZE / 2}
                                r={(TIMER_SIZE - STROKE_WIDTH) / 2}
                                stroke={getTimerColor()}
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                rotation="-90"
                                origin={`${TIMER_SIZE / 2}, ${TIMER_SIZE / 2}`}
                            />
                        </Svg>
                        <View style={styles.timerContent}>
                            <Text style={[styles.timerText, { color: '#FFF', fontFamily: fontFamilies.mono }]}>
                                {formatTime(seconds)}
                            </Text>
                            <Text style={[styles.remainingLabel, { color: 'rgba(255,255,255,0.5)' }]}>
                                {seconds === 0 ? 'TIME\'S UP!' : 'remaining'}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Quick Adjust Buttons */}
                    <View style={styles.adjustRow}>
                        <TouchableOpacity
                            style={[styles.adjustBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                            onPress={() => handleAddTime(-15)}
                        >
                            <Ionicons name="remove" size={20} color="#FFF" />
                            <Text style={styles.adjustText}>15s</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.adjustBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                            onPress={() => handleAddTime(15)}
                        >
                            <Ionicons name="add" size={20} color="#FFF" />
                            <Text style={styles.adjustText}>15s</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.adjustBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                            onPress={() => handleAddTime(30)}
                        >
                            <Ionicons name="add" size={20} color="#FFF" />
                            <Text style={styles.adjustText}>30s</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Control Buttons */}
                    <View style={styles.controlsRow}>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSeconds(totalSeconds)}>
                            <Ionicons name="refresh" size={28} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={handlePlayPause}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={seconds === 0 ? [colors.success, '#059669'] as [string, string] : colors.primary.gradient as [string, string]}
                                style={styles.primaryGradient}
                            >
                                <Ionicons
                                    name={seconds === 0 ? 'checkmark' : isRunning ? 'pause' : 'play'}
                                    size={36}
                                    color="#FFF"
                                />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={handleSkip}>
                            <Ionicons name="play-skip-forward" size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Next Exercise Preview */}
                    <View style={[styles.nextExercise, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                        <MaterialCommunityIcons name="arrow-right-circle" size={24} color="rgba(255,255,255,0.6)" />
                        <View style={styles.nextContent}>
                            <Text style={styles.nextLabel}>UP NEXT</Text>
                            <Text style={styles.nextName}>{nextExercise}</Text>
                        </View>
                    </View>

                    {/* Skip Button */}
                    <TouchableOpacity
                        style={[styles.skipBtn, { borderColor: 'rgba(255,255,255,0.2)' }]}
                        onPress={handleSkip}
                    >
                        <Text style={styles.skipText}>Skip Rest & Continue</Text>
                    </TouchableOpacity>
                </Animated.View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    blurContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingBottom: 50 },
    header: { alignItems: 'center' },
    headerLabel: { fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 6 },
    exerciseLabel: { fontSize: 20, fontWeight: '700' },
    timerContainer: { alignItems: 'center', justifyContent: 'center' },
    svgContainer: { position: 'absolute' },
    timerContent: { width: TIMER_SIZE, height: TIMER_SIZE, alignItems: 'center', justifyContent: 'center' },
    timerText: { fontSize: 80, fontWeight: '200', letterSpacing: -2 },
    remainingLabel: { fontSize: 16, marginTop: 8 },
    adjustRow: { flexDirection: 'row', gap: 16 },
    adjustBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, gap: 6 },
    adjustText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 28 },
    secondaryBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    primaryBtn: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden', elevation: 10, shadowColor: themeColors.primary.main, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16 },
    primaryGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    nextExercise: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 18, borderRadius: 20, gap: 14, width: width - 48 },
    nextContent: { flex: 1 },
    nextLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
    nextName: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    skipBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, borderWidth: 1 },
    skipText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
});
