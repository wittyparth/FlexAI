import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks';

// ============================================================
// SHARED SCREEN HEADER — used across all 5 main tab screens
// ============================================================

interface HeaderAction {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    badge?: boolean;
}

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    rightActions?: HeaderAction[];
    leftAction?: {
        icon: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
    };
    transparent?: boolean;
    bottomElement?: React.ReactNode;
}

export function ScreenHeader({
    title,
    subtitle,
    rightActions = [],
    leftAction,
    transparent = false,
    bottomElement,
}: ScreenHeaderProps) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 12,
                    backgroundColor: transparent ? 'transparent' : colors.card,
                    borderBottomColor: transparent ? 'transparent' : colors.border,
                    borderBottomWidth: transparent ? 0 : 1,
                },
            ]}
        >
            <View style={styles.row}>
                {/* Left Action */}
                {leftAction ? (
                    <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: colors.muted }]}
                        onPress={leftAction.onPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={leftAction.icon} size={22} color={colors.foreground} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconBtn} />
                )}

                {/* Title Area */}
                <View style={styles.titleArea}>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
                    )}
                    <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
                </View>

                {/* Right Actions */}
                <View style={styles.rightActions}>
                    {rightActions.map((action, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.iconBtn, { backgroundColor: colors.muted }]}
                            onPress={action.onPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name={action.icon} size={22} color={colors.foreground} />
                            {action.badge && (
                                <View style={[styles.badge, { borderColor: colors.card }]} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {bottomElement && <View style={styles.bottom}>{bottomElement}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleArea: {
        flex: 1,
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    rightActions: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 2,
    },
    bottom: {
        marginTop: 12,
    },
});
