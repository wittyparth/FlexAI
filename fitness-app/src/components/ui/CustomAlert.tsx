import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  danger?: boolean; // if true, primary button is red
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  isLoading?: boolean;
}

export function CustomAlert({
  visible,
  title,
  message,
  primaryActionLabel = 'Confirm',
  secondaryActionLabel = 'Cancel',
  danger = false,
  onPrimaryPress,
  onSecondaryPress,
  isLoading = false,
}: CustomAlertProps) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
          
          <View style={styles.actions}>
            {onSecondaryPress && (
              <TouchableOpacity
                style={[styles.btn, styles.secondaryBtn, { backgroundColor: colors.muted }]}
                onPress={onSecondaryPress}
                disabled={isLoading}
              >
                <Text style={[styles.btnText, { color: colors.foreground }]}>{secondaryActionLabel}</Text>
              </TouchableOpacity>
            )}
            
            {onPrimaryPress && (
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.primaryBtn,
                  { backgroundColor: danger ? '#EF4444' : colors.primary.main }
                ]}
                onPress={onPrimaryPress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.btnText, { color: '#FFFFFF' }]}>{primaryActionLabel}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: fontFamilies.display,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
  },
  primaryBtn: {
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
