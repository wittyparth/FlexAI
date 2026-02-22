/**
 * StatCard Component
 *
 * Reusable card for displaying statistics with icon, label, value, and optional trend.
 * Upgrade: count-up animation for numeric values on mount.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    withTiming,
    useDerivedValue,
    useAnimatedProps,
    Easing,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { Card } from './Card';

const AnimatedText = Animated.createAnimatedComponent(Text);

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
    /** Optional press handler — triggers scale animation */
    onPress?: () => void;
}

/** Animated count-up for numeric stat values */
function CountUpValue({
    target,
    style,
}: {
    target: number;
    style: any;
}) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(target, {
            duration: 800,
            easing: Easing.out(Easing.cubic),
        });
    }, [target]);

    const animatedProps = useAnimatedProps(() => ({
        text: String(Math.round(progress.value)),
        defaultValue: String(Math.round(progress.value)),
    } as any));

    // Fallback: derive display text via useDerivedValue and bind via children
    const displayText = useDerivedValue(() => String(Math.round(progress.value)));

    // Workaround: use Animated.Text with animatedProps for 'text'
    // Since RN Text doesn't accept animatedProps 'text', use a simple
    // re-render approach via a wrapper component.
    return <_CountUpText progress={progress} target={target} style={style} />;
}

function _CountUpText({ progress, target, style }: { progress: any; target: number; style: any }) {
    // Frame-by-frame update using Reanimated worklet isn't directly possible
    // with RN Text. We use a derived shared value → JS state bridge pattern.
    const [display, setDisplay] = React.useState(0);

    useEffect(() => {
        const steps = 30;
        const stepDuration = 800 / steps;
        let current = 0;
        const interval = setInterval(() => {
            current += target / steps;
            if (current >= target) {
                setDisplay(typeof target === 'number' && Number.isInteger(target) ? target : Math.round(target));
                clearInterval(interval);
            } else {
                setDisplay(Math.round(current));
            }
        }, stepDuration);
        return () => clearInterval(interval);
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
    trend,
    trendText,
    gradient = false,
    style,
    size = 'md',
    onPress,
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
                {typeof value === 'number' ? (
                    <_CountUpText
                        progress={null}
                        target={value}
                        style={[
                            styles.value,
                            {
                                color: gradient ? '#FFFFFF' : colors.foreground,
                                fontSize: currentSize.valueSize,
                            },
                        ]}
                    />
                ) : (
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
                )}
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
                <View
                    style={styles.gradientCard}
                >
                    {renderContent()}
                </View>
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
