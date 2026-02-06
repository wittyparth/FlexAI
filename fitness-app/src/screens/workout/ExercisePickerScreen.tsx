import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useExerciseSearch, useExerciseFilters } from '../../hooks/queries/useExerciseQueries';
import { useDebounce } from '../../hooks/useDebounce'; // Assuming useDebounce exists, if not I'll just use simple state

export function ExercisePickerScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { returnTo } = route.params || {};

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const debouncedSearch = useDebounce(searchQuery, 500);

    const { data: filtersData } = useExerciseFilters();
    const { data: exercisesData, isLoading, error } = useExerciseSearch({
        search: debouncedSearch,
        muscleGroup: activeFilter !== 'all' ? activeFilter : undefined,
        limit: 50,
    });

    const exercises = exercisesData?.exercises || [];
    const muscleGroups = [{ id: 'all', label: 'All', icon: 'grid-outline' }, ...(filtersData?.muscleGroups?.map((m: string) => ({
        id: m,
        label: m.charAt(0).toUpperCase() + m.slice(1),
        icon: 'body-outline'
    })) || [])];

    const handleSelectExercise = (item: any) => {
        if (returnTo) {
            navigation.navigate(returnTo, { selectedExercise: item });
        } else {
            navigation.navigate('ExerciseDetail', { exerciseId: item.id });
        }
    };

    const renderExerciseItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => handleSelectExercise(item)}
        >
            <View style={styles.cardMain}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary.main}15` }]}>
                    <MaterialCommunityIcons name="dumbbell" size={24} color={colors.primary.main} />
                </View>
                <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: colors.foreground }]}>{item.name}</Text>
                    <View style={styles.exerciseMeta}>
                        <View style={[styles.muscleBadge, { backgroundColor: `${colors.primary.main}15` }]}>
                            <Text style={[styles.muscleText, { color: colors.primary.main }]}>
                                {item.primaryMuscleGroups?.[0] || 'Body'}
                            </Text>
                        </View>
                        <View style={[styles.dot, { backgroundColor: colors.border }]} />
                        <Text style={[styles.equipmentText, { color: colors.mutedForeground }]}>
                            {item.equipment?.[0] || 'Bodyweight'}
                        </Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: `${colors.primary.main}15` }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => handleSelectExercise(item)}
            >
                <Ionicons name="add" size={24} color={colors.primary.main} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        Select Exercise
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Search */}
                <View style={styles.searchSection}>
                    <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.mutedForeground} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.foreground }]}
                            placeholder="Search exercises..."
                            placeholderTextColor={colors.placeholder}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filters */}
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={muscleGroups}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.filterScroll}
                    renderItem={({ item: filter }) => (
                        <TouchableOpacity
                            onPress={() => setActiveFilter(filter.id)}
                            style={[
                                styles.filterChip,
                                activeFilter === filter.id
                                    ? { backgroundColor: colors.primary.main }
                                    : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                            ]}
                        >
                            <Ionicons
                                name={filter.icon as any}
                                size={16}
                                color={activeFilter === filter.id ? '#FFFFFF' : colors.mutedForeground}
                            />
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter.id ? { color: '#FFFFFF' } : { color: colors.mutedForeground }
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* List */}
            {isLoading ? (
                <View style={[styles.loadingContainer, { marginTop: 100 }]}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={exercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                                <MaterialCommunityIcons name="dumbbell" size={40} color={colors.mutedForeground} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No exercises found</Text>
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                Try adjusting your search or filters
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Bottom Link */}
            <View style={[styles.bottomLink, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity style={styles.createLink} onPress={() => navigation.navigate('ExerciseCreator')}>
                    <Text style={[styles.linkPrefix, { color: colors.mutedForeground }]}>Can't find it? </Text>
                    <Text style={[styles.linkAction, { color: colors.primary.main }]}>Create Custom Exercise</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 4,
        zIndex: 10,
        borderBottomWidth: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    searchSection: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: fontFamilies.body,
    },
    filterScroll: {
        paddingHorizontal: 16,
        gap: 10,
        paddingBottom: 16,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    exerciseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    muscleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    muscleText: {
        fontSize: 11,
        fontWeight: '700',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 10,
    },
    equipmentText: {
        fontSize: 13,
        fontWeight: '500',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        paddingTop: 80,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        fontFamily: fontFamilies.display,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    bottomLink: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
    },
    createLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkPrefix: {
        fontSize: 14,
        fontWeight: '500',
    },
    linkAction: {
        fontSize: 14,
        fontWeight: '700',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});
