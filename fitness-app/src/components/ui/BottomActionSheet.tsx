/**
 * BottomActionSheet Component
 * 
 * Sticky footer with gradient fade and action button(s).
 * Used in onboarding screens for Continue button.
 * 
 * Usage:
 * <BottomActionSheet>
 *   <Button title="Continue" variant="primary" onPress={handleContinue} />
 * </BottomActionSheet>
 */

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { spacing } from '../../constants';

interface BottomActionSheetProps {
  children: React.ReactNode;
  style?: ViewStyle;
  showGradient?: boolean;
}

export function BottomActionSheet({
  children,
  style,
  showGradient = true,
}: BottomActionSheetProps) {
  const colors = useColors();

  return (
    <View style={[styles.footer, { backgroundColor: colors.background }, style]}>
      {showGradient && (
        <LinearGradient
          colors={[colors.background + '00', colors.background] as [string, string]}
          style={styles.footerGradient}
          pointerEvents="none"
        />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[6],
    paddingBottom: Platform.OS === 'ios' ? spacing[10] : spacing[6],
  },
  footerGradient: {
    position: 'absolute',
    top: -spacing[12],
    left: 0,
    right: 0,
    height: spacing[12],
  },
  content: {
    gap: spacing[3],
  },
});
