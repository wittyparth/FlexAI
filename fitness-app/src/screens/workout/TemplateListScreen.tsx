import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useTemplateStore } from '../../store/templateStore';
import { Template } from '../../types/backend.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export function TemplateListScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    
    const templatesMap = useTemplateStore(state => state.templates);
    const templates: Template[] = Object.values(templatesMap);

    const activeData = templates.filter(t =>
        searchQuery.length === 0 || t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateTemplate = () => {
        navigation.navigate('TemplateEditor'); // New template mode
    };

    const handleTemplatePress = (templateId: string) => {
        navigation.navigate('TemplateEditor', { templateId });
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
                        Templates
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.foreground }]}
                        placeholder="Search your templates..."
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
            </View>

            {/* Content list */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 160 }]}
            >
                {activeData.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="file-document-outline" size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyStateText, { color: colors.foreground }]}>No templates found</Text>
                        <Text style={[styles.emptyStateSub, { color: colors.mutedForeground }]}>
                            Create a new weekly template to get started!
                        </Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {activeData.map((template) => (
                            <TouchableOpacity
                                key={template.id}
                                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.8}
                                onPress={() => handleTemplatePress(template.id)}
                            >
                                {/* Color-coded header block */}
                                <View style={[styles.cardImageContainer, { backgroundColor: (template.color || '#6366F1') + '22' }]}>
                                    <View
                                        style={[StyleSheet.absoluteFill, { backgroundColor: template.color || '#6366F1', opacity: 0.12 }]}
                                    />
                                    <MaterialCommunityIcons name="calendar-month" size={32} color={template.color || '#6366F1'} style={{ opacity: 0.7 }} />

                                    {/* Overlay Info */}
                                    <View
                                        style={styles.cardOverlay}
                                    />
                                    <View style={styles.cardOverlayContent}>
                                        <Text style={styles.cardDays}>{template.days.filter(d => !d.isRestDay).length} Active Days</Text>
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
                                        {template.name}
                                    </Text>
                                    <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]} numberOfLines={2}>
                                        {template.description || 'No description provided.'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* FAB for Create */}
            <TouchableOpacity
                style={[styles.fab, { shadowColor: colors.primary.main }]}
                onPress={handleCreateTemplate}
                activeOpacity={0.9}
            >
                <View
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { borderBottomWidth: 1 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
    backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 12, height: 44, borderRadius: 12, marginBottom: 16 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
    contentContainer: { padding: 16 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyStateText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
    emptyStateSub: { fontSize: 14, marginTop: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    card: { width: CARD_WIDTH, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
    cardImageContainer: { height: 120, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
    cardOverlayContent: { position: 'absolute', bottom: 8, left: 12 },
    cardDays: { color: '#fff', fontSize: 12, fontWeight: '700', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
    cardBody: { padding: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    cardSubtitle: { fontSize: 12, lineHeight: 16 },
    fab: { position: 'absolute', bottom: 40, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    fabGradient: { flex: 1, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
});
