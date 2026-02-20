import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

export function FormAnalysisScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const EXERCISES = [
        { id: 1, name: 'Squat', icon: 'human', tips: 5 },
        { id: 2, name: 'Bench Press', icon: 'dumbbell', tips: 4 },
        { id: 3, name: 'Deadlift', icon: 'weight-lifter', tips: 6 },
        { id: 4, name: 'Overhead Press', icon: 'human-handsup', tips: 3 },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View
                style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.primary.main }]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontFamily: fontFamilies.display }]}>Form Analysis</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
                    <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.cameraIcon}>
                            <View style={[styles.cameraGradient, { backgroundColor: colors.primary.main }]}>
                                <Ionicons name="videocam" size={40} color="#FFF" />
                            </View>
                        </View>
                        <Text style={[styles.heroTitle, { color: colors.foreground }]}>Record Your Lift</Text>
                        <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
                            Get AI-powered feedback on your form to improve technique and prevent injury
                        </Text>
                        <TouchableOpacity style={styles.recordBtn} activeOpacity={0.9}>
                            <View style={[styles.recordGradient, { backgroundColor: colors.primary.main }]}>
                                <Ionicons name="radio-button-on" size={20} color="#FFF" />
                                <Text style={styles.recordText}>Start Recording</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Exercise Guides */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Form Guides</Text>
                    <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
                        Learn proper technique before recording
                    </Text>
                    {EXERCISES.map((ex, index) => (
                        <TouchableOpacity
                            key={ex.id}
                            style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.exerciseIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                                <MaterialCommunityIcons name={ex.icon as any} size={28} color={colors.primary.main} />
                            </View>
                            <View style={styles.exerciseContent}>
                                <Text style={[styles.exerciseName, { color: colors.foreground }]}>{ex.name}</Text>
                                <Text style={[styles.exerciseTips, { color: colors.mutedForeground }]}>{ex.tips} form tips</Text>
                            </View>
                            <View style={[styles.playBtn, { backgroundColor: colors.primary.main }]}>
                                <Ionicons name="play" size={18} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tips */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recording Tips</Text>
                    <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {[
                            { icon: 'sunny', text: 'Good lighting for clear video' },
                            { icon: 'phone-portrait', text: 'Position camera at 45° angle' },
                            { icon: 'body', text: 'Full body should be visible' },
                            { icon: 'repeat', text: 'Record 2-3 reps for best analysis' },
                        ].map((tip, i) => (
                            <View key={i} style={[styles.tipRow, i < 3 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                <Ionicons name={tip.icon as any} size={22} color={colors.primary.main} />
                                <Text style={[styles.tipText, { color: colors.foreground }]}>{tip.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 20 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },
    heroSection: { paddingHorizontal: 16, paddingTop: 20 },
    heroCard: { padding: 28, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
    cameraIcon: { marginBottom: 20 },
    cameraGradient: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
    heroTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
    heroDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 10 },
    recordBtn: { overflow: 'hidden', borderRadius: 16 },
    recordGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 28, gap: 10 },
    recordText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    section: { paddingHorizontal: 16, marginTop: 28 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    sectionDesc: { fontSize: 14, marginBottom: 16 },
    exerciseCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10, gap: 14 },
    exerciseIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    exerciseContent: { flex: 1 },
    exerciseName: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
    exerciseTips: { fontSize: 14 },
    playBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    tipsCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    tipRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
    tipText: { fontSize: 15, flex: 1 },
});
