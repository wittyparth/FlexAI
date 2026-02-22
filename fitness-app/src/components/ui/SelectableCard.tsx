/**
 * SelectableCard Component — Production Grade
 *
 * Reusable selection card with icon, title, description.
 * Features:
 *  - Reanimated spring press-scale feedback
 *  - Animated spring checkmark that scales in when selected
 *  - Haptic feedback on selection
 *  - `badge` prop for "Popular" / "Recommended" corner label
 *  - Subtle gradient tint on selected state
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SelectableCardProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconComponent?: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** Corner badge label e.g. "Popular" */
  badge?: string;
  style?: ViewStyle;
}

export function SelectableCard({
  title,
  description,
  icon,
  iconComponent,
  selected = false,
  onPress,
  disabled = false,
  badge,
  style,
}: SelectableCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  // Press scale animation
  const scale = useSharedValue(1);
  const handlePressIn = () => scale.value = withSpring(0.97, { damping: 20, stiffness: 350 });
  const handlePressOut = () => scale.value = withSpring(1.0, { damping: 20, stiffness: 350 });
  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // Checkmark scale animation
  const checkScale = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    checkScale.value = withSpring(selected ? 1 : 0, { damping: 18, stiffness: 400 });
  }, [selected]);
  const checkAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const handlePress = () => {
    if (!selected) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        cardAnimStyle,
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary.main : colors.border,
          borderWidth: selected ? 2 : 1,
        },
        selected && { ...shadows.colored },
        disabled && styles.disabledCard,
        style,
      ]}
    >
      {/* Corner badge */}
      {badge && (
        <View style={[styles.cornerBadge, { backgroundColor: colors.primary.main }]}>
          <Text style={styles.cornerBadgeText}>{badge}</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        {/* Icon Box */}
        {(icon || iconComponent) && (
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: selected
                  ? colors.primary.main
                  : isDark ? colors.neutral[200] : colors.primary.main + '12',
              },
            ]}
          >
            {iconComponent || (
              <Ionicons
                name={icon!}
                size={26}
                color={selected ? '#FFFFFF' : colors.primary.main}
              />
            )}
          </View>
        )}

        {/* Text Container */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: selected ? colors.primary.main : colors.foreground }]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {description}
            </Text>
          )}
        </View>

        {/* Animated Checkmark (replaces radio) */}
        <Animated.View
          style={[
            styles.checkCircle,
            {
              backgroundColor: selected ? colors.primary.main : 'transparent',
              borderColor: selected ? colors.primary.main : colors.border,
            },
            checkAnimStyle,
          ]}
        >
          {selected && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}
              },
            ]}
          >
            {iconComponent || (
              <Ionicons
                name={icon!}
                size={28}
                color={selected ? '#FFFFFF' : colors.primary.main}
              />
            )}
          </View>
        )}

        {/* Text Container */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: selected ? colors.primary.main : colors.foreground },
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {description}
            </Text>
          )}
        </View>

        {/* Radio Circle */}
        <View
          style={[
            styles.radioCircle,
            {
              borderColor: selected ? colors.primary.main : colors.border,
              backgroundColor: selected ? colors.primary.main : 'transparent',
            },
          ]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[4],
    position: 'relative',
    overflow: 'hidden',
    ...shadows.sm,
  },
  disabledCard: {
    opacity: 0.55,
  },
  cornerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: spacing[3],
    paddingVertical: 3,
    borderBottomLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius['2xl'],
  },
  cornerBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.base,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
});
