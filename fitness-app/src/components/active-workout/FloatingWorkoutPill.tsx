/**
 * FloatingWorkoutPill — Persistent indicator shown above tab bar
 * when a workout is in progress and the user navigates away.
 */

import React, { useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useWorkoutStore } from '../../store/workoutStore';
import { useShallow } from 'zustand/react/shallow';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { CustomAlert } from '../ui/CustomAlert';

export const FloatingWorkoutPill = memo(() => {
  const colors = useColors();
  const navigation = useNavigation<any>();

  const { status, workoutName, elapsedSeconds, isResting, totalSets, cancelWorkout } = useWorkoutStore(
    useShallow((state) => ({
      status: state.status,
      workoutName: state.workoutName,
      elapsedSeconds: state.elapsedSeconds,
      isResting: state.isResting,
      totalSets: Object.keys(state.sets).length,
      cancelWorkout: state.cancelWorkout,
    }))
  );

  const [cancelModalVisible, setCancelModalVisible] = React.useState(false);

  // Pulsing red dot animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  // Find the exact current active screen in the deep navigator hierarchy
  const currentRouteName = useNavigationState((state) => {
    if (!state) return null;
    let current = state.routes[state.index];
    while (current && current.state && current.state.routes) {
      const idx = current.state.index ?? 0;
      current = current.state.routes[idx] as any;
    }
    return current?.name;
  });

  const isActive = status === 'in_progress' && currentRouteName !== 'ActiveWorkout';

  useEffect(() => {
    if (isActive) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();

      // Pulse
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, easing: Easing.ease, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      // Slide out
      Animated.timing(slideAnim, { toValue: 100, duration: 200, useNativeDriver: true }).start();
    }
  }, [isActive]);

  if (!isActive) return null;

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    // Navigate safely through the nested navigators
    navigation.navigate('MainApp', {
      screen: 'WorkoutTab',
      params: { screen: 'ActiveWorkout' }
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.primary.main + '30' }]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {/* Live indicator */}
        <View style={styles.liveSection}>
          <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
          <View style={[styles.liveDotOuter, { borderColor: '#EF444440' }]} />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.pillName, { color: colors.foreground }]} numberOfLines={1}>
            {workoutName || 'Workout'}
          </Text>
          <Text style={[styles.pillMeta, { color: colors.mutedForeground }]}>
            {isResting ? '⏸ Resting' : `${totalSets} sets`}
          </Text>
        </View>

        {/* Timer */}
        <View style={[styles.timerBox, { backgroundColor: colors.muted }]}>
          <Text style={[styles.timerText, { color: colors.foreground }]}>
            {formatTime(elapsedSeconds)}
          </Text>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={(e) => {
            e.stopPropagation();
            setCancelModalVisible(true);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={24} color={colors.mutedForeground} />
        </TouchableOpacity>
      </TouchableOpacity>

      <CustomAlert
        visible={cancelModalVisible}
        title="Cancel Workout?"
        message="Are you sure you want to discard this workout? This cannot be undone."
        danger={true}
        primaryActionLabel="Discard"
        secondaryActionLabel="Keep Going"
        onPrimaryPress={() => {
          setCancelModalVisible(false);
          cancelWorkout();
        }}
        onSecondaryPress={() => setCancelModalVisible(false)}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 88, // Above tab bar
    left: 16,
    right: 16,
    zIndex: 999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  liveSection: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
  },
  liveDotOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  info: {
    flex: 1,
    gap: 1,
  },
  pillName: {
    fontSize: 14,
    fontWeight: '700',
  },
  pillMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  timerBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  timerText: {
    fontFamily: fontFamilies.mono,
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 2,
    marginLeft: 2,
  },
});
