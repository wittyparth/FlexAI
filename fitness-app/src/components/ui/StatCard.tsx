/**
 * StatCard Component
 *
 * Reusable card for displaying statistics with icon, label, value, and optional trend.
 * Upgrade: count-up animation for numeric values on mount.
 */

import React, { useEffect } from 'react';
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
    /** @deprecated use unit */
    suffix?: string;
    /** @deprecated use iconColor/iconBackground */
    type?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted';
    /** Trend percentage (+5, -3, etc.) */
    trend?: number;
    /** Custom trend text instead of percentage */
    trendText?: string;
    /** Show gradient background */
    gradient?: boolean;
    /** Compact horizontal layout: icon+label on left, value on right */
    compact?: boolean;
    /** Custom style */
    style?: StyleProp<ViewStyle>;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Optional press handler — triggers scale animation */
    onPress?: () => void;
}

/** Clean count-up using requestAnimationFrame */
function CountUpValue({ target, style }: { target: number; style: any }) {
    const [display, setDisplay] = React.useState(0);
    const raf = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const duration = 800;
        const startTime = Date.now();
        const startVal = 0;

        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startVal + (target - startVal) * ease);
            setDisplay(current);
            if (progress < 1) {
                raf.current = setTimeout(tick, 16);
            }
        };
        tick();
        return () => { if (raf.current) clearTimeout(raf.current); };
    }, [target]);

    return <Text style={style}>{display}</Text>;
}

export function StatCard({
    icon,
    materialIcon,
    iconBackground,
    iconColor,
    label,
    value,
    unit,
    suffix,
    type,
    trend,
    trendText,
    gradient = false,
    compact = false,
    style,
    size = 'md',
    onPress,
}: StatCardProps) {
    const colors = useColors();

    const typeColorMap = {
        primary: colors.primary.main,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        muted: colors.mutedForeground,
    } as const;

    const typeColor = type ? typeColorMap[type] : undefined;
    const finalIconBg = iconBackground || ((typeColor || colors.primary.main) + '20');
    const finalIconColor = iconColor || typeColor || colors.primary.main;
    const finalUnit = unit ?? suffix;

    const sizeStyles = {
        sm: { iconSize: 16, iconContainer: 32, valueSize: 18, labelSize: 10 },
        md: { iconSize: 20, iconContainer: 40, valueSize: 24, labelSize: 11 },
        lg: { iconSize: 24, iconContainer: 48, valueSize: 28, labelSize: 12 },
    };
    const sz = sizeStyles[size];

    const renderContent = () => (
        <View style={compact ? styles.contentCompact : styles.content}>
            {/* Icon */}
            {(icon || materialIcon) && (
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: finalIconBg,
                            width: sz.iconContainer,
                            height: sz.iconContainer,
                            borderRadius: sz.iconContainer / 2,
                        },
                        compact && { marginRight: 12, marginBottom: 0 },
                    ]}
                >
                    {icon ? (
                        <Ionicons name={icon} size={sz.iconSize} color={finalIconColor} />
                    ) : materialIcon ? (
                        <MaterialCommunityIcons name={materialIcon} size={sz.iconSize} color={finalIconColor} />
                    ) : null}
                </View>
            )}

            {compact ? (
                // Compact: label+value side-by-side
                <View style={styles.compactRight}>
                    <Text style={[styles.label, { color: gradient ? 'rgba(255,255,255,0.7)' : colors.mutedForeground, fontSize: sz.labelSize }]} numberOfLines={1}>
                        {label}
                    </Text>
                    <View style={styles.valueRow}>
                        {typeof value === 'number' ? (
                            <CountUpValue target={value} style={[styles.value, { color: gradient ? '#FFFFFF' : colors.foreground, fontSize: sz.valueSize }]} />
                        ) : (
                            <Text style={[styles.value, { color: gradient ? '#FFFFFF' : colors.foreground, fontSize: sz.valueSize }]} numberOfLines={1}>{value}</Text>
                        )}
                        {finalUnit && <Text style={[styles.unit, { color: gradient ? 'rgba(255,255,255,0.6)' : colors.mutedForeground, fontSize: sz.valueSize * 0.5 }]}>{finalUnit}</Text>}
                    </View>
                </View>
            ) : (
                // Standard centered layout
                <>
                    <Text style={[styles.label, { color: gradient ? 'rgba(255,255,255,0.7)' : colors.mutedForeground, fontSize: sz.labelSize }]} numberOfLines={1}>
                        {label}
                    </Text>

                    <View style={styles.valueRow}>
                        {typeof value === 'number' ? (
                            <CountUpValue target={value} style={[styles.value, { color: gradient ? '#FFFFFF' : colors.foreground, fontSize: sz.valueSize }]} />
                        ) : (
                            <Text style={[styles.value, { color: gradient ? '#FFFFFF' : colors.foreground, fontSize: sz.valueSize }]} numberOfLines={1}>{value}</Text>
                        )}
                        {finalUnit && <Text style={[styles.unit, { color: gradient ? 'rgba(255,255,255,0.7)' : colors.mutedForeground, fontSize: sz.valueSize * 0.5 }]}>{finalUnit}</Text>}
                    </View>

                    {(trend !== undefined || trendText) && (
                        <View style={styles.trendContainer}>
                            {trend !== undefined && (
                                <Ionicons name={trend >= 0 ? 'trending-up' : 'trending-down'} size={12}
                                    color={trend >= 0 ? colors.success : colors.error} />
                            )}
                            <Text style={[styles.trendText, {
                                color: trendText ? colors.mutedForeground
                                    : trend !== undefined && trend >= 0 ? colors.success : colors.error,
                            }]}>
                                {trendText || `${trend! >= 0 ? '+' : ''}${trend}%`}
                            </Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );

    if (gradient) {
        return (
            <View style={[styles.container, style]}>
                <LinearGradient
                    colors={[colors.primary.main, colors.gradients?.primary?.[1] ?? '#7C3AED']}
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
        <Card style={[styles.cardStyle, style]} onPress={onPress}>
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
        borderRadius: 20,
        flex: 1,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    contentCompact: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactRight: {
        flex: 1,
        gap: 2,
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
        gap: 3,
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
        gap: 3,
        marginTop: 2,
    },
    trendText: {
        fontSize: 11,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
    },
});
