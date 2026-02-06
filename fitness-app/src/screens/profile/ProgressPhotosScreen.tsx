import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useProgressPhotos } from '../../hooks/queries/useBodyQueries';
import { ProgressPhoto } from '../../api/body.api';


const { width } = Dimensions.get('window');
const SPACING = 16;
// 2 Columns for larger images
const ITEM_WIDTH = (width - SPACING * 3) / 2;

export function ProgressPhotosScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');
    const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

    // Fetch Real Data
    const { data: photos = [], isLoading, isError, refetch } = useProgressPhotos();

    // Group photos by Month
    const photosByMonth = React.useMemo(() => {
        const groups: { [key: string]: ProgressPhoto[] } = {};

        photos.forEach(photo => {
            // Check if photo.date is valid before formatting
            const dateObj = new Date(photo.date);
            // Fallback for invalid dates
            if (isNaN(dateObj.getTime())) return;

            const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(photo);
        });

        return Object.entries(groups).map(([title, data]) => ({
            title,
            data
        }));
    }, [photos]);

    const renderPhotoItem = ({ item }: { item: ProgressPhoto }) => (
        <TouchableOpacity
            style={[styles.photoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setSelectedPhoto(item)}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.url }} style={styles.photoImage} resizeMode="cover" />
            <View style={styles.photoDateBadge}>
                <Text style={styles.photoDateText}>
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
            </View>
            <View style={[styles.photoTypeBadge, { backgroundColor: colors.primary.main }]}>
                <Text style={styles.photoTypeText}>{item.type}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderSection = ({ item }: { item: { title: string, data: ProgressPhoto[] } }) => (
        <View style={styles.monthSection}>
            <Text style={[styles.monthTitle, { color: colors.foreground }]}>{item.title}</Text>
            <View style={styles.photoGrid}>
                {item.data.map((photo) => (
                    <View key={photo.id} style={{ marginBottom: SPACING }}>
                        {renderPhotoItem({ item: photo })}
                    </View>
                ))}
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.error, marginBottom: 16 }}>Failed to load photos</Text>
                <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary.main }]}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header - Standardized */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Progress Photos</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {photos.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                        <Ionicons name="camera" size={48} color={colors.primary.main} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Photos Yet</Text>
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                        Take your first progress photo to start tracking your transformation!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={photosByMonth}
                    renderItem={renderSection}
                    keyExtractor={(item) => item.title}
                    contentContainerStyle={{ padding: SPACING, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
                <LinearGradient
                    colors={['#10B981', '#059669'] as [string, string]}
                    style={styles.fabGradient}
                >
                    <Ionicons name="camera" size={28} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Detail Modal */}
            <Modal visible={!!selectedPhoto} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPhoto(null)}>
                        <Ionicons name="close" size={28} color="#FFF" />
                    </TouchableOpacity>
                    {selectedPhoto && (
                        <Image source={{ uri: selectedPhoto.url }} style={styles.fullImage} resizeMode="contain" />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    monthSection: { marginBottom: 24 },
    monthTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING },
    photoCard: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.3, // 4:5 aspect ratio roughly
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        elevation: 2,
    },
    photoImage: { width: '100%', height: '100%' },
    photoDateBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    photoDateText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    photoTypeBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    photoTypeText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
    modalClose: { position: 'absolute', top: 48, right: 24, padding: 8, zIndex: 10 },
    fullImage: { width: '100%', height: '80%' },
    retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
    emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
});
