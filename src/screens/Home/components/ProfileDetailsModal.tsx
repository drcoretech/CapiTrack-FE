import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Edit3, Cloud, Check, ChevronRight, Settings, Globe, Shield, CreditCard, Users, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useAppStore } from '../../../store/useAppStore';
import { useTranslation } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';

export const ProfileDetailsModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const openModal = useAppStore((state) => state.openModal);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const userName = useAppStore((state) => state.userName);
  const setUserName = useAppStore((state) => state.setUserName);
  const selectedLanguage = useAppStore((state) => state.selectedLanguage);
  const currencySymbol = useAppStore((state) => state.currencySymbol) || '₹';
  const autoCaptureEnabled = useAppStore((state) => state.autoCaptureEnabled);
  const expenses = useAppStore((state) => state.expenses);
  const contacts = useAppStore((state) => state.contacts);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [isSaving, setIsSaving] = useState(false);

  const isVisible = activeModal === 'profile_details';

  const handleStartEdit = () => {
    setNameInput(userName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      await setUserName(trimmed);
      setIsEditingName(false);
      Keyboard.dismiss();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(userName);
    setIsEditingName(false);
    Keyboard.dismiss();
  };

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'hi':
        return 'हिंदी (Hindi)';
      case 'mr':
        return 'मराठी (Marathi)';
      default:
        return 'English';
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.backBtn}>
            <ArrowLeft size={20} color={Colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Account</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
            <X size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {userName ? userName[0].toUpperCase() : 'U'}
              </Text>
            </View>

            {isEditingName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  style={styles.nameTextInput}
                  placeholder="Your Name"
                  placeholderTextColor={Colors.inkSoft}
                  autoFocus
                  selectTextOnFocus
                />
                <View style={styles.editBtnRow}>
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    style={styles.cancelBtn}
                    disabled={isSaving}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveName}
                    style={styles.saveNameBtn}
                    disabled={isSaving}
                  >
                    <Check size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.saveNameBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.nameDisplayRow}>
                <Text style={styles.displayName}>{userName}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleStartEdit}
                  style={styles.editPill}
                >
                  <Edit3 size={13} color={Colors.moss} />
                  <Text style={styles.editPillText}>Edit Name</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.cloudBadge}>
              <Cloud size={13} color={Colors.moss} />
              <Text style={styles.cloudBadgeText}>Synced with MongoDB Atlas Cloud</Text>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <CreditCard size={18} color={Colors.moss} />
              </View>
              <Text style={styles.statNumber}>{expenses.length}</Text>
              <Text style={styles.statLabel}>Expenses Logged</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Users size={18} color={Colors.amber} />
              </View>
              <Text style={styles.statNumber}>{contacts.length}</Text>
              <Text style={styles.statLabel}>Ledger Contacts</Text>
            </View>
          </View>

          {/* Account Details Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>ACCOUNT SETTINGS</Text>

            <View style={styles.cardGroup}>
              {/* Language */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openModal('language_select')}
                style={styles.settingItem}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconCircle}>
                    <Globe size={18} color={Colors.moss} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>App Language</Text>
                    <Text style={styles.settingSub}>{getLanguageLabel(selectedLanguage)}</Text>
                  </View>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.changeActionText}>Change</Text>
                  <ChevronRight size={16} color={Colors.inkSoft} />
                </View>
              </TouchableOpacity>

              {/* Auto Capture Status */}
              <View style={[styles.settingItem, styles.lastSettingItem]}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconCircle}>
                    <Shield size={18} color={autoCaptureEnabled ? Colors.moss : Colors.brick} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Auto-Capture Notifications</Text>
                    <Text
                      style={[
                        styles.settingSub,
                        { color: autoCaptureEnabled ? Colors.moss : Colors.inkSoft },
                      ]}
                    >
                      {autoCaptureEnabled ? 'Active & Running' : 'Turned Off'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Full App Settings Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              closeModal();
              setActiveTab('settings');
            }}
            style={styles.openSettingsBtn}
          >
            <View style={styles.openSettingsLeft}>
              <Settings size={18} color={Colors.ink} />
              <Text style={styles.openSettingsText}>Go to All App Settings</Text>
            </View>
            <ChevronRight size={18} color={Colors.inkSoft} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    color: Colors.ink,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.mossLight,
    borderWidth: 2.5,
    borderColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarLargeText: {
    fontFamily: Fonts.serifMedium,
    fontSize: 34,
    color: Colors.moss,
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  displayName: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.ink,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.mossLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  editPillText: {
    fontSize: 12,
    fontFamily: Fonts.sansSemiBold,
    color: Colors.moss,
  },
  editNameContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameTextInput: {
    width: '100%',
    fontFamily: Fonts.sansSemiBold,
    fontSize: 18,
    color: Colors.ink,
    backgroundColor: Colors.mist,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: Colors.moss,
    marginBottom: 10,
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.mist,
  },
  cancelBtnText: {
    fontSize: 13,
    color: Colors.inkSoft,
    fontWeight: '600',
  },
  saveNameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.moss,
  },
  saveNameBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cloudBadgeText: {
    fontSize: 11.5,
    fontFamily: Fonts.sansMedium,
    color: Colors.inkSoft,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    gap: 6,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statNumber: {
    fontFamily: Fonts.serifMedium,
    fontSize: 20,
    color: Colors.ink,
  },
  statLabel: {
    fontSize: 11.5,
    fontFamily: Fonts.sansMedium,
    color: Colors.inkSoft,
  },
  sectionContainer: {
    marginTop: 6,
  },
  sectionHeader: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
    marginBottom: 8,
  },
  cardGroup: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13.5,
    color: Colors.ink,
  },
  settingSub: {
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeActionText: {
    fontSize: 12,
    fontFamily: Fonts.sansSemiBold,
    color: Colors.moss,
  },
  openSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginTop: 4,
  },
  openSettingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  openSettingsText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13.5,
    color: Colors.ink,
  },
});
