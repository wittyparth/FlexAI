/**
 * ListItem Component
 *
 * Standardised row component for settings screens, menu lists, and data lists.
 * Supports left icon/avatar, right accessory, subtitle, badge, and press state.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    StyleProp,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface ListItemProps {
    /** Primary label */
    title: string;
    /** Secondary text below title */
    subtitle?: string;
    /** Left Ionicons icon name */
    icon?: IoniconName;
    /** Tint color for the icon container background */
    iconTint?: string;
    /** Icon color (defaults to icon tint or primary) */
    iconColor?: string;
    /** Custom left element (overrides icon) */
    leftElement?: React.ReactNode;
    /** Custom right element (overrides default chevron) */
    rightElement?: React.ReactNode;
    /** Show a chevron arrow on the right */
    showChevron?: boolean;
    /** Red destructive styling (for delete/logout) */
    destructive?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Show a bottom separator line */
    showDivider?: boolean;
    /** Press handler */
    onPress?: () => void;
    /** Custom outer style */
    style?: StyleProp<ViewStyle>;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function ListItem({
    title,
    subtitle,
    icon,
    iconTint,
    iconColor,
    leftElement,
    rightElement,
    showChevron = true,
    destructive = false,
    disabled = false,
    showDivider = true,
    onPress,
    style,
}: ListItemProps) {
    const colors = useColors();
    const pressed = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: pressed.value === 1
            ? ((colors as any).surfaceHover ?? colors.background)
            : 'transparent',
    }));

    const handlePressIn = () => {
        pressed.value = withTiming(1, { duration: 60 });
    };
    const handlePressOut = () => {
        pressed.value = withTiming(0, { duration: 200 });
    };

    const titleColor = destructive ? colors.error : colors.foreground;
    const subtitleColor = colors.mutedForeground;
    const iconBg = iconTint ?? (destructive ? colors.error + '18' : colors.primary.main + '18');
    const finalIconColor = iconColor ?? (destructive ? colors.error : colors.primary.main);

    const leftContent = leftElement ?? (
        icon ? (
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={18} color={finalIconColor} />
            </View>
        ) : null
    );

    const rightContent = rightElement ?? (
        showChevron ? (
            <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.mutedForeground}
            />
        ) : null
    );

    const Wrapper: any = onPress ? Pressable : View;
    const wrapperProps = onPress
        ? {
              onPressIn: handlePressIn,
              onPressOut: handlePressOut,
              onPress,
              disabled,
              style: [styles.row, { opacity: disabled ? 0.45 : 1 }, style],
          }
        : { style: [styles.row, style] };

    return (
        <Wrapper {...(wrapperProps as any)}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} pointerEvents="none" />
            {/* Left */}
            {leftContent && (
                <View style={styles.leftSlot}>{leftContent}</View>
            )}

            {/* Center text */}
            <View style={styles.center}>
                <Text
                    style={[styles.title, { color: titleColor }]}
                    numberOfLines={1}
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text
                        style={[styles.subtitle, { color: subtitleColor }]}
                        numberOfLines={2}
                    >
                        {subtitle}
                    </Text>
                )}
            </View>

            {/* Right */}
            {rightContent && (
                <View style={styles.rightSlot}>{rightContent}</View>
            )}

            {/* Divider */}
            {showDivider && (
                <View
                    style={[
                        styles.divider,
                        {
                            backgroundColor:
                                (colors as any).divider ?? colors.border,
                            left: leftContent ? 60 : 16,
                        },
                    ]}
                />
            )}
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
        paddingHorizontal: 16,
        paddingVertical: 10,
        position: 'relative',
    },
    leftSlot: {
        marginRight: 14,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 15,
        fontFamily: fontFamilies.body,
        fontWeight: '500',
        letterSpacing: 0.1,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: fontFamilies.body,
        fontWeight: '400',
        lineHeight: 18,
    },
    rightSlot: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
    },
});
