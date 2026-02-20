import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Image,
    ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useExerciseSearch, useFeaturedExercises } from '../../hooks/queries/useExerciseQueries';
import { useDebounce } from '../../hooks/useDebounce';

export function ExerciseLibraryScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const [activeFilters, setActiveFilters] = useState<any>({});
    
    useEffect(() => {
        if (route.params?.filters) {
            setActiveFilters(route.params.filters);
        }
    }, [route.params?.filters]);

    const { data: featuredData, isLoading: loadingFeatured } = useFeaturedExercises();
    
    const isSearchingOrFiltering = debouncedSearch.length > 0 || Object.keys(activeFilters).length > 0;
    const { data: searchData, isLoading: loadingSearch } = useExerciseSearch(
        {
            search: debouncedSearch,
            muscleGroup: activeFilters.muscleGroups?.length ? activeFilters.muscleGroups : undefined,
            difficulty: activeFilters.difficulty ? activeFilters.difficulty.toLowerCase() : undefined,
            equipment: activeFilters.equipment?.length ? activeFilters.equipment : undefined,
            exerciseType: activeFilters.movement?.length ? activeFilters.movement : undefined,
            limit: 50,
        },
        isSearchingOrFiltering
    );

    const exercises = isSearchingOrFiltering ? (searchData?.exercises || []) : [];
    const featured = featuredData || [];

    const renderExerciseItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
        >
            <View style={styles.cardMain}>
                {item.thumbnailUrl ? (
                    <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
                ) : (
                    <View style={[styles.iconContainer, { backgroundColor: `${colors.primary.main}15` }]}>
                        <MaterialCommunityIcons name="dumbbell" size={26} color={colors.primary.main} />
                    </View>
                )}
                <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: colors.foreground }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View style={styles.exerciseTags}>
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                            {item.muscleGroup} • {item.equipment || 'No Eq.'} {item.exerciseClass ? `• ${item.exerciseClass.charAt(0).toUpperCase() + item.exerciseClass.slice(1)}` : ''}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                            {item.difficulty && (
                                <View style={[styles.tagBadge, { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 }]}>
                                    <Text style={[styles.tagText, { color: colors.foreground }]}>
                                        {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                                    </Text>
                                </View>
                            )}
                            {item.exerciseType && (
                                <View style={[styles.tagBadge, { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 }]}>
                                    <Text style={[styles.tagText, { color: colors.foreground }]}>
                                        {item.exerciseType.charAt(0).toUpperCase() + item.exerciseType.slice(1)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
    );

    const renderFeaturedCard = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.featuredCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
        >
            {item.thumbnailUrl ? (
                <Image source={{ uri: item.thumbnailUrl }} style={styles.featuredImage} />
            ) : (
                <View style={[styles.featuredImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialCommunityIcons name="dumbbell" size={40} color={colors.mutedForeground} />
                </View>
            )}
            <View
                style={styles.featuredGradient}
            >
                <View style={styles.featuredContent}>
                    <View style={[styles.tagBadge, { backgroundColor: colors.primary.main, alignSelf: 'flex-start', marginBottom: 6 }]}>
                         <Text style={[styles.tagText, { color: '#FFF' }]}>{item.muscleGroup}</Text>
                    </View>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{item.name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header Area */}
            <View style={[styles.headerWrapper, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={26} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        Exercise Library
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ExerciseFilter')} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                        <Ionicons name="options-outline" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchSection}>
                    <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
                        <Ionicons name="search" size={20} color={colors.mutedForeground} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.foreground }]}
                            placeholder="Find any exercise..."
                            placeholderTextColor={colors.placeholder}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                                <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Active Filters Display */}
                {Object.keys(activeFilters).length > 0 && (
                    <View style={{ paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: colors.primary.main, fontWeight: '700' }}>
                            Filters Active
                        </Text>
                        <TouchableOpacity onPress={() => setActiveFilters({})} style={{ marginLeft: 12 }}>
                            <Text style={{ fontSize: 13, color: colors.mutedForeground, textDecorationLine: 'underline' }}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Content Area */}
            {isSearchingOrFiltering ? (
                // SEARCH RESULTS
                loadingSearch ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                    </View>
                ) : (
                    <FlatList
                        data={exercises}
                        renderItem={renderExerciseItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                                    <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No exercises found</Text>
                                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                    Try adjusting your search or filters
                                </Text>
                            </View>
                        }
                    />
                )
            ) : (
                // DEFAULT EXPLORE VIEW
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                            Featured Exercises
                        </Text>
                    </View>

                    {loadingFeatured ? (
                        <View style={[styles.featuredScroll, { height: 180, alignItems: 'center', justifyContent: 'center' }]}>
                             <ActivityIndicator size="small" color={colors.primary.main} />
                        </View>
                    ) : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={featured}
                            renderItem={renderFeaturedCard}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.featuredScroll}
                            snapToInterval={296} // card width + gap
                            decelerationRate="fast"
                        />
                    )}

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                            Browse by Category
                        </Text>
                    </View>
                    
                    <View style={styles.gridContainer}>
                        {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map(group => (
                            <TouchableOpacity 
                                key={group}
                                style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => setActiveFilters({ muscleGroups: [group] })}
                            >
                                <MaterialCommunityIcons 
                                    name={group === 'Chest' ? 'arm-flex' : group === 'Back' ? 'human' : group === 'Legs' ? 'run' : 'dumbbell'} 
                                    size={32} 
                                    color={colors.primary.main} 
                                    style={{ marginBottom: 8 }}
                                />
                                <Text style={[styles.categoryText, { color: colors.foreground }]}>{group}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerWrapper: { borderBottomWidth: 1, zIndex: 10, elevation: 5 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 12 },
    backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: '800' },
    searchSection: { paddingHorizontal: 16, marginBottom: 16 },
    searchBar: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 16, paddingHorizontal: 16, gap: 10 },
    searchInput: { flex: 1, fontSize: 16, fontFamily: fontFamilies.body },
    filtersContainer: { marginBottom: 12 },
    filterScrollOuter: { paddingHorizontal: 16, paddingBottom: 12 },
    filterGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    filterDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0', marginHorizontal: 12, opacity: 0.5 },
    filterLabel: { fontSize: 12, fontWeight: '700', marginRight: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    filterText: { fontSize: 13, fontWeight: '600' },
    listContent: { padding: 16, gap: 12 },
    exerciseCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
    cardMain: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    thumbnail: { width: 64, height: 64, borderRadius: 12, marginRight: 14 },
    iconContainer: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    exerciseInfo: { flex: 1, paddingRight: 8 },
    exerciseName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
    metaText: { fontSize: 13, fontWeight: '500' },
    exerciseTags: { flexDirection: 'column' },
    tagBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    tagText: { fontSize: 11, fontWeight: '700' },
    centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { paddingTop: 60, alignItems: 'center' },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, fontFamily: fontFamilies.display },
    emptyText: { fontSize: 15, textAlign: 'center' },
    sectionHeader: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
    sectionTitle: { fontSize: 22, fontWeight: '800' },
    featuredScroll: { paddingHorizontal: 16, gap: 16 },
    featuredCard: { width: 280, height: 180, borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
    featuredImage: { width: '100%', height: '100%', position: 'absolute' },
    featuredGradient: { flex: 1, justifyContent: 'flex-end', padding: 16 },
    featuredContent: { gap: 4 },
    featuredTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
    categoryCard: { width: '48%', padding: 20, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    categoryText: { fontSize: 15, fontWeight: '700' },
});
