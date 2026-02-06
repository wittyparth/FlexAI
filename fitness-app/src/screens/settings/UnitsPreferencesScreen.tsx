import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useUserQueries } from '../../hooks/queries/useUserQueries';

export function UnitsPreferencesScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { settingsQuery, updateSettingsMutation } = useUserQueries();

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const handleChangeUnits = async (unitSystem: 'metric' | 'imperial') => {
        try {
            await updateSettingsMutation.mutateAsync({ units: unitSystem });
        } catch (error) {
            console.error('Failed to update units:', error);
        }
    };

    const currentUnits = settingsQuery.data?.units || 'metric';
    const isLoading = settingsQuery.isLoading || updateSettingsMutation.isPending;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    Units & Preferences
                </Text>
                <View style={styles.headerBtn}>
                    {isLoading && <ActivityIndicator size="small" color={colors.primary.main} />}
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Unit System Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Unit System</Text>
                        <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
                            Choose your preferred measurement system. This affects weight, height, and distance throughout the app.
                        </Text>

                        <View style={styles.presetsRow}>
                            <TouchableOpacity
                                style={[
                                    styles.presetCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: currentUnits === 'imperial' ? colors.primary.main : colors.border,
                                        borderWidth: currentUnits === 'imperial' ? 2 : 1
                                    }
                                ]}
                                onPress={() => handleChangeUnits('imperial')}
                                disabled={updateSettingsMutation.isPending}
                            >
                                <Text style={styles.presetFlag}>🇺🇸</Text>
                                <Text style={[styles.presetLabel, { color: colors.foreground }]}>Imperial</Text>
                                <Text style={[styles.presetDesc, { color: colors.mutedForeground }]}>lbs, ft, mi</Text>
                                {currentUnits === 'imperial' && (
                                    <View style={[styles.checkBadge, { backgroundColor: colors.primary.main }]}>
                                        <Ionicons name="checkmark" size={14} color="#FFF" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.presetCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: currentUnits === 'metric' ? colors.primary.main : colors.border,
                                        borderWidth: currentUnits === 'metric' ? 2 : 1
                                    }
                                ]}
                                onPress={() => handleChangeUnits('metric')}
                                disabled={updateSettingsMutation.isPending}
                            >
                                <Text style={styles.presetFlag}>🌍</Text>
                                <Text style={[styles.presetLabel, { color: colors.foreground }]}>Metric</Text>
                                <Text style={[styles.presetDesc, { color: colors.mutedForeground }]}>kg, cm, km</Text>
                                {currentUnits === 'metric' && (
                                    <View style={[styles.checkBadge, { backgroundColor: colors.primary.main }]}>
                                        <Ionicons name="checkmark" size={14} color="#FFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Info */}
                    <View style={[styles.infoCard, { backgroundColor: `${colors.primary.main}08`, borderColor: `${colors.primary.main}20` }]}>
                        <Ionicons name="information-circle" size={24} color={colors.primary.main} />
                        <Text style={[styles.infoText, { color: colors.foreground }]}>
                            Changing units will automatically convert your existing data. Your workout history and stats will be recalculated to match your preference.
                        </Text>
                    </View>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionDesc: { fontSize: 14, marginBottom: 20, marginLeft: 4, lineHeight: 20 },
    presetsRow: { flexDirection: 'row', gap: 12 },
    presetCard: { flex: 1, padding: 20, borderRadius: 18, borderWidth: 1, alignItems: 'center', position: 'relative' },
    presetFlag: { fontSize: 36, marginBottom: 10 },
    presetLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    presetDesc: { fontSize: 13 },
    checkBadge: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    infoCard: { flexDirection: 'row', margin: 16, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
    infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
