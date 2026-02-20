/**
 * Welcome Screen
 * 
 * EXACT match to: welcome_&_value_proposition/code.html
 * 
 * Features:
 * - Floating graphic with decorative rings
 * - Heart icon in center
 * - Gradient text headline
 * - Primary gradient button with arrow icon
 * - Secondary ghost button for login
 * - Full dark mode support
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
    navigation: any;
}

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Ambient Glow Background */}
            <View style={[styles.ambientGlow, { backgroundColor: colors.primary.main }]} />

            {/* Main Content */}
            <View style={styles.content}>
                {/* Top Bar with subtle brand hint */}
                <View style={styles.topBar}>
                    <View style={[styles.brandHint, { backgroundColor: colors.primary.main + '33' }]} />
                </View>

                {/* Hero Graphic Section */}
                <View style={styles.graphicSection}>
                    <View style={styles.graphicContainer}>
                        {/* Outer Decorative Ring */}
                        <View style={[styles.outerRing, { borderColor: colors.primary.main + '1A' }]} />

                        {/* Inner Decorative Ring */}
                        <View style={[styles.innerRing, { borderColor: colors.primary.main + '33' }]} />

                        {/* Pulse Halo */}
                        <View style={[styles.pulseHalo, { backgroundColor: colors.primary.main + '0D' }]} />

                        {/* Core Graphic Card */}
                        <View style={[styles.coreGraphic, {
                            backgroundColor: colors.card,
                            borderColor: colors.primary.main + '0D',
                        }]}>
                            <MaterialCommunityIcons
                                name="heart-pulse"
                                size={48}
                                color={colors.primary.main}
                            />
                        </View>

                        {/* Floating decorative dots */}
                        <View style={[styles.dotLarge, { backgroundColor: colors.primary.main }]} />
                        <View style={[styles.dotSmall, { backgroundColor: isDark ? '#3B82F6' : '#93C5FD' }]} />
                    </View>
                </View>

                {/* Text & Actions Section */}
                <View
                    style={styles.bottomSection}
                >
                    {/* Headline */}
                    <Text style={[styles.headline, { color: colors.foreground }]}>
                        Elevate Your Body{'\n'}
                        <Text style={[styles.gradientText, { color: colors.primary.main }]}>& Mind</Text>
                    </Text>

                    {/* Body Text */}
                    <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
                        Premium workouts designed for longevity, clarity, and strength.
                    </Text>

                    {/* Primary Button */}
                    <Button
                        title="Get Started"
                        onPress={() => navigation.navigate('Register')}
                        variant="primary"
                        fullWidth
                        icon={<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
                    />

                    {/* Secondary Button */}
                    <Button
                        title="Log In"
                        onPress={() => navigation.navigate('Login')}
                        variant="ghost"
                        fullWidth
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    ambientGlow: {
        position: 'absolute',
        top: height * 0.25,
        left: '50%',
        marginLeft: -250,
        width: 500,
        height: 500,
        borderRadius: 250,
        opacity: 0.15,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing[6],
    },
    topBar: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing[4],
    },
    brandHint: {
        width: 32,
        height: 4,
        borderRadius: 2,
    },
    graphicSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    graphicContainer: {
        width: 288,
        height: 288,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerRing: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderRadius: 144,
    },
    innerRing: {
        position: 'absolute',
        width: '85%',
        height: '85%',
        borderWidth: 1,
        borderRadius: 120,
    },
    pulseHalo: {
        position: 'absolute',
        width: 128,
        height: 128,
        borderRadius: 64,
    },
    coreGraphic: {
        width: 96,
        height: 96,
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.lg,
    },
    dotLarge: {
        position: 'absolute',
        top: 40,
        right: 40,
        width: 12,
        height: 12,
        borderRadius: 6,
        opacity: 0.6,
    },
    dotSmall: {
        position: 'absolute',
        bottom: 48,
        left: 48,
        width: 8,
        height: 8,
        borderRadius: 4,
        opacity: 0.8,
    },
    bottomSection: {
        paddingTop: spacing[4],
        paddingBottom: spacing[10],
        alignItems: 'center',
    },
    headline: {
        fontFamily: fonts.display,
        fontSize: 40,
        lineHeight: 44,
        textAlign: 'center',
        marginBottom: spacing[4],
    },
    gradientText: {
        fontFamily: fonts.display,
    },
    bodyText: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
        lineHeight: 24,
        textAlign: 'center',
        maxWidth: 280,
        marginBottom: spacing[10],
    },
});
