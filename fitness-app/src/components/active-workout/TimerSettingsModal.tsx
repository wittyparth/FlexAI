import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useWorkoutStore } from '../../store/workoutStore';
import { fontFamilies } from '../../theme/typography';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function TimerSettingsModal({ visible, onClose }: Props) {
  const colors = useColors();
  const { autoStartTimer, defaultTimerSeconds, updateTimerSettings } = useWorkoutStore();
  
  const [autoStart, setAutoStart] = useState(autoStartTimer);
  const [durationStr, setDurationStr] = useState(defaultTimerSeconds.toString());

  useEffect(() => {
    if (visible) {
      setAutoStart(autoStartTimer);
      setDurationStr(defaultTimerSeconds.toString());
    }
  }, [visible, autoStartTimer, defaultTimerSeconds]);

  const handleSave = () => {
    const parsed = parseInt(durationStr, 10);
    const duration = isNaN(parsed) || parsed < 0 ? 90 : parsed;
    updateTimerSettings(autoStart, duration);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
          <Pressable style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>Timer Settings</Text>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
                <Ionicons name="close" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Auto-Start Timer</Text>
                <Switch
                  value={autoStart}
                  onValueChange={setAutoStart}
                  trackColor={{ false: colors.muted, true: colors.primary.main }}
                  thumbColor="#ffffff"
                />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Default Duration (s)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
                  keyboardType="number-pad"
                  value={durationStr}
                  onChangeText={setDurationStr}
                  maxLength={4}
                />
              </View>
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary.main }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamilies.display,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: 20,
    marginBottom: 28,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: 80,
    height: 48,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: fontFamilies.mono,
    paddingHorizontal: 8,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
