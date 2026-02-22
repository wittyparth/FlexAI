/**
 * Avatar Component
 *
 * User avatar with image support, initials fallback, size variants,
 * and optional online status dot.
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps {
    /** Remote or local image URI */
    uri?: string;
    /** Fallback initials (e.g. "JD" for John Doe) */
    initials?: string;
    /** Size preset */
    size?: AvatarSize;
    /** Status indicator dot */
    status?: AvatarStatus;
    /** Circular shape (default true) */
    rounded?: boolean;
    /** Custom background for initials fallback */
    backgroundColor?: string;
    /** Custom initials text color */
    textColor?: string;
    /** Custom container style */
    style?: StyleProp<ViewStyle>;
}

const SIZE_MAP: Record<AvatarSize, { container: number; fontSize: number; statusDot: number; statusOffset: number }> = {
    xs:  { container: 24,  fontSize: 9,  statusDot: 6,  statusOffset: 0 },
    sm:  { container: 32,  fontSize: 12, statusDot: 8,  statusOffset: 0 },
    md:  { container: 40,  fontSize: 15, statusDot: 10, statusOffset: 1 },
    lg:  { container: 52,  fontSize: 18, statusDot: 12, statusOffset: 1 },
    xl:  { container: 64,  fontSize: 22, statusDot: 14, statusOffset: 2 },
    '2xl': { container: 80, fontSize: 28, statusDot: 16, statusOffset: 2 },
};

const STATUS_COLORS: Record<AvatarStatus, string> = {
    online:  '#22C55E',
    offline: '#94A3B8',
    busy:    '#EF4444',
    away:    '#F59E0B',
};

/** Derive 1–2 initials from a name string */
function getInitials(text?: string): string {
    if (!text) return '?';
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
    uri,
    initials,
    size = 'md',
    status,
    rounded = true,
    backgroundColor,
    textColor,
    style,
}: AvatarProps) {
    const colors = useColors();
    const sz = SIZE_MAP[size];
    const radius = rounded ? sz.container / 2 : sz.container * 0.25;

    const fallbackBg = backgroundColor ?? colors.primary.main;
    const fallbackText = textColor ?? '#FFFFFF';
    const displayInitials = getInitials(initials);

    return (
        <View style={[{ width: sz.container, height: sz.container }, style]}>
            {uri ? (
                <Image
                    source={{ uri }}
                    style={[
                        styles.image,
                        {
                            width: sz.container,
                            height: sz.container,
                            borderRadius: radius,
                        },
                    ]}
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={[
                        styles.initialsContainer,
                        {
                            width: sz.container,
                            height: sz.container,
                            borderRadius: radius,
                            backgroundColor: fallbackBg,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.initialsText,
                            { fontSize: sz.fontSize, color: fallbackText },
                        ]}
                    >
                        {displayInitials}
                    </Text>
                </View>
            )}

            {status && (
                <View
                    style={[
                        styles.statusDot,
                        {
                            width: sz.statusDot,
                            height: sz.statusDot,
                            borderRadius: sz.statusDot / 2,
                            backgroundColor: STATUS_COLORS[status],
                            bottom: sz.statusOffset,
                            right: sz.statusOffset,
                            borderColor: colors.background,
                            borderWidth: 2,
                        },
                    ]}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    initialsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialsText: {
        fontFamily: fontFamilies.body,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statusDot: {
        position: 'absolute',
    },
});
