import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors, useWorkouts } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { Workout } from '../../types/backend.types';
import { NavigationBar, Card, Badge, Divider } from '../../components/ui';

export function WorkoutHistoryScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // Pagination state (future proofing, though useWorkouts might just return one page for now)
    const [refreshing, setRefreshing] = useState(false);

    const { data: workoutsResponse, isLoading, refetch } = useWorkouts({ limit: 20 });
    const workouts = workoutsResponse?.data as Workout[] || [];

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: Workout }) => {
        const date = new Date(item.startTime);
        const dateString = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

        // Calculate volume/duration properly
        let volume = 0;
        item.exercises?.forEach(ex => {
            ex.sets?.forEach(s => {
                if (s.weight && s.reps) volume += s.weight * s.reps;
            });
        });

        // Duration
        let duration = 'In Progress';
        if (item.endTime) {
            const start = new Date(item.startTime).getTime();
            const end = new Date(item.endTime).getTime();
            const diff = Math.floor((end - start) / 1000 / 60);
            duration = `${diff} min`;
        }

        return (
            <Card
                variant="elevated"
                onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderText}>
                        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</Text>
                        <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>{dateString} • {timeString}</Text>
                    </View>
                    {item.status === 'in_progress' && (
                        <Badge label="LIVE" variant="success" pulse />
                    )}
                </View>

                <Divider style={{ marginVertical: 12 }} />

                <View style={styles.cardStats}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="weight" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.statText, { color: colors.foreground }]}>
                            {volume > 0 ? `${(volume / 1000).toFixed(1)}k lbs` : '-'}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="timer-outline" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.statText, { color: colors.foreground }]}>{duration}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="dumbbell" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.statText, { color: colors.foreground }]}>{item.exercises?.length || 0} Exercises</Text>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar
                title="History"
                onBack={() => navigation.goBack()}
            />

            {isLoading ? (
                <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={workouts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="history" size={48} color={colors.mutedForeground} />
                            <Text style={[styles.emptyText, { color: colors.foreground }]}>No workouts yet</Text>
                            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                                Start a workout to see your history here.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    listContent: {
        padding: 16,
        gap: 12,
    },
    card: {
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardHeaderText: {
        flex: 1,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 12,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: fontFamilies.mono,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 14,
    },
});
