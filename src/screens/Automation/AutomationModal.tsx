import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Bell } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { notificationListener } from '../../services/notificationListener';

export const AutomationModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const addExpense = useAppStore((state) => state.addExpense);

  const [mode, setMode] = useState<'permission' | 'nudge'>('permission');
  const [selectedNudgeCat, setSelectedNudgeCat] = useState<'Food' | 'Travel' | 'Grocery' | 'Fun'>('Food');

  const isVisible = activeModal === 'v2_automation';

  const handleSaveNudge = () => {
    addExpense(50, selectedNudgeCat, 'Auto-captured payment');
    closeModal();
    setMode('permission');
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.container}>
        {/* Close Button */}
        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
            <X size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>

        {mode === 'permission' ? (
          // Screen 12: Permission Ask
          <View style={styles.permWrap}>
            <View style={styles.permIcon}>
              <Bell size={28} color={Colors.amber} />
            </View>

            <Text style={styles.permTitle}>Let CapiTrack read payment notifications</Text>
            <Text style={styles.permLede}>
              This lets CapiTrack catch UPI payments automatically, so you don't have to type every
              entry by hand.
            </Text>

            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <Text style={styles.stepText}>Tap "Open settings" below</Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Enable notifications for "CapiTrack"
                </Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <Text style={styles.stepText}>Come back to CapiTrack, you are set</Text>
              </View>
            </View>

            <View style={styles.privacyNote}>
              <Text style={styles.privacyNoteText}>
                🔒 Notifications are read on-device only, to detect payment amounts. Nothing is uploaded. You can turn this off in Settings anytime to stop all reading.
              </Text>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => notificationListener.openSettings()}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Open Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Screen 13: Auto-capture Nudge Simulation
          <View style={styles.nudgeWrap}>
            <View style={styles.nudgeCard}>
              <View style={styles.nudgeSource}>
                <View style={styles.nudgePeIcon}>
                  <Text style={styles.nudgePeText}>₹</Text>
                </View>
                <Text style={styles.nudgeSourceText}>UPI PAYMENT · JUST NOW</Text>
              </View>

              <Text style={styles.nudgeTitle}>₹50 paid, what was this for?</Text>

              <View style={styles.nudgeChips}>
                {(['Food', 'Travel', 'Grocery', 'Fun'] as const).map((cat) => {
                  const isSel = selectedNudgeCat === cat;
                  const icons: Record<string, string> = {
                    Food: '🍔',
                    Travel: '🚕',
                    Grocery: '🛒',
                    Fun: '🎬',
                  };
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      onPress={() => setSelectedNudgeCat(cat)}
                      style={[styles.nudgeChip, isSel && styles.nudgeChipSel]}
                    >
                      <Text style={styles.chipIcon}>{icons[cat]}</Text>
                      <Text style={[styles.chipText, isSel && styles.chipTextSel]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveNudge}
                style={[styles.primaryBtn, { backgroundColor: Colors.amber }]}
              >
                <Text style={styles.primaryBtnText}>Save as {selectedNudgeCat}</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.ghostBtn}>
                <Text style={styles.ghostBtnText}>Skip this one</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  permIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    color: Colors.ink,
    lineHeight: 28,
    marginBottom: 8,
  },
  permLede: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    lineHeight: 19,
    marginBottom: 20,
  },
  stepsList: {
    gap: 12,
    marginVertical: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  stepText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13.5,
    color: Colors.ink,
  },
  privacyNote: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    padding: 12,
    marginTop: 'auto',
    marginBottom: 16,
  },
  privacyNoteText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    lineHeight: 16,
  },
  footer: {
    paddingBottom: 24,
  },
  primaryBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  nudgeWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  nudgeCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 22,
    padding: 22,
    gap: 14,
  },
  nudgeSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nudgePeIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgePeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: Colors.amber,
  },
  nudgeSourceText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    color: Colors.inkSoft,
    letterSpacing: 0.5,
  },
  nudgeTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 20,
    color: Colors.ink,
  },
  nudgeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  nudgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  nudgeChipSel: {
    backgroundColor: Colors.amber,
    borderColor: Colors.amber,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  chipTextSel: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
  },
  ghostBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
});
