import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import all Social screens
import { SocialHomeScreen } from '../screens/social/SocialHomeScreen';
import { PostDetailScreen } from '../screens/social/PostDetailScreen';
import { CreatePostScreen } from '../screens/social/CreatePostScreen';
import { UserProfileScreen } from '../screens/social/UserProfileScreen';
import { LeaderboardScreen } from '../screens/social/LeaderboardScreen';
import { ChallengesListScreen } from '../screens/social/ChallengesListScreen';
import { ChallengeDetailScreen } from '../screens/social/ChallengeDetailScreen';
import { FollowersListScreen, FollowingListScreen } from '../screens/social/FollowListScreens';
import { SearchUsersScreen } from '../screens/social/SearchUsersScreen';
import { ActivityScreen } from '../screens/social/ActivityScreen';

export type SocialStackParamList = {
    SocialHome: undefined;
    PostDetail: { postId: number };
    CreatePost: undefined;
    UserProfile: { userId: number };
    Leaderboard: undefined;
    ChallengesList: undefined;
    ChallengeDetail: { challengeId: number };
    Followers: { userId: number };
    Following: { userId: number };
    SearchUsers: undefined;
    Activity: undefined;
};

const Stack = createStackNavigator<SocialStackParamList>();

export function SocialNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="SocialHome" component={SocialHomeScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen
                name="CreatePost"
                component={CreatePostScreen}
                options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="ChallengesList" component={ChallengesListScreen} />
            <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
            <Stack.Screen name="Followers" component={FollowersListScreen} />
            <Stack.Screen name="Following" component={FollowingListScreen} />
            <Stack.Screen
                name="SearchUsers"
                component={SearchUsersScreen}
                options={{ animation: 'fade' }}
            />
            <Stack.Screen name="Activity" component={ActivityScreen} />
        </Stack.Navigator>
    );
}
