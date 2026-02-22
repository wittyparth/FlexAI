/**
 * Chip Component
 *
 * Filter chip / tag with selected state, optional close button, and icon support.
 * Commonly used for category filters, tags, and multi-select choices.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface ChipProps {
    /** Chip label text */
    label: string;
    /** Whether the chip is selected */
    selected?: boolean;
    /** Left icon */
    icon?: IoniconName;
    /** Show a close (×) button on the right */
    closable?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Size variant */
    size?: 'sm' | 'md';
    /** Press handler (toggles selection) */
    onPress?: () => void;
    /** Close button press handler */
    onClose?: () => void;
    /** Custom style */
    style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Chip({
    label,
    selected = false,
    icon,
    closable = false,
    disabled = false,
    size = 'md',
    onPress,
    onClose,
    style,
}: ChipProps) {
    const colors = useColors();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.93, { damping: 20, stiffness: 400 });
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 350 });
    };

    const isSm = size === 'sm';
    const paddingH = isSm ? 10 : 14;
    const paddingV = isSm ? 4 : 7;
    const fontSize = isSm ? 12 : 13;
    const iconSize = isSm ? 12 : 14;
    const radius = isSm ? 8 : 10;

    const selectedBg   = colors.primary.main + '18';
    const selectedBorder = colors.primary.main;
    const selectedText = colors.primary.main;
    const defaultBg   = (colors as any).surface2 ?? colors.background;
    const defaultBorder = (colors as any).cardBorder ?? colors.border;
    const defaultText = colors.mutedForeground;

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={disabled}
            style={[
                animatedStyle,
                styles.base,
                {
                    paddingHorizontal: paddingH,
                    paddingVertical: paddingV,
                    borderRadius: radius,
                    backgroundColor: selected ? selectedBg : defaultBg,
                    borderColor: selected ? selectedBorder : defaultBorder,
                    opacity: disabled ? 0.45 : 1,
                    gap: 5,
                },
                style,
            ]}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={iconSize}
                    color={selected ? selectedText : defaultText}
                />
            )}
            <Text
                style={[
                    styles.label,
                    {
                        fontSize,
                        color: selected ? selectedText : defaultText,
                        fontWeight: selected ? '600' : '500',
                    },
                ]}
            >
                {label}
            </Text>
            {closable && (
                <Pressable
                    onPress={(e) => {
                        e.stopPropagation?.();
                        onClose?.();
                    }}
                    hitSlop={6}
                    accessibilityLabel={`Remove ${label}`}
                >
                    <Ionicons
                        name="close-circle"
                        size={iconSize}
                        color={selected ? selectedText : colors.mutedForeground}
                    />
                </Pressable>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 1.5,
    },
    label: {
        fontFamily: fontFamilies.body,
        letterSpacing: 0.2,
    },
});
