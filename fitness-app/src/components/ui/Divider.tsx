/**
 * Divider Component
 *
 * Horizontal or vertical separator with an optional centered label.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

export interface DividerProps {
    /** Orientation */
    orientation?: 'horizontal' | 'vertical';
    /** Optional label shown in the center */
    label?: string;
    /** Thickness in pixels */
    thickness?: number;
    /** Custom color (defaults to colors.divider) */
    color?: string;
    /** Extra vertical margin for horizontal dividers */
    spacing?: number;
    /** Custom style for the outer container */
    style?: StyleProp<ViewStyle>;
}

export function Divider({
    orientation = 'horizontal',
    label,
    thickness = 1,
    color,
    spacing = 0,
    style,
}: DividerProps) {
    const colors = useColors();
    const lineColor = color ?? (colors as any).divider ?? colors.border;

    if (orientation === 'vertical') {
        return (
            <View
                style={[
                    {
                        width: thickness,
                        backgroundColor: lineColor,
                        alignSelf: 'stretch',
                    },
                    style,
                ]}
            />
        );
    }

    if (label) {
        return (
            <View style={[styles.row, { marginVertical: spacing }, style]}>
                <View style={[styles.line, { backgroundColor: lineColor, height: thickness }]} />
                <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
                <View style={[styles.line, { backgroundColor: lineColor, height: thickness }]} />
            </View>
        );
    }

    return (
        <View
            style={[
                {
                    height: thickness,
                    backgroundColor: lineColor,
                    marginVertical: spacing,
                },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    line: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontFamily: fontFamilies.body,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
});
