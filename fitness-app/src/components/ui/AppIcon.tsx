/**
 * AppIcon — Centralized Icon System
 *
 * Single source-of-truth for all icons in the app.
 * Primary family: MaterialCommunityIcons (best fitness-specific coverage).
 * Semantic aliases map domain concepts to icon names — swap the icon family
 * globally without touching any screen.
 *
 * Size tokens (px):
 *   xs: 16 | sm: 20 | md: 24 | lg: 28 | xl: 32 | 2xl: 40
 *
 * Usage:
 *   <AppIcon name="dumbbell" size="md" color={colors.primary.main} />
 *   <AppIcon name="streak" size="lg" />   // semantic alias → fire icon
 *   <AppIcon name="pr" badge />           // with notification dot
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// ── Size tokens ───────────────────────────────────────────────────────────────

export const ICON_SIZES = {
    xs:  16,
    sm:  20,
    md:  24,
    lg:  28,
    xl:  32,
    '2xl': 40,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// ── Semantic name → MaterialCommunityIcons name map ───────────────────────────
// Add new entries here; no other file needs to change.

type MCIName = keyof typeof MaterialCommunityIcons.glyphMap;
type IoniName = keyof typeof Ionicons.glyphMap;

interface SemanticIcon {
    library: 'mci' | 'ion';
    name: MCIName | IoniName;
}

const SEMANTIC_ICONS: Record<string, SemanticIcon> = {
    // ── Workout / Fitness ──
    dumbbell:          { library: 'mci', name: 'dumbbell' },
    barbell:           { library: 'mci', name: 'weight-lifter' },
    workout:           { library: 'mci', name: 'dumbbell' },
    exercise:          { library: 'mci', name: 'arm-flex' },
    run:               { library: 'mci', name: 'run-fast' },
    cardio:            { library: 'mci', name: 'run' },
    sets:              { library: 'mci', name: 'repeat' },
    reps:              { library: 'mci', name: 'counter' },
    rest:              { library: 'mci', name: 'timer-outline' },
    timer:             { library: 'mci', name: 'timer' },
    volume:            { library: 'mci', name: 'weight-kilogram' },
    calories:          { library: 'mci', name: 'fire' },
    streak:            { library: 'mci', name: 'fire' },
    pr:                { library: 'mci', name: 'trophy' },
    trophy:            { library: 'mci', name: 'trophy' },
    medal:             { library: 'mci', name: 'medal' },
    level:             { library: 'mci', name: 'lightning-bolt' },
    xp:                { library: 'mci', name: 'star-circle' },
    muscle:            { library: 'mci', name: 'arm-flex-outline' },
    body:              { library: 'mci', name: 'human' },
    heart:             { library: 'mci', name: 'heart-pulse' },
    heartRate:         { library: 'mci', name: 'heart-pulse' },
    // ── Navigation ──
    home:              { library: 'mci', name: 'home-variant' },
    explore:           { library: 'mci', name: 'compass' },
    social:            { library: 'mci', name: 'account-group' },
    profile:           { library: 'mci', name: 'account-circle' },
    coach:             { library: 'mci', name: 'robot-excited' },
    analytics:         { library: 'mci', name: 'chart-line' },
    settings:          { library: 'mci', name: 'cog' },
    notifications:     { library: 'mci', name: 'bell' },
    // ── Actions ──
    add:               { library: 'mci', name: 'plus-circle' },
    addSimple:         { library: 'mci', name: 'plus' },
    edit:              { library: 'mci', name: 'pencil' },
    delete:            { library: 'mci', name: 'trash-can' },
    share:             { library: 'mci', name: 'share-variant' },
    search:            { library: 'mci', name: 'magnify' },
    filter:            { library: 'mci', name: 'tune-variant' },
    sort:              { library: 'mci', name: 'sort' },
    close:             { library: 'mci', name: 'close' },
    check:             { library: 'mci', name: 'check-circle' },
    back:              { library: 'mci', name: 'arrow-left' },
    forward:           { library: 'mci', name: 'arrow-right' },
    chevronDown:       { library: 'mci', name: 'chevron-down' },
    chevronUp:         { library: 'mci', name: 'chevron-up' },
    more:              { library: 'mci', name: 'dots-horizontal' },
    refresh:           { library: 'mci', name: 'refresh' },
    copy:              { library: 'mci', name: 'content-copy' },
    // ── Status ──
    success:           { library: 'mci', name: 'check-circle' },
    error:             { library: 'mci', name: 'alert-circle' },
    warning:           { library: 'mci', name: 'alert' },
    info:              { library: 'mci', name: 'information' },
    lock:              { library: 'mci', name: 'lock' },
    unlock:            { library: 'mci', name: 'lock-open' },
    // ── Social ──
    like:              { library: 'mci', name: 'heart' },
    liked:             { library: 'mci', name: 'heart' },
    comment:           { library: 'mci', name: 'comment' },
    follow:            { library: 'mci', name: 'account-plus' },
    following:         { library: 'mci', name: 'account-check' },
    leaderboard:       { library: 'mci', name: 'podium' },
    challenge:         { library: 'mci', name: 'flag-checkered' },
    // ── AI ──
    ai:                { library: 'mci', name: 'robot-excited' },
    magic:             { library: 'mci', name: 'auto-fix' },
    // ── Misc ──
    camera:            { library: 'mci', name: 'camera' },
    image:             { library: 'mci', name: 'image' },
    calendar:          { library: 'mci', name: 'calendar' },
    clock:             { library: 'mci', name: 'clock-outline' },
    location:          { library: 'mci', name: 'map-marker' },
    link:              { library: 'mci', name: 'link-variant' },
    moon:              { library: 'mci', name: 'weather-night' },
    sun:               { library: 'mci', name: 'weather-sunny' },
    theme:             { library: 'mci', name: 'theme-light-dark' },
    eye:               { library: 'mci', name: 'eye' },
    eyeOff:            { library: 'mci', name: 'eye-off' },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface AppIconProps {
    /**
     * Either a semantic alias (from SEMANTIC_ICONS map)
     * or a raw MaterialCommunityIcons name prefixed with "mci:"
     * e.g., name="mci:arm-flex"
     */
    name: string;
    size?: IconSize | number;
    color?: string;
    /** Show a small red notification dot */
    badge?: boolean;
    style?: ViewStyle;
}

export function AppIcon({ name, size = 'md', color = '#0F172A', badge = false, style }: AppIconProps) {
    const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];

    const resolveIcon = (): SemanticIcon => {
        if (name.startsWith('mci:')) {
            return { library: 'mci', name: name.slice(4) as MCIName };
        }
        if (name.startsWith('ion:')) {
            return { library: 'ion', name: name.slice(4) as IoniName };
        }
        return SEMANTIC_ICONS[name] ?? { library: 'mci', name: 'help-circle' as MCIName };
    };

    const resolved = resolveIcon();

    const icon =
        resolved.library === 'mci' ? (
            <MaterialCommunityIcons name={resolved.name as MCIName} size={iconSize} color={color} />
        ) : (
            <Ionicons name={resolved.name as IoniName} size={iconSize} color={color} />
        );

    if (!badge) return <View style={style}>{icon}</View>;

    return (
        <View style={[styles.badgeWrapper, style]}>
            {icon}
            <View style={styles.badge} />
        </View>
    );
}

const styles = StyleSheet.create({
    badgeWrapper: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
});
