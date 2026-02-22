import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useColors } from '../../hooks';
import { useUserQueries } from '../../hooks/queries/useUserQueries';
import { NavigationBar, Input } from '../../components/ui';

type ProfileFormState = {
    firstName: string;
    lastName: string;
    age: string;
    height: string;
    weight: string;
};

export function EditProfileScreen({ navigation }: any) {
    const colors = useColors();
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
            <NavigationBar
                title="Edit Profile"
                onBack={() => navigation.goBack()}
                rightActions={[{
                    icon: 'checkmark-done-outline',
                    onPress: handleSave,
                    color: canSave ? colors.primary.main : colors.mutedForeground,
                    label: 'Save',
                }]}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 }}
            >
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Input
                        label="First Name"
                        value={form.firstName}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
                        placeholder="Enter first name"
                        editable={!updateProfileMutation.isPending}
                    />
                    <Input
                        label="Last Name"
                        value={form.lastName}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
                        placeholder="Enter last name"
                        editable={!updateProfileMutation.isPending}
                    />
                    <Input
                        label="Age"
                        value={form.age}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, age: value }))}
                        placeholder="Optional"
                        keyboardType="numeric"
                        editable={!updateProfileMutation.isPending}
                    />
                    <Input
                        label="Height (cm)"
                        value={form.height}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, height: value }))}
                        placeholder="Optional"
                        keyboardType="numeric"
                        editable={!updateProfileMutation.isPending}
                    />
                    <Input
                        label="Weight (kg)"
                        value={form.weight}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, weight: value }))}
                        placeholder="Optional"
                        keyboardType="numeric"
                        editable={!updateProfileMutation.isPending}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        gap: 8,
    },
});
