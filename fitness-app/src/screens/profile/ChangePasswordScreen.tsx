import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

export function ChangePasswordScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const isValid = currentPassword.length >= 8 && newPassword.length >= 8 && newPassword === confirmPassword;

    const PasswordStrength = ({ password }: { password: string }) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
        const colors_arr = [colors.error, '#F59E0B', '#10B981', colors.success];

        return password.length > 0 ? (
            <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.strengthBar,
                                { backgroundColor: i < strength ? colors_arr[strength - 1] : colors.muted }
                            ]}
                        />
                    ))}
                </View>
                <Text style={[styles.strengthText, { color: strength > 0 ? colors_arr[strength - 1] : colors.mutedForeground }]}>
                    {strength > 0 ? labels[strength - 1] : 'Enter password'}
                </Text>
            </View>
        ) : null;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Change Password</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {/* Current Password */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.foreground }]}>Current Password</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} />
                            <TextInput
                                style={[styles.textInput, { color: colors.foreground }]}
                                placeholder="Enter current password"
                                placeholderTextColor={colors.mutedForeground}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrent}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.foreground }]}>New Password</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                            <Ionicons name="key-outline" size={20} color={colors.mutedForeground} />
                            <TextInput
                                style={[styles.textInput, { color: colors.foreground }]}
                                placeholder="Enter new password"
                                placeholderTextColor={colors.mutedForeground}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNew}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                        <PasswordStrength password={newPassword} />
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.foreground }]}>Confirm New Password</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                            <Ionicons name="checkmark-circle-outline" size={20} color={colors.mutedForeground} />
                            <TextInput
                                style={[styles.textInput, { color: colors.foreground }]}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.mutedForeground}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <Text style={[styles.errorText, { color: colors.error }]}>Passwords do not match</Text>
                        )}
                    </View>

                    {/* Requirements */}
                    <View style={[styles.requirementsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.requirementsTitle, { color: colors.foreground }]}>Password Requirements:</Text>
                        {[
                            { text: 'At least 8 characters', met: newPassword.length >= 8 },
                            { text: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
                            { text: 'One number', met: /[0-9]/.test(newPassword) },
                            { text: 'One special character', met: /[^A-Za-z0-9]/.test(newPassword) },
                        ].map((req, i) => (
                            <View key={i} style={styles.requirementRow}>
                                <Ionicons
                                    name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={18}
                                    color={req.met ? colors.success : colors.mutedForeground}
                                />
                                <Text style={[styles.requirementText, { color: req.met ? colors.success : colors.mutedForeground }]}>
                                    {req.text}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { opacity: isValid ? 1 : 0.5 }]}
                        disabled={!isValid}
                        activeOpacity={0.9}
                    >
                        <LinearGradient colors={colors.primary.gradient as [string, string]} style={styles.submitGradient}>
                            <Text style={styles.submitText}>Update Password</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
    textInput: { flex: 1, paddingVertical: 16, fontSize: 16 },
    strengthContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
    strengthBars: { flexDirection: 'row', gap: 4 },
    strengthBar: { width: 40, height: 4, borderRadius: 2 },
    strengthText: { fontSize: 13, fontWeight: '600' },
    errorText: { fontSize: 13, marginTop: 8 },
    requirementsCard: { padding: 18, borderRadius: 16, borderWidth: 1, marginTop: 10 },
    requirementsTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
    requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    requirementText: { fontSize: 14 },
    submitBtn: { marginTop: 30, borderRadius: 16, overflow: 'hidden' },
    submitGradient: { paddingVertical: 18, alignItems: 'center' },
    submitText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
