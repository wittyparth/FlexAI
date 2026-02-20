import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { usePublicRoutines, useRoutines } from '../../hooks/queries/useRoutineQueries';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const TABS = ['My Plans', 'Discover'];
const FILTERS = ['All', 'Strength', 'Hypertrophy', 'Cardio', 'Mobility'];

const GOAL_FILTER_MAP: Record<string, string | undefined> = {
    All: undefined,
    Strength: 'strength',
    Hypertrophy: 'muscle_gain',
    Cardio: 'endurance',
    Mobility: 'general',
};

const DIFFICULTY_COLOR: Record<string, string> = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
};

const toTitleCase = (value?: string | null) =>
    value ? `${value.charAt(0).toUpperCase()}${value.slice(1).replace('_', ' ')}` : 'General';

const daysPerWeekFromRoutine = (routine: any) => {
    if (routine?.daysPerWeek) return routine.daysPerWeek;
    if (routine?.schedule && typeof routine.schedule === 'object') {
        return Object.values(routine.schedule).filter(Boolean).length || 1;
    }
    return 1;
};

export function RoutineListScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { mode, onSelect, initialTab } = route.params || {};

    const [activeTab, setActiveTab] = useState(initialTab || 'My Plans');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const normalizedSearch = searchQuery.trim() || undefined;
    const selectedGoal = GOAL_FILTER_MAP[activeFilter];

    const {
        data: myPlansResponse,
        isLoading: isMyPlansLoading,
        isError: isMyPlansError,
    } = useRoutines({
        page: 1,
        limit: 50,
        search: normalizedSearch,
        isTemplate: false,
    });

    const {
        data: discoverResponse,
        isLoading: isDiscoverLoading,
        isError: isDiscoverError,
    } = usePublicRoutines({
        page: 1,
        limit: 50,
        search: normalizedSearch,
        goal: selectedGoal,
    });

    const activeData = useMemo(() => {
        if (activeTab === 'My Plans') {
            return myPlansResponse?.data?.routines || [];
        }
        return discoverResponse?.data?.routines || [];
    }, [activeTab, myPlansResponse, discoverResponse]);

    const isLoading = activeTab === 'My Plans' ? isMyPlansLoading : isDiscoverLoading;
    const hasError = activeTab === 'My Plans' ? isMyPlansError : isDiscoverError;

    const handleCreateRoutine = () => {
        navigation.navigate('RoutineEditor', { mode: 'create' });
    };

    const handleRoutinePress = (routineId: number) => {
        if (mode === 'select' && onSelect) {
            navigation.navigate('RoutineDetail', { routineId, mode: 'select', onSelect });
        } else {
            navigation.navigate('RoutineDetail', { routineId });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top + 12,
                    backgroundColor: colors.card,
                    borderBottomColor: colors.border,
                },
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

                <View style={[styles.searchContainer, { backgroundColor: colors.background }]}> 
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.foreground }]}
                        placeholder="Search plans..."
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

                <View style={styles.tabsRow}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && { borderBottomColor: colors.primary.main },
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    { color: activeTab === tab ? colors.primary.main : colors.mutedForeground },
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

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
                                    : { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border },
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: activeFilter === filter ? '#FFFFFF' : colors.mutedForeground },
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 160 }]}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                    </View>
                ) : hasError ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={44} color={colors.mutedForeground} />
                        <Text style={[styles.emptyStateText, { color: colors.foreground }]}>Unable to load routines</Text>
                    </View>
                ) : activeData.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="dumbbell" size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyStateText, { color: colors.foreground }]}>No routines found</Text>
                        {activeTab === 'My Plans' && (
                            <Text style={[styles.emptyStateSub, { color: colors.mutedForeground }]}>Create a new plan to get started.</Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {activeData.map((routine: any) => {
                            const difficultyKey = String(routine.difficulty || 'beginner').toLowerCase();
                            const routineColor = DIFFICULTY_COLOR[difficultyKey] || colors.primary.main;

                            return (
                                <TouchableOpacity
                                    key={routine.id}
                                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    activeOpacity={0.8}
                                    onPress={() => handleRoutinePress(Number(routine.id))}
                                >
                                    <View style={[styles.cardImageContainer, { backgroundColor: `${routineColor}22` }]}> 
                                        <View style={[StyleSheet.absoluteFill, { backgroundColor: routineColor, opacity: 0.12 }]} />
                                        <MaterialCommunityIcons name="notebook" size={32} color={routineColor} style={{ opacity: 0.7 }} />
                                        <View style={styles.cardOverlay} />
                                        <View style={styles.cardOverlayContent}>
                                            <Text style={styles.cardDays}>{daysPerWeekFromRoutine(routine)} Days / Week</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardBody}>
                                        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
                                            {routine.name}
                                        </Text>
                                        <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
                                            {toTitleCase(routine.difficulty)} - {toTitleCase(routine.splitType)}
                                        </Text>
                                        <Text style={[styles.cardSubtitle, { color: routineColor, marginTop: 2 }]}> 
                                            {(routine.exercises || []).length} exercises
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {activeTab === 'My Plans' && (
                <TouchableOpacity
                    style={[styles.fab, { shadowColor: colors.primary.main }]}
                    onPress={handleCreateRoutine}
                    activeOpacity={0.9}
                >
                    <View style={styles.fabGradient}>
                        <Ionicons name="add" size={28} color="#FFFFFF" />
                    </View>
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
        borderBottomColor: 'transparent',
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
        paddingTop: 80,
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
        textAlign: 'center',
    },
    emptyStateSub: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
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
