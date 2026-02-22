/**
 * Toast Component
 *
 * Slide-in snackbar from the top. Triggered via ToastContext.
 * Supports: success | error | warning | info
 * Auto-dismisses after 3 s; has haptic on appearance.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastItemProps extends ToastConfig {
    onDismiss: (id: string) => void;
}

const TYPE_CONFIG: Record<ToastType, { icon: string; bg: string; border: string; text: string }> = {
    success: { icon: 'check-circle', bg: '#ECFDF5', border: '#10B981', text: '#065F46' },
    error:   { icon: 'alert-circle', bg: '#FEF2F2', border: '#EF4444', text: '#991B1B' },
    warning: { icon: 'alert',        bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
    info:    { icon: 'information',  bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
};

export function ToastItem({ id, message, type, duration = 3000, onDismiss }: ToastItemProps) {
    const insets = useSafeAreaInsets();
    const cfg = TYPE_CONFIG[type];

    const translateY = useSharedValue(-120);
    const opacity = useSharedValue(0);

    const dismiss = () => onDismiss(id);

    useEffect(() => {
        // Slide in
        translateY.value = withSpring(0, { damping: 20, stiffness: 250 });
        opacity.value = withTiming(1, { duration: 200 });

        // Haptic
        if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else if (type === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Auto-dismiss
        const timer = setTimeout(() => {
            translateY.value = withTiming(-120, { duration: 300 });
            opacity.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) runOnJS(dismiss)();
            });
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    top: insets.top + 12,
                    backgroundColor: cfg.bg,
                    borderLeftColor: cfg.border,
                },
                animStyle,
            ]}
        >
            <MaterialCommunityIcons name={cfg.icon as any} size={20} color={cfg.border} style={styles.icon} />
            <Text style={[styles.message, { color: cfg.text }]} numberOfLines={3}>
                {message}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        zIndex: 9999,
        // Shadow
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: { elevation: 8 },
        }),
    },
    icon: {
        marginRight: 10,
        flexShrink: 0,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        lineHeight: 20,
    },
});
