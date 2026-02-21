import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useUserQueries } from '../../hooks/queries/useUserQueries';

type ProfileFormState = {
    firstName: string;
    lastName: string;
    age: string;
    height: string;
    weight: string;
};

export function EditProfileScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { profileQuery, updateProfileMutation } = useUserQueries();

    const [form, setForm] = useState<ProfileFormState>({
        firstName: '',
        lastName: '',
        age: '',
        height: '',
        weight: '',
    });
    const [hasHydratedForm, setHasHydratedForm] = useState(false);

    useEffect(() => {
        if (!profileQuery.data || hasHydratedForm) return;

        setForm({
            firstName: profileQuery.data.firstName ?? '',
            lastName: profileQuery.data.lastName ?? '',
            age: profileQuery.data.age ? String(profileQuery.data.age) : '',
            height: profileQuery.data.height ? String(profileQuery.data.height) : '',
            weight: profileQuery.data.weight ? String(profileQuery.data.weight) : '',
        });
        setHasHydratedForm(true);
    }, [profileQuery.data, hasHydratedForm]);

    const canSave = useMemo(() => {
        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        return firstName.length >= 2 && lastName.length >= 2 && !updateProfileMutation.isPending;
    }, [form.firstName, form.lastName, updateProfileMutation.isPending]);

    const parseOptionalNumber = (value: string) => {
        if (!value.trim()) return undefined;
        const parsed = Number(value);
        if (Number.isNaN(parsed)) return undefined;
        return parsed;
    };

    const handleSave = async () => {
        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();

        if (firstName.length < 2 || lastName.length < 2) {
            Alert.alert('Invalid name', 'First name and last name must be at least 2 characters.');
            return;
        }

        try {
            await updateProfileMutation.mutateAsync({
                firstName,
                lastName,
                age: parseOptionalNumber(form.age),
                height: parseOptionalNumber(form.height),
                weight: parseOptionalNumber(form.weight),
            });

            Alert.alert('Profile updated', 'Your profile has been updated successfully.');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Update failed', error?.message || 'Could not update profile. Please try again.');
        }
    };

    const isLoading = profileQuery.isLoading && !profileQuery.data;

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Edit Profile</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={styles.saveBtn}
                    disabled={!canSave}
                >
                    {updateProfileMutation.isPending ? (
                        <ActivityIndicator size="small" color={colors.primary.main} />
                    ) : (
                        <Text style={[styles.saveBtnText, { color: canSave ? colors.primary.main : colors.mutedForeground }]}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 }}
            >
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <FormField
                        label="First Name"
                        value={form.firstName}
                        onChangeText={(value: string) => setForm((prev) => ({ ...prev, firstName: value }))}
                        placeholder="Enter first name"
                        colors={colors}
                    />
                    <FormField
                        label="Last Name"
                        value={form.lastName}
                        onChangeText={(value: string) => setForm((prev) => ({ ...prev, lastName: value }))}
                        placeholder="Enter last name"
                        colors={colors}
                    />
                    <FormField
                        label="Age"
                        value={form.age}
                        onChangeText={(value: string) => setForm((prev) => ({ ...prev, age: value }))}
                        placeholder="Optional"
                        keyboardType="numeric"
                        colors={colors}
                    />
                    <FormField
                        label="Height"
                        value={form.height}
                        onChangeText={(value: string) => setForm((prev) => ({ ...prev, height: value }))}
                        placeholder="Optional"
                        keyboardType="numeric"
                        colors={colors}
                    />
                    <FormField
                        label="Weight"
                        value={form.weight}
                        onChangeText={(value: string) => setForm((prev) => ({ ...prev, weight: value }))}
                        placeholder="Optional"
                        keyboardType="numeric"
                        colors={colors}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function FormField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    colors,
}: {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric';
    colors: any;
}) {
    return (
        <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={keyboardType ?? 'default'}
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    saveBtn: {
        width: 56,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    card: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        gap: 14,
    },
    field: {
        gap: 8,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        fontWeight: '500',
    },
});
