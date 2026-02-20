import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { OnboardingStackParamList } from '../../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { useColors } from '../../hooks/useColors';
import { typography, fontFamilies } from '../../theme/typography';

type AppTourScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'AppTour'>;

interface Props {
    navigation: AppTourScreenNavigationProp;
}

export const AppTourScreen: React.FC<Props> = ({ navigation }) => {
    const { mode: theme } = useTheme();
    const colors = useColors();
    const isDark = theme === 'dark';

    const handleNext = () => {
        navigation.navigate('FinalSuccess');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Top Bar: Skip Button */}
            <View style={[styles.topBar, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
                <TouchableOpacity onPress={handleNext}>
                    <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Headline */}
                <Text style={[styles.title, {
                    color: colors.foreground,
                    fontFamily: fontFamilies.display
                }]}>
                    AI-Powered Coaching
                </Text>

                {/* 3D Visual Container */}
                <View style={[
                    styles.visualContainer,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        shadowColor: colors.primary.main, // Approximating heatmap-glow
                    }
                ]}>
                    {/* Inner Image */}
                    <Image
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfYUc201MJzpeQi6QkYfF17TrW3U3XhEmnKikwXI9xh5jxoLdlUpN_61spRKxqEW8Hr5rD8s29_h7pXD_gz9pxVU4HlM65JzBHhg4JwfkZrnUQPn--KOi5SL6c4n6Tu0kyioTMQyD3ubWyiNQVKlogMqMwskx3LwDc-7JvFyWWtXXrWsEhGE10yOTgKg3RsfsIBplwQLedjLsDrDxrvqcG6kFdBI7Z2DHtdvWsPpny2hPLQnU8Y2kPNyW24X33u2-lBxewyxFDg_A' }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                    />

                    {/* Overlay to tint/style */}
                    <View
                        style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
                    />

                    {/* Tech feel overlay */}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30, 58, 138, 0.1)' }]} />

                    {/* Floating Tag: Top Left */}
                    <View style={[
                        styles.floatingTag,
                        styles.tagTopLeft,
                        {
                            backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
                            borderColor: 'rgba(255,255,255,0.2)'
                        }
                    ]}>
                        <Ionicons name="flash" size={14} color={colors.primary.main} />
                        <Text style={[styles.tagText, { color: colors.primary.main }]}>LIVE ANALYSIS</Text>
                    </View>

                    {/* Floating Card: Bottom Right (Fatigue Level) */}
                    <View style={[
                        styles.floatingCard,
                        styles.cardBottomRight,
                        {
                            backgroundColor: isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)',
                            borderColor: isDark ? colors.slate[700] : colors.slate[100]
                        }
                    ]}>
                        <View style={styles.cardHeader}>
                            <View style={styles.indicatorDot} />
                            <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>Fatigue Level</Text>
                        </View>
                        <View style={[styles.barBg, { backgroundColor: isDark ? colors.slate[700] : colors.slate[200] }]}>
                            <View
                                style={{ width: '75%', height: '100%' }}
                            />
                        </View>
                    </View>
                </View>

                {/* Body Text */}
                <Text style={[styles.description, { color: colors.mutedForeground }]}>
                    Our advanced algorithm analyzes your form and fatigue in real-time, visualizing muscle activation to optimize every rep and prevent injury.
                </Text>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                {/* Pagination Dots (9/10 active) */}
                <View style={styles.pagination}>
                    {/* 8 Dots */}
                    {[...Array(8)].map((_, i) => (
                        <View key={`dot-${i}`} style={[styles.dot, { backgroundColor: isDark ? colors.slate[700] : colors.slate[300] }]} />
                    ))}
                    {/* Active Pill (9th) */}
                    <View style={[
                        styles.activePill,
                        {
                            backgroundColor: colors.primary.main,
                            shadowColor: colors.primary.main,
                            shadowOpacity: 0.4,
                            shadowRadius: 10,
                            elevation: 4
                        }
                    ]} />
                    {/* 10th Dot */}
                    <View style={[styles.dot, { backgroundColor: isDark ? colors.slate[700] : colors.slate[300] }]} />
                </View>

                {/* Next Button */}
                <TouchableOpacity onPress={handleNext} style={styles.buttonContainer} activeOpacity={0.9}>
                    <View
                        style={styles.continueButton}
                    >
                        <Text style={styles.continueButtonText}>Next</Text>
                        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 24, // Matches HTML spacing
        zIndex: 10,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        justifyContent: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '400', // Calistoga is typically 400
        lineHeight: 40,
        textAlign: 'center',
        marginBottom: 32,
        letterSpacing: 0.5,
    },
    visualContainer: {
        width: '100%',
        aspectRatio: 4 / 5,
        maxHeight: 420,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 32,
        position: 'relative',
        // Glow effect approximation
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 30, // large blur
        elevation: 10,
    },
    floatingTag: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999, // full
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    tagTopLeft: {
        top: 16,
        left: 16,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    floatingCard: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cardBottomRight: {
        // styles handled in inline for theme
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    indicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444', // red-500
    },
    cardTitle: {
        fontSize: 10,
        fontWeight: '600',
    },
    barBg: {
        width: 96, // w-24 approx
        height: 6, // h-1.5
        borderRadius: 999,
        overflow: 'hidden',
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        maxWidth: 320,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activePill: {
        width: 32,
        height: 8,
        borderRadius: 4,
    },
    buttonContainer: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        shadowColor: '#2547f4', // Shadow primary
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    continueButton: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 28,
        gap: 8,
    },
    continueButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
