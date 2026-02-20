import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

type ActivityType = 'like' | 'comment' | 'follow' | 'mention' | 'challenge' | 'achievement';

const MOCK_ACTIVITIES: { id: number; type: ActivityType; user: { username: string; avatar: string }; content: string; time: string; read: boolean }[] = [
    { id: 1, type: 'like', user: { username: 'alex_lifts', avatar: 'https://i.pravatar.cc/150?img=2' }, content: 'liked your post', time: '2m ago', read: false },
    { id: 2, type: 'comment', user: { username: 'fit_jordan', avatar: 'https://i.pravatar.cc/150?img=3' }, content: 'commented: "Great form! 💪"', time: '15m ago', read: false },
    { id: 3, type: 'follow', user: { username: 'sam_strength', avatar: 'https://i.pravatar.cc/150?img=4' }, content: 'started following you', time: '1h ago', read: true },
    { id: 4, type: 'mention', user: { username: 'taylor_fit', avatar: 'https://i.pravatar.cc/150?img=5' }, content: 'mentioned you in a post', time: '3h ago', read: true },
    { id: 5, type: 'challenge', user: { username: 'casey_gains', avatar: 'https://i.pravatar.cc/150?img=6' }, content: 'invited you to Push-Up Challenge', time: '5h ago', read: true },
    { id: 6, type: 'achievement', user: { username: 'System', avatar: '' }, content: '🏆 You earned "First PR" badge!', time: '1d ago', read: true },
    { id: 7, type: 'like', user: { username: 'max_power', avatar: 'https://i.pravatar.cc/150?img=7' }, content: 'liked your workout', time: '2d ago', read: true },
];

export function ActivityScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const getIcon = (type: ActivityType) => {
        switch (type) {
            case 'like': return { name: 'heart', color: '#FF4757' };
            case 'comment': return { name: 'chatbubble', color: colors.primary.main };
            case 'follow': return { name: 'person-add', color: colors.success };
            case 'mention': return { name: 'at', color: '#9B59B6' };
            case 'challenge': return { name: 'trophy', color: '#F39C12' };
            case 'achievement': return { name: 'medal', color: '#FFD700' };
            default: return { name: 'notifications', color: colors.mutedForeground };
        }
    };

    const renderItem = ({ item }: { item: typeof MOCK_ACTIVITIES[0] }) => {
        const icon = getIcon(item.type);
        return (
            <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }, !item.read && { backgroundColor: `${colors.primary.main}08` }]}>
                <View style={styles.avatarWrap}>
                    {item.user.avatar ? (
                        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.systemAvatar, { backgroundColor: colors.muted }]}>
                            <MaterialCommunityIcons name="medal" size={24} color="#FFD700" />
                        </View>
                    )}
                    <View style={[styles.iconBadge, { backgroundColor: icon.color }]}>
                        <Ionicons name={icon.name as any} size={12} color="#FFF" />
                    </View>
                </View>
                <View style={styles.content}>
                    <Text style={[styles.text, { color: colors.foreground }]}>
                        {item.user.username !== 'System' && <Text style={styles.bold}>@{item.user.username} </Text>}
                        {item.content}
                    </Text>
                    <Text style={[styles.time, { color: colors.mutedForeground }]}>{item.time}</Text>
                </View>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary.main }]} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Activity</Text>
                <TouchableOpacity style={styles.btn}>
                    <Ionicons name="checkmark-done" size={22} color={colors.primary.main} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_ACTIVITIES}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="notifications-off-outline" size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No activity yet</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
    btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 12 },
    avatarWrap: { position: 'relative' },
    avatar: { width: 48, height: 48, borderRadius: 24 },
    systemAvatar: { alignItems: 'center', justifyContent: 'center' },
    iconBadge: { position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
    content: { flex: 1 },
    text: { fontSize: 14, lineHeight: 20 },
    bold: { fontWeight: '700' },
    time: { fontSize: 12, marginTop: 4 },
    unreadDot: { width: 10, height: 10, borderRadius: 5 },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, marginTop: 12 },
});
