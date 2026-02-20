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
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useExerciseSearch } from '../../hooks/queries/useExerciseQueries';
import { useDebounce } from '../../hooks/useDebounce';

export function ExercisePickerScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { returnTo } = route.params || {};

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const [activeFilters, setActiveFilters] = useState<any>({});

    useEffect(() => {
        if (route.params?.filters) {
            setActiveFilters(route.params.filters);
        }
    }, [route.params?.filters]);

    const { data: exercisesData, isLoading } = useExerciseSearch({
        search: debouncedSearch,
        muscleGroup: activeFilters.muscleGroups?.length ? activeFilters.muscleGroups : undefined,
        difficulty: activeFilters.difficulty ? activeFilters.difficulty.toLowerCase() : undefined,
        equipment: activeFilters.equipment?.length ? activeFilters.equipment : undefined,
        exerciseType: activeFilters.movement?.length ? activeFilters.movement : undefined,
        limit: 50,
    });

    const exercises = exercisesData?.exercises || [];

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
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary.main }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => handleSelectExercise(item)}
            >
                <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
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
                        Select Exercise
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Search & Filter */}
                <View style={[styles.searchSection, { marginBottom: Object.keys(activeFilters).length > 0 ? 8 : 16 }]}>
                    <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
                        <Ionicons name="search" size={20} color={colors.mutedForeground} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.foreground }]}
                            placeholder="Search exercises..."
                            placeholderTextColor={colors.placeholder}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                                <Ionicons name="close-circle" size={20} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('ExerciseFilter', { returnScreen: 'ExercisePicker' })}
                            style={{ paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: colors.border }}
                        >
                            <Ionicons name="options-outline" size={22} color={colors.foreground} />
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Active Filters Display */}
                {Object.keys(activeFilters).length > 0 && (
                    <View style={{ paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: colors.primary.main, fontWeight: '700' }}>
                            Filters Active
                        </Text>
                        <TouchableOpacity onPress={() => setActiveFilters({})} style={{ marginLeft: 12 }}>
                            <Text style={{ fontSize: 13, color: colors.mutedForeground, textDecorationLine: 'underline' }}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={exercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
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
            )}

            {/* Bottom Floating Create Link */}
            <View
                style={[styles.bottomGradient, { paddingBottom: insets.bottom + 16 }]}
                pointerEvents="box-none"
            >
                <TouchableOpacity 
                    style={[styles.createCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: '#000' }]}
                    onPress={() => navigation.navigate('ExerciseCreator')}
                >
                    <View style={styles.createCardLeft}>
                        <View style={[styles.createIconBox, { backgroundColor: colors.primary.main + '20' }]}>
                            <Ionicons name="add" size={24} color={colors.primary.main} />
                        </View>
                        <View>
                            <Text style={[styles.createTitle, { color: colors.foreground }]}>Custom Exercise</Text>
                            <Text style={[styles.createSub, { color: colors.mutedForeground }]}>Can't find what you need?</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerWrapper: { borderBottomWidth: 1, zIndex: 10, elevation: 5 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 12 },
    backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: '800' },
    searchSection: { paddingHorizontal: 16 },
    searchBar: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 16, paddingHorizontal: 16, gap: 10 },
    searchInput: { flex: 1, fontSize: 16, fontFamily: fontFamilies.body },
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
    addButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity:0.1, shadowRadius:4, elevation: 2 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { paddingTop: 60, alignItems: 'center' },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, fontFamily: fontFamilies.display },
    emptyText: { fontSize: 15, textAlign: 'center' },
    bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 40 },
    createCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 5 },
    createCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    createIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    createTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    createSub: { fontSize: 13, fontWeight: '500' },
});
