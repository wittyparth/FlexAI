/**
 * Skeleton Loader Component
 * 
 * Animated skeleton placeholders for loading states
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useColors } from '../../hooks';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
    const colors = useColors();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: colors.border,
                    opacity,
                },
                style,
            ]}
        />
    );
}

interface DashboardSkeletonProps {
    style?: any;
}

export function DashboardSkeleton({ style }: DashboardSkeletonProps) {
    const colors = useColors();

    return (
        <View style={[styles.container, style]}>
            {/* Header */}
            <View style={styles.header}>
                <Skeleton width={150} height={24} />
                <Skeleton width={80} height={20} style={{ marginTop: 8 }} />
            </View>

            {/* Streak Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.streakHeader}>
                    <Skeleton width={120} height={20} />
                    <Skeleton width={40} height={40} borderRadius={20} />
                </View>
                <Skeleton width={80} height={48} style={{ marginTop: 12 }} />
                <Skeleton width={60} height={16} style={{ marginTop: 4 }} />
            </View>

            {/* Start Workout Button */}
            <Skeleton width="100%" height={56} borderRadius={16} style={{ marginTop: 16 }} />

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Skeleton width={32} height={32} borderRadius={16} />
                    <Skeleton width={80} height={24} style={{ marginTop: 12 }} />
                    <Skeleton width={100} height={16} style={{ marginTop: 4 }} />
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Skeleton width={32} height={32} borderRadius={16} />
                    <Skeleton width={80} height={24} style={{ marginTop: 12 }} />
                    <Skeleton width={100} height={16} style={{ marginTop: 4 }} />
                </View>
            </View>

            {/* Today's Workout Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}>
                <Skeleton width={120} height={20} />
                <Skeleton width="100%" height={24} style={{ marginTop: 12 }} />
                <View style={styles.metaRow}>
                    <Skeleton width={80} height={16} />
                    <Skeleton width={80} height={16} />
                    <Skeleton width={80} height={16} />
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsGrid}>
                {[1, 2, 3, 4].map((i) => (
                    <View
                        key={i}
                        style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <Skeleton width={40} height={40} borderRadius={20} />
                        <Skeleton width={60} height={16} style={{ marginTop: 8 }} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    streakHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 20,
    },
    quickActionCard: {
        width: '48%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
});
