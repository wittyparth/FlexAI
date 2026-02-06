import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    TextInput,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, useRoutines, usePublicRoutines } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import { Routine } from '../../types/backend.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const TABS = ['My Plans', 'Discover'];
const FILTERS = ['All', 'Strength', 'Hypertrophy', 'Cardio', 'Mobility'];

export function RoutineListScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('My Plans');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    // Queries
    const {
        data: myRoutinesData,
        isLoading: isLoadingMyRoutines,
        refetch: refetchMyRoutines,
        isRefetching: isRefetchingMyRoutines
    } = useRoutines({
        search: searchQuery,
        // If "My Plans", we might generally want all routines specific to user
    });

    const {
        data: publicRoutinesData,
        isLoading: isLoadingPublic,
        refetch: refetchPublic,
        isRefetching: isRefetchingPublic
    } = usePublicRoutines({
        search: searchQuery,
        goal: activeFilter !== 'All' ? activeFilter : undefined
    });

    const activeData = activeTab === 'My Plans' ? myRoutinesData?.data?.routines : publicRoutinesData?.data?.routines;
    const isLoading = activeTab === 'My Plans' ? isLoadingMyRoutines : isLoadingPublic;
    const isRefetching = activeTab === 'My Plans' ? isRefetchingMyRoutines : isRefetchingPublic;

    const onRefresh = () => {
        if (activeTab === 'My Plans') refetchMyRoutines();
        else refetchPublic();
    };

    const handleCreateRoutine = () => {
        navigation.navigate('RoutineEditor', { mode: 'create' });
    };

    const handleRoutinePress = (routineId: number) => {
        navigation.navigate('RoutineDetail', { routineId, isPublic: activeTab === 'Discover' });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top + 12,
                    backgroundColor: colors.card,
                    borderBottomColor: colors.border
                }
            ]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        Workouts
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.foreground }]}
                        placeholder="Search plans, exercises..."
                        placeholderTextColor={colors.mutedForeground}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tabs */}
                <View style={styles.tabsRow}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && { borderBottomColor: colors.primary.main }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === tab ? colors.primary.main : colors.mutedForeground }
                            ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Filters (Only for Discover or if supported for My Plans) */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScroll}
                >
                    {FILTERS.map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter
                                    ? { backgroundColor: colors.primary.main }
                                    : { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: activeFilter === filter ? '#FFFFFF' : colors.mutedForeground }
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content list */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary.main} />
                    }
                >
                    {activeData?.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="dumbbell" size={48} color={colors.mutedForeground} />
                            <Text style={[styles.emptyStateText, { color: colors.foreground }]}>No routines found</Text>
                            {activeTab === 'My Plans' && (
                                <Text style={[styles.emptyStateSub, { color: colors.mutedForeground }]}>
                                    Create a new plan to get started!
                                </Text>
                            )}
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {activeData?.map((routine: any) => ( // Using any for now if strict type mismatch, assumes API matches logic
                                <TouchableOpacity
                                    key={routine.id}
                                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    activeOpacity={0.8}
                                    onPress={() => handleRoutinePress(routine.id)}
                                >
                                    {/* Placeholder Gradient if no image (Backend might not have images yet) */}
                                    <View style={[styles.cardImageContainer, { backgroundColor: colors.muted }]}>
                                        <LinearGradient
                                            colors={themeColors.primary.gradient as [string, string]}
                                            style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        />
                                        <MaterialCommunityIcons name="notebook" size={32} color={colors.primary.main} style={{ opacity: 0.5 }} />

                                        {/* Overlay Info */}
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                                            style={styles.cardOverlay}
                                        />
                                        <View style={styles.cardOverlayContent}>
                                            <Text style={styles.cardDays}>{routine.daysPerWeek || '?'} Days / Week</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardBody}>
                                        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
                                            {routine.name}
                                        </Text>
                                        <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
                                            {routine.difficulty} • {routine.splitType || 'General'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}

            {/* FAB for Create */}
            {activeTab === 'My Plans' && (
                <TouchableOpacity
                    style={[styles.fab, { shadowColor: colors.primary.main }]}
                    onPress={handleCreateRoutine}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={colors.primary.gradient as [string, string]}
                        style={styles.fabGradient}
                    >
                        <Ionicons name="add" size={28} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
    },
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent', // Handled by tab border
    },
    tab: {
        marginRight: 24,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    filtersScroll: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyStateSub: {
        fontSize: 14,
        marginTop: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    card: {
        width: CARD_WIDTH,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardImageContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    cardOverlayContent: {
        position: 'absolute',
        bottom: 8,
        left: 12,
    },
    cardDays: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    cardBody: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        elevation: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabGradient: {
        flex: 1,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

