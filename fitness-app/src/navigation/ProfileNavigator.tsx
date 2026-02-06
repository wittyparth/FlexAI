import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Profile screens
import { ProfileHubScreen } from '../screens/profile/ProfileHubScreen';
// Missing screens
// import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
// import { AchievementsScreen } from '../screens/profile/AchievementsScreen';
// ...

const Stack = createStackNavigator();

export function ProfileNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
            }}
        >
            {/* Main Hub */}
            <Stack.Screen name="ProfileHub" component={ProfileHubScreen} />

            {/* Profile Management */}
            {/* <Stack.Screen name="EditProfile" component={EditProfileScreen} /> */}
            {/* <Stack.Screen name="Achievements" component={AchievementsScreen} /> */}
            {/* <Stack.Screen name="MyFollowers" component={MyFollowersScreen} /> */}
            {/* <Stack.Screen name="MyFollowing" component={MyFollowingScreen} /> */}
            {/* <Stack.Screen name="XPHistory" component={XPHistoryScreen} /> */}
        </Stack.Navigator>
    );
}

