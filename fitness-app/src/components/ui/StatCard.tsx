/**
 * StatCard Component
 * 
 * Reusable card for displaying statistics with icon, label, value, and optional trend.
 * Uses theme colors from useColors() hook for light/dark mode support.
 */

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { Card } from './Card';

type IconName = keyof typeof Ionicons.glyphMap;
type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface StatCardProps {
    /** Ionicons icon name */
    icon?: IconName;
    /** MaterialCommunityIcons icon name (use instead of icon) */
    materialIcon?: MaterialIconName;
    /** Icon background color (defaults to primary.main with opacity) */
    iconBackground?: string;
    /** Icon color (defaults to primary.main) */
    iconColor?: string;
    /** Label text (displayed above value, uppercase) */
    label: string;
    /** Main value to display */
    value: string | number;
    /** Unit suffix (e.g., 'kg', 'min') */
    unit?: string;
    /** Trend percentage (+5, -3, etc.) */
    trend?: number;
    /** Custom trend text instead of percentage */
    trendText?: string;
    /** Show gradient background */
    gradient?: boolean;
    /** Custom style */
    style?: StyleProp<ViewStyle>;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

export function StatCard({
    icon,
    materialIcon,
    iconBackground,
    iconColor,
    label,
    value,
    unit,
    trend,
    trendText,
    gradient = false,
    style,
    size = 'md',
}: StatCardProps) {
    const colors = useColors();

    const finalIconBg = iconBackground || (colors.primary.main + '20');
    const finalIconColor = iconColor || colors.primary.main;

    const sizeStyles = {
        sm: { iconSize: 16, iconContainer: 32, valueSize: 18, labelSize: 10 },
        md: { iconSize: 20, iconContainer: 40, valueSize: 24, labelSize: 11 },
        lg: { iconSize: 24, iconContainer: 48, valueSize: 28, labelSize: 12 },
    };

    const currentSize = sizeStyles[size];

    const renderContent = () => (
        <View style={styles.content}>
            {/* Icon */}
            {(icon || materialIcon) && (
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: finalIconBg,
                            width: currentSize.iconContainer,
                            height: currentSize.iconContainer,
                            borderRadius: currentSize.iconContainer / 2,
                        },
                    ]}
                >
                    {icon ? (
                        <Ionicons name={icon} size={currentSize.iconSize} color={finalIconColor} />
                    ) : materialIcon ? (
                        <MaterialCommunityIcons name={materialIcon} size={currentSize.iconSize} color={finalIconColor} />
                    ) : null}
                </View>
            )}

            {/* Label */}
            <Text
                style={[
                    styles.label,
                    { color: colors.mutedForeground, fontSize: currentSize.labelSize },
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>

            {/* Value + Unit */}
            <View style={styles.valueRow}>
                <Text
                    style={[
                        styles.value,
                        {
                            color: gradient ? '#FFFFFF' : colors.foreground,
                            fontSize: currentSize.valueSize,
                        },
                    ]}
                    numberOfLines={1}
                >
                    {value}
                </Text>
                {unit && (
                    <Text
                        style={[
                            styles.unit,
                            {
                                color: gradient ? 'rgba(255,255,255,0.7)' : colors.mutedForeground,
                                fontSize: currentSize.valueSize * 0.5,
                            },
                        ]}
                    >
                        {unit}
                    </Text>
                )}
            </View>

            {/* Trend */}
            {(trend !== undefined || trendText) && (
                <View style={styles.trendContainer}>
                    {trend !== undefined && (
                        <Ionicons
                            name={trend >= 0 ? 'trending-up' : 'trending-down'}
                            size={12}
                            color={trend >= 0 ? colors.success : '#ef4444'}
                        />
                    )}
                    <Text
                        style={[
                            styles.trendText,
                            {
                                color: trendText
                                    ? colors.mutedForeground
                                    : trend !== undefined && trend >= 0
                                        ? colors.success
                                        : '#ef4444',
                            },
                        ]}
                    >
                        {trendText || `${trend! >= 0 ? '+' : ''}${trend}%`}
                    </Text>
                </View>
            )}
        </View>
    );

    if (gradient) {
        return (
            <View style={[styles.container, style]}>
                <LinearGradient
                    colors={(colors.primary.gradient || [colors.primary.main, colors.primary.light]) as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    {renderContent()}
                </LinearGradient>
            </View>
        );
    }

    return (
        <Card style={[styles.cardStyle, style]}>
            {renderContent()}
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cardStyle: {
        padding: 16,
    },
    gradientCard: {
        padding: 16,
        borderRadius: 16,
        flex: 1,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    label: {
        fontFamily: fontFamilies.body,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    value: {
        fontFamily: fontFamilies.mono,
        fontWeight: '700',
    },
    unit: {
        fontFamily: fontFamilies.body,
        fontWeight: '500',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 11,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
    },
});
