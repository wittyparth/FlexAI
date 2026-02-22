/**
 * EmptyState Component
 *
 * Production-quality empty-state UI with:
 *  - Minimal SVG illustration (no external assets needed)
 *  - Headline + subtext
 *  - Optional CTA button
 *  - Presets for common app screens
 *
 * Usage:
 *   <EmptyState preset="workout" onAction={() => nav.navigate('WorkoutHub')} />
 *   <EmptyState
 *     title="No posts yet"
 *     subtitle="Follow athletes to see their workouts here."
 *     actionLabel="Find people"
 *     onAction={handleDiscover}
 *   />
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Rect, Path, Line, Ellipse, G } from 'react-native-svg';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { Button } from '../ui/Button';

// ── SVG Illustrations ────────────────────────────────────────────────────────

function WorkoutIllustration({ color, accent }: { color: string; accent: string }) {
    return (
        <Svg width={120} height={120} viewBox="0 0 120 120">
            {/* Dumbbell bar */}
            <Rect x="20" y="55" width="80" height="10" rx="5" fill={color} />
            {/* Left weight */}
            <Rect x="10" y="44" width="16" height="32" rx="6" fill={accent} />
            {/* Right weight */}
            <Rect x="94" y="44" width="16" height="32" rx="6" fill={accent} />
            {/* Left collar */}
            <Rect x="26" y="50" width="8" height="20" rx="3" fill={color} opacity={0.5} />
            {/* Right collar */}
            <Rect x="86" y="50" width="8" height="20" rx="3" fill={color} opacity={0.5} />
        </Svg>
    );
}

function HistoryIllustration({ color, accent }: { color: string; accent: string }) {
    return (
        <Svg width={120} height={120} viewBox="0 0 120 120">
            {/* Calendar base */}
            <Rect x="20" y="28" width="80" height="72" rx="10" fill={color} opacity={0.15} />
            <Rect x="20" y="28" width="80" height="72" rx="10" stroke={color} strokeWidth="2" fill="none" />
            {/* Header */}
            <Rect x="20" y="28" width="80" height="24" rx="10" fill={accent} />
            <Rect x="20" y="38" width="80" height="14" fill={accent} />
            {/* Calendar dots */}
            {[0, 1, 2, 3, 4, 5, 6].map((col) =>
                [0, 1, 2, 3].map((row) => (
                    <Circle
                        key={`${col}-${row}`}
                        cx={32 + col * 10}
                        cy={68 + row * 10}
                        r="3"
                        fill={accent}
                        opacity={col + row < 5 ? 0.8 : 0.2}
                    />
                ))
            )}
        </Svg>
    );
}

function RoutinesIllustration({ color, accent }: { color: string; accent: string }) {
    return (
        <Svg width={120} height={120} viewBox="0 0 120 120">
            {/* Clipboard */}
            <Rect x="28" y="22" width="64" height="76" rx="8" fill={color} opacity={0.12} />
            <Rect x="28" y="22" width="64" height="76" rx="8" stroke={color} strokeWidth="2" fill="none" />
            {/* Clip */}
            <Rect x="46" y="16" width="28" height="16" rx="8" fill={accent} />
            {/* Lines */}
            <Line x1="40" y1="50" x2="80" y2="50" stroke={accent} strokeWidth="3" strokeLinecap="round" />
            <Line x1="40" y1="64" x2="72" y2="64" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity={0.5} />
            <Line x1="40" y1="76" x2="68" y2="76" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity={0.3} />
        </Svg>
    );
}

function SocialIllustration({ color, accent }: { color: string; accent: string }) {
    return (
        <Svg width={120} height={120} viewBox="0 0 120 120">
            {/* Left avatar */}
            <Circle cx="38" cy="50" r="18" fill={color} opacity={0.2} />
            <Circle cx="38" cy="50" r="18" stroke={color} strokeWidth="2" fill="none" />
            {/* Right avatar */}
            <Circle cx="82" cy="50" r="18" fill={accent} opacity={0.25} />
            <Circle cx="82" cy="50" r="18" stroke={accent} strokeWidth="2" fill="none" />
            {/* Connect line */}
            <Line x1="56" y1="50" x2="64" y2="50" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
            {/* Names */}
            <Rect x="26" y="76" width="24" height="6" rx="3" fill={color} opacity={0.4} />
            <Rect x="70" y="76" width="24" height="6" rx="3" fill={accent} opacity={0.5} />
        </Svg>
    );
}

function GenericIllustration({ color, accent }: { color: string; accent: string }) {
    return (
        <Svg width={120} height={120} viewBox="0 0 120 120">
            {/* Box */}
            <Rect x="30" y="40" width="60" height="50" rx="8" fill={color} opacity={0.12} />
            <Rect x="30" y="40" width="60" height="50" rx="8" stroke={color} strokeWidth="2" fill="none" />
            {/* Lid */}
            <Rect x="22" y="32" width="76" height="18" rx="6" fill={accent} opacity={0.3} />
            <Rect x="22" y="32" width="76" height="18" rx="6" stroke={accent} strokeWidth="2" fill="none" />
            {/* Search circle */}
            <Circle cx="60" cy="65" r="12" stroke={color} strokeWidth="2" fill="none" opacity={0.4} />
            <Line x1="68" y1="73" x2="76" y2="81" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity={0.4} />
        </Svg>
    );
}

// ── Presets ──────────────────────────────────────────────────────────────────

type EmptyPreset = 'workout' | 'history' | 'routines' | 'social' | 'generic';

const PRESETS: Record<EmptyPreset, { title: string; subtitle: string; actionLabel: string }> = {
    workout: {
        title: 'No workouts yet',
        subtitle: 'Start your first workout and begin your fitness journey.',
        actionLabel: 'Start Workout',
    },
    history: {
        title: 'No history yet',
        subtitle: 'Complete a workout to see it logged here.',
        actionLabel: 'Log a Workout',
    },
    routines: {
        title: 'No routines yet',
        subtitle: "Build your first routine or let AI generate one for you.",
        actionLabel: 'Create Routine',
    },
    social: {
        title: 'Nothing here yet',
        subtitle: 'Follow other athletes to see their activity.',
        actionLabel: 'Discover People',
    },
    generic: {
        title: 'Nothing to show',
        subtitle: "We couldn't find anything here. Try again later.",
        actionLabel: 'Retry',
    },
};

// ── Component ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
    /** Use a built-in preset for common screens */
    preset?: EmptyPreset;
    /** Override title */
    title?: string;
    /** Override subtitle */
    subtitle?: string;
    /** CTA button label */
    actionLabel?: string;
    /** CTA handler — if omitted, no button is shown */
    onAction?: () => void;
    style?: ViewStyle;
}

export function EmptyState({
    preset = 'generic',
    title,
    subtitle,
    actionLabel,
    onAction,
    style,
}: EmptyStateProps) {
    const colors = useColors();
    const cfg = PRESETS[preset];

    const finalTitle = title ?? cfg.title;
    const finalSubtitle = subtitle ?? cfg.subtitle;
    const finalActionLabel = actionLabel ?? cfg.actionLabel;

    const IllustrationMap: Record<EmptyPreset, React.FC<{ color: string; accent: string }>> = {
        workout:  WorkoutIllustration,
        history:  HistoryIllustration,
        routines: RoutinesIllustration,
        social:   SocialIllustration,
        generic:  GenericIllustration,
    };

    const Illustration = IllustrationMap[preset];

    return (
        <View style={[styles.container, style]}>
            <View style={styles.illustration}>
                <Illustration color={colors.mutedForeground} accent={colors.primary.main} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>{finalTitle}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{finalSubtitle}</Text>
            {onAction && (
                <Button
                    title={finalActionLabel}
                    onPress={onAction}
                    variant="primary"
                    size="default"
                    style={styles.button}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 32,
    },
    illustration: {
        marginBottom: 24,
        opacity: 0.9,
    },
    title: {
        fontFamily: fontFamilies.heading,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: fontFamilies.body,
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 28,
    },
    button: {
        minWidth: 160,
    },
});
