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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Edit3,
  Check,
  ChevronRight,
  Globe,
  Shield,
  CreditCard,
  Users,
  ArrowLeft,
  Briefcase,
  Layers,
  LogOut,
  Trash2,
  Gift,
  Share2,
} from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useAppStore } from '../../../store/useAppStore';
import { useTranslation } from '../../../i18n/translations';
import { notificationListener } from '../../../services/notificationListener';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { shareInviteLink } from '../../../services/upiPayment';

export const ProfileDetailsModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const openModal = useAppStore((state) => state.openModal);
  const userName = useAppStore((state) => state.userName);
  const setUserName = useAppStore((state) => state.setUserName);
  const selectedLanguage = useAppStore((state) => state.selectedLanguage);
  const autoCaptureEnabled = useAppStore((state) => state.autoCaptureEnabled);
  const toggleAutoCapture = useAppStore((state) => state.toggleAutoCapture);
  const businessTrackingEnabled = useAppStore((state) => state.businessTrackingEnabled);
  const toggleBusinessTracking = useAppStore((state) => state.toggleBusinessTracking);
  const categories = useAppStore((state) => state.categories);
  const expenses = useAppStore((state) => state.expenses);
  const clearAllExpenses = useAppStore((state) => state.clearAllExpenses);
  const contacts = useAppStore((state) => state.contacts);
  const logout = useAppStore((state) => state.logout);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearExpensesConfirm, setShowClearExpensesConfirm] = useState(false);

  const isVisible = activeModal === 'profile_details';
  const activeCategoriesCount = categories.filter((c) => c.enabled).length;

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
        {/* Header Bar - Clean without title */}
        <View style={styles.headerBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.iconBtn}>
            <ArrowLeft size={20} color={Colors.ink} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.iconBtn}>
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
                  style={styles.editPencilBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit3 size={16} color={Colors.moss} />
                </TouchableOpacity>
              </View>
            )}
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


          {/* App Preferences & Features */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>PREFERENCES & FEATURES</Text>

            <View style={styles.cardGroup}>
              {/* Freelance & Client Projects Toggle */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconCircle}>
                    <Briefcase size={18} color={businessTrackingEnabled ? Colors.moss : Colors.inkSoft} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Freelance & Client Projects</Text>
                    <Text
                      style={[
                        styles.settingSub,
                        { color: businessTrackingEnabled ? Colors.moss : Colors.inkSoft },
                      ]}
                    >
                      {businessTrackingEnabled ? 'Active (Website deals & dues)' : 'Disabled'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={businessTrackingEnabled}
                  onValueChange={toggleBusinessTracking}
                  trackColor={{ false: Colors.line, true: Colors.moss }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Auto-Capture Notifications */}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconCircle}>
                    <Shield size={18} color={autoCaptureEnabled ? Colors.moss : Colors.brick} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Auto-Capture Notifications</Text>
                    <Text
                      style={[
                        styles.settingSub,
                        { color: autoCaptureEnabled ? Colors.moss : Colors.inkSoft },
                      ]}
                    >
                      {autoCaptureEnabled ? 'Active & Listening' : 'Turned Off'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={autoCaptureEnabled}
                  onValueChange={async () => {
                    const nextVal = !autoCaptureEnabled;
                    await toggleAutoCapture();
                    if (nextVal) {
                      await notificationListener.openSettings();
                    }
                  }}
                  trackColor={{ false: Colors.line, true: Colors.moss }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* App Language */}
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

              {/* Manage Custom Categories */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openModal('manage_categories')}
                style={[styles.settingItem, styles.lastSettingItem]}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconCircle}>
                    <Layers size={18} color={Colors.amber} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Custom Categories</Text>
                    <Text style={styles.settingSub}>{activeCategoriesCount} active categories</Text>
                  </View>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.changeActionText}>Configure</Text>
                  <ChevronRight size={16} color={Colors.inkSoft} />
                </View>
              </TouchableOpacity>

              {/* Clear All Personal Expenses */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowClearExpensesConfirm(true)}
                style={[styles.settingItem, styles.lastSettingItem]}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIconCircle, { backgroundColor: '#FEE2E2' }]}>
                    <Trash2 size={18} color={Colors.brick} />
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: Colors.brick }]}>Clear All Expenses</Text>
                    <Text style={styles.settingSub}>{expenses.length} personal expense records</Text>
                  </View>
                </View>
                <View style={styles.settingRight}>
                  <Text style={[styles.changeActionText, { color: Colors.brick }]}>Reset</Text>
                  <ChevronRight size={16} color={Colors.inkSoft} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Log Out Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowLogoutConfirm(true)}
              style={styles.logoutBtn}
            >
              <LogOut size={18} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Log Out of CapiTrack</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Custom Log Out Confirmation Dialog */}
        {showLogoutConfirm && (
          <Modal visible={true} transparent={true} animationType="fade">
            <View style={styles.confirmBackdrop}>
              <View style={styles.confirmCard}>
                <View style={styles.confirmIconBadge}>
                  <LogOut size={26} color="#DC2626" />
                </View>
                <Text style={styles.confirmTitle}>Log Out?</Text>
                <Text style={styles.confirmDesc}>
                  Are you sure you want to log out? Your data is securely saved in your CapiTrack account and you can log back in anytime with your name and password.
                </Text>
                <View style={styles.confirmActions}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowLogoutConfirm(false)}
                    style={styles.confirmCancelBtn}
                  >
                    <Text style={styles.confirmCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={async () => {
                      setShowLogoutConfirm(false);
                      closeModal();
                      await logout();
                    }}
                    style={styles.confirmLogoutBtn}
                  >
                    <Text style={styles.confirmLogoutText}>Yes, Log Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Clear All Expenses Confirmation Modal */}
        <ConfirmDeleteModal
          visible={showClearExpensesConfirm}
          title="Clear All Expenses?"
          message="Are you sure you want to permanently delete all personal expense entries? This action cannot be undone."
          itemBadge={`${expenses.length} Records`}
          confirmLabel="Delete All"
          cancelLabel="Cancel"
          onConfirm={async () => {
            setShowClearExpensesConfirm(false);
            await clearAllExpenses();
          }}
          onCancel={() => setShowClearExpensesConfirm(false)}
        />
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
    paddingBottom: 8,
  },
  iconBtn: {
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
    paddingTop: 8,
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
    marginBottom: 12,
  },
  avatarLargeText: {
    fontFamily: Fonts.serifMedium,
    fontSize: 34,
    color: Colors.moss,
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  displayName: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.ink,
  },
  editPencilBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editNameContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
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
    marginTop: 4,
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
    flex: 1,
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 20,
    gap: 8,
  },
  logoutBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#DC2626',
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: 8,
  },
  confirmDesc: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  confirmActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#FEF3C7',
    padding: 16,
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  rewardCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  rewardTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  pointsBadge: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  pointsBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },
  rewardSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  idCodesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  idCodeBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  idCodeLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  idCodeValue: {
    fontFamily: Fonts.monoMedium,
    fontSize: 13,
    color: Colors.mossDark,
    fontWeight: '700',
  },
  shareRewardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  shareRewardBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
});

