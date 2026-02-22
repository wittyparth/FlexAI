/**
 * NavigationBar Component
 *
 * Premium top navigation bar for stack screens.
 * Features:
 *  - Back button with spring-press animation
 *  - Optional large title that collapses as user scrolls
 *  - Transparent/blur variant (requires Animated.ScrollView scroll position)
 *  - Up to 3 right-side action buttons
 *  - Safe-area aware (uses useSafeAreaInsets)
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    StyleProp,
    Platform,
    Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import AnimatedRN, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    useAnimatedScrollHandler,
    SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamilies } from '../../theme/typography';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface NavBarAction {
    /** Ionicons icon */
    icon: IoniconName;
    /** Press handler */
    onPress: () => void;
    /** Accessibility label */
    label?: string;
    /** Icon color override */
    color?: string;
    /** Render custom element instead of icon */
    custom?: React.ReactNode;
}

export interface NavigationBarProps {
    /** Screen title (compact bar) */
    title?: string;
    /** Large title displayed below the bar (collapses on scroll) */
    largeTitle?: string;
    /** Show back button */
    showBack?: boolean;
    /** Back button press handler */
    onBack?: () => void;
    /** Up to 3 right-side actions */
    rightActions?: NavBarAction[];
    /** Blur background (frosted glass) — useful over content */
    transparent?: boolean;
    /** Scroll Y position (SharedValue) — used to collapse large title */
    scrollY?: SharedValue<number>;
    /** Custom container style */
    style?: StyleProp<ViewStyle>;
}

const LARGE_TITLE_HEIGHT = 52;
const COLLAPSE_THRESHOLD = 40;

export function NavigationBar({
    title,
    largeTitle,
    showBack = false,
    onBack,
    rightActions = [],
    transparent = false,
    scrollY,
    style,
}: NavigationBarProps) {
    const colors = useColors();
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const backScale = useSharedValue(1);

    // Collapse animation for large title
    const collapsedStyle = useAnimatedStyle(() => {
        if (!scrollY || !largeTitle) return { opacity: 1, height: LARGE_TITLE_HEIGHT };
        const opacity = interpolate(scrollY.value, [0, COLLAPSE_THRESHOLD], [1, 0], 'clamp');
        const height = interpolate(scrollY.value, [0, COLLAPSE_THRESHOLD], [LARGE_TITLE_HEIGHT, 0], 'clamp');
        return { opacity, height };
    });

    // Compact title fades in when large title collapses
    const compactTitleStyle = useAnimatedStyle(() => {
        if (!scrollY || !largeTitle) return { opacity: 1 };
        const opacity = interpolate(scrollY.value, [COLLAPSE_THRESHOLD * 0.6, COLLAPSE_THRESHOLD], [0, 1], 'clamp');
        return { opacity };
    });

    // Bar shadow appears when scrolled
    const barShadowStyle = useAnimatedStyle(() => {
        if (!scrollY) return {};
        const shadowOpacity = interpolate(scrollY.value, [0, 20], [0, 1], 'clamp');
        return { shadowOpacity: shadowOpacity * 0.08 };
    });

    const handleBackPressIn = () => {
        backScale.value = withSpring(0.88, { damping: 20, stiffness: 400 });
    };
    const handleBackPressOut = () => {
        backScale.value = withSpring(1, { damping: 20, stiffness: 350 });
    };
    const handleBackPress = () => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onBack?.();
    };

    const backButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: backScale.value }],
    }));

    const barHeight = 52;
    const topPad = insets.top;

    const barBg = transparent
        ? 'transparent'
        : colors.background;

    const BarWrapper = transparent
        ? ({ children }: { children: React.ReactNode }) => (
              <BlurView
                  intensity={80}
                  tint={isDark ? 'dark' : 'light'}
                  style={[styles.blurWrapper, { paddingTop: topPad }]}
              >
                  {children}
              </BlurView>
          )
        : ({ children }: { children: React.ReactNode }) => (
              <AnimatedRN.View
                  style={[
                      styles.solidWrapper,
                      { paddingTop: topPad, backgroundColor: barBg },
                      barShadowStyle,
                  ]}
              >
                  {children}
              </AnimatedRN.View>
          );

    return (
        <View style={[style]}>
            <BarWrapper>
                {/* Main bar row */}
                <View style={[styles.bar, { height: barHeight }]}>
                    {/* Left: back button */}
                    <View style={styles.leftSlot}>
                        {showBack && (
                            <Pressable
                                onPressIn={handleBackPressIn}
                                onPressOut={handleBackPressOut}
                                onPress={handleBackPress}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                accessibilityLabel="Go back"
                                accessibilityRole="button"
                            >
                                <AnimatedRN.View
                                    style={[
                                        styles.backBtn,
                                        styles.backCircle,
                                        backButtonStyle,
                                        { backgroundColor: (colors as any).surface2 ?? '#F4F7FA' },
                                    ]}
                                >
                                    <Ionicons
                                        name="chevron-back"
                                        size={20}
                                        color={colors.foreground}
                                    />
                                </AnimatedRN.View>
                            </Pressable>
                        )}
                    </View>

                    {/* Center: title (compact or always-visible) */}
                    <AnimatedRN.View style={[styles.centerSlot, largeTitle ? compactTitleStyle : {}]}>
                        {title && (
                            <Text
                                style={[styles.title, { color: colors.foreground }]}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                        )}
                    </AnimatedRN.View>

                    {/* Right: action buttons */}
                    <View style={styles.rightSlot}>
                        {rightActions.slice(0, 3).map((action, i) =>
                            action.custom ? (
                                <View key={i}>{action.custom}</View>
                            ) : (
                                <Pressable
                                    key={i}
                                    onPress={action.onPress}
                                    style={styles.actionBtn}
                                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                                    accessibilityLabel={action.label}
                                    accessibilityRole="button"
                                >
                                    <Ionicons
                                        name={action.icon}
                                        size={22}
                                        color={action.color ?? colors.foreground}
                                    />
                                </Pressable>
                            )
                        )}
                    </View>
                </View>

                {/* Large title row (collapses on scroll) */}
                {largeTitle && (
                    <AnimatedRN.View style={[styles.largeTitleRow, collapsedStyle]}>
                        <Text
                            style={[styles.largeTitle, { color: colors.foreground }]}
                            numberOfLines={1}
                        >
                            {largeTitle}
                        </Text>
                    </AnimatedRN.View>
                )}
            </BarWrapper>
        </View>
    );
}

/**
 * Hook to wire up scroll position from an Animated.ScrollView
 * into the NavigationBar's collapse behaviour.
 *
 * Usage:
 *   const { scrollY, onScroll } = useNavBarScroll();
 *   <NavigationBar scrollY={scrollY} />
 *   <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} />
 */
export function useNavBarScroll() {
    const scrollY = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    return { scrollY, onScroll };
}

const styles = StyleSheet.create({
    blurWrapper: {
        overflow: 'hidden',
    },
    solidWrapper: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 8,
        elevation: 2,
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    leftSlot: {
        width: 52,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    centerSlot: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightSlot: {
        width: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    backBtn: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    backCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontFamily: fontFamilies.body,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    largeTitleRow: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        overflow: 'hidden',
    },
    largeTitle: {
        fontSize: 30,
        fontFamily: fontFamilies.body,
        fontWeight: '700',
        letterSpacing: -0.5,
        lineHeight: 36,
    },
});
