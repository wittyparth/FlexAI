/**
 * Social Screen (Placeholder)
 * 
 * Will be fully implemented in Phase 3
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useColors } from '../../hooks';
import { fonts, fontSize, spacing } from '../../constants';

export function SocialScreen() {
    const colors = useColors();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>Social</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Coming in Phase 3
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing[6],
    },
    title: {
        fontFamily: fonts.display,
        fontSize: fontSize['3xl'],
        marginBottom: spacing[2],
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
    },
});
