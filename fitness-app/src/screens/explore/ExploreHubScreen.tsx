import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Animated,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');


import {
    EXPLORE_CATEGORIES,
    EXPLORE_FEATURED,
    EXPLORE_TRENDING,
    EXPLORE_COACH_PICKS,
} from '../../data/mockData';


export function ExploreHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Premium Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.card }]}>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    Explore
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                    Discover workouts, routines & more
                </Text>

                {/* Search Bar */}
                <TouchableOpacity
                    style={[styles.searchBar, { backgroundColor: colors.muted }]}
                    activeOpacity={0.8}
                >
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.foreground }]}
                        placeholder="Search exercises, routines..."
                        placeholderTextColor={colors.mutedForeground}
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.primary.main }]}>
                        <Ionicons name="options" size={18} color="#FFF" />
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Categories Grid */}
                <Animated.View style={[styles.categoriesGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    {EXPLORE_CATEGORIES.map((cat, index) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigation.navigate(cat.id === 'exercises' ? 'ExerciseLibrary' : cat.id === 'routines' ? 'PublicRoutines' : 'ChallengesList')}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}15` }]}>
                                <MaterialCommunityIcons name={cat.icon as any} size={26} color={cat.color} />
                            </View>
                            <Text style={[styles.categoryLabel, { color: colors.foreground }]}>{cat.label}</Text>
                            <Text style={[styles.categoryCount, { color: colors.mutedForeground }]}>{cat.count}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* Featured Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured</Text>
                        <TouchableOpacity>
                            <Text style={[styles.seeAll, { color: colors.primary.main }]}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredScroll}
                        decelerationRate="fast"
                        snapToInterval={width * 0.75 + 12}
                    >
                        {EXPLORE_FEATURED.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.featuredCard}
                                activeOpacity={0.95}
                            >
                                <LinearGradient
                                    colors={item.gradient as [string, string]}
                                    style={styles.featuredGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.featuredBadge}>
                                        <Text style={styles.featuredBadgeText}>{item.type}</Text>
                                    </View>
                                    <View style={styles.featuredContent}>
                                        <Text style={styles.featuredTitle}>{item.title}</Text>
                                        <View style={styles.featuredMeta}>
                                            <View style={styles.ratingContainer}>
                                                <Ionicons name="star" size={14} color="#FFC107" />
                                                <Text style={styles.ratingText}>{item.rating}</Text>
                                            </View>
                                            <View style={styles.usersContainer}>
                                                <Ionicons name="people" size={14} color="rgba(255,255,255,0.8)" />
                                                <Text style={styles.usersText}>{(item.users / 1000).toFixed(1)}k</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.featuredBtn}>
                                        <Text style={styles.featuredBtnText}>View</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                                    </TouchableOpacity>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Trending Exercises */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="trending-up" size={22} color={colors.success} />
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Now</Text>
                        </View>
                    </View>
                    {EXPLORE_TRENDING.map((ex, index) => (
                        <TouchableOpacity
                            key={ex.id}
                            style={[styles.trendingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: ex.id })}
                            activeOpacity={0.9}
                        >
                            <View style={styles.trendingRank}>
                                <Text style={[styles.rankNumber, { color: colors.primary.main }]}>#{index + 1}</Text>
                            </View>
                            <View style={[styles.trendingIcon, { backgroundColor: colors.muted }]}>
                                <MaterialCommunityIcons name={ex.icon as any} size={24} color={colors.primary.main} />
                            </View>
                            <View style={styles.trendingInfo}>
                                <Text style={[styles.trendingName, { color: colors.foreground }]}>{ex.name}</Text>
                                <Text style={[styles.trendingMuscle, { color: colors.mutedForeground }]}>{ex.muscle}</Text>
                            </View>
                            <View style={[styles.trendingBadge, { backgroundColor: `${colors.success}15` }]}>
                                <Ionicons name="trending-up" size={14} color={colors.success} />
                                <Text style={[styles.trendingPercent, { color: colors.success }]}>{ex.trending}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Coach's Picks */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="star-circle" size={22} color={colors.stats.pr} />
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Coach's Picks</Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.coachScroll}>
                        {EXPLORE_COACH_PICKS.map((pick) => (
                            <TouchableOpacity
                                key={pick.id}
                                style={[styles.coachCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.9}
                            >
                                <Image source={{ uri: pick.avatar }} style={styles.coachAvatar} />
                                <Text style={[styles.coachPickName, { color: colors.foreground }]} numberOfLines={2}>{pick.name}</Text>
                                <Text style={[styles.coachName, { color: colors.mutedForeground }]}>by {pick.coach}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* AI Generator FAB */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('AIGenerator')}
            >
                <LinearGradient
                    colors={colors.primary.gradient as [string, string]}
                    style={styles.fabGradient}
                >
                    <MaterialCommunityIcons name="robot" size={26} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 6,
        borderRadius: 16,
        height: 52,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 20,
        gap: 12,
    },
    categoryCard: {
        width: (width - 44) / 2,
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        alignItems: 'center',
    },
    categoryIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    categoryLabel: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: 14,
        fontFamily: fontFamilies.mono,
    },
    section: {
        marginTop: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    featuredScroll: {
        paddingLeft: 20,
        paddingRight: 8,
        gap: 12,
    },
    featuredCard: {
        width: width * 0.75,
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    featuredGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    featuredBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    featuredBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    featuredContent: {
        flex: 1,
        justifyContent: 'center',
    },
    featuredTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },
    featuredMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    usersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    usersText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    featuredBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        gap: 8,
    },
    featuredBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    trendingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
    },
    trendingRank: {
        width: 32,
        alignItems: 'center',
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: '800',
        fontFamily: fontFamilies.mono,
    },
    trendingIcon: {
        width: 50,
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    trendingInfo: {
        flex: 1,
    },
    trendingName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    trendingMuscle: {
        fontSize: 13,
    },
    trendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    trendingPercent: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    coachScroll: {
        paddingLeft: 20,
        paddingRight: 8,
        gap: 12,
    },
    coachCard: {
        width: 160,
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        alignItems: 'center',
    },
    coachAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 12,
    },
    coachPickName: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    coachName: {
        fontSize: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 22,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: themeColors.primary.main,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
    },
    fabGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
