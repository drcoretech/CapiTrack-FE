import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Keyboard,
  Switch,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './ProfileDetailsModal.styles';
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
  Lock,
  Camera,
} from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useAppStore } from '../../../store/useAppStore';
import { useTranslation } from '../../../i18n/translations';
import { notificationListener } from '../../../services/notificationListener';
import { ChangePasswordModal } from '../../Settings/ChangePasswordModal';

export const ProfileDetailsModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const openModal = useAppStore((state) => state.openModal);
  const userName = useAppStore((state) => state.userName);
  const setUserName = useAppStore((state) => state.setUserName);
  const profilePicture = useAppStore((state) => state.profilePicture);
  const setProfilePicture = useAppStore((state) => state.setProfilePicture);
  const selectedLanguage = useAppStore((state) => state.selectedLanguage);
  const autoCaptureEnabled = useAppStore((state) => state.autoCaptureEnabled);
  const toggleAutoCapture = useAppStore((state) => state.toggleAutoCapture);
  const businessTrackingEnabled = useAppStore((state) => state.businessTrackingEnabled);
  const toggleBusinessTracking = useAppStore((state) => state.toggleBusinessTracking);
  const categories = useAppStore((state) => state.categories);
  const expenses = useAppStore((state) => state.expenses);
  const contacts = useAppStore((state) => state.contacts);
  const logout = useAppStore((state) => state.logout);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const isVisible = activeModal === 'profile_details';
  const activeCategoriesCount = categories.filter((c) => c.enabled).length;

  const handleStartEdit = () => {
    setNameInput(userName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 20) {
      Alert.alert('Invalid Name', 'Name cannot exceed 20 characters.');
      return;
    }
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

  const handlePickImage = async () => {
    const pickFromLibrary = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Please allow gallery access to upload a profile picture.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
          await setProfilePicture(imageUri);
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to select photo');
      }
    };

    const takePhoto = async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Please allow camera access to take a profile photo.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
          await setProfilePicture(imageUri);
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to capture photo');
      }
    };

    const options: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickFromLibrary },
    ];

    if (profilePicture) {
      options.push({
        text: 'Remove Photo',
        style: 'destructive',
        onPress: async () => {
          await setProfilePicture('');
        },
      });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Profile Picture', 'Update your profile photo', options);
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
            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickImage}
                style={styles.avatarLarge}
              >
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} style={styles.avatarLargeImg} />
                ) : (
                  <Text style={styles.avatarLargeText}>
                    {userName ? userName[0].toUpperCase() : 'U'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickImage}
                style={styles.cameraBadge}
              >
                <Camera size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {isEditingName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  style={styles.nameTextInput}
                  placeholder="Your Name"
                  placeholderTextColor={Colors.inkSoft}
                  maxLength={20}
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
                <Text style={styles.displayName} numberOfLines={1} ellipsizeMode="tail">
                  {userName}
                </Text>
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
                style={styles.settingItem}
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

              {/* Change Password */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowChangePassword(true)}
                style={[styles.settingItem, styles.lastSettingItem]}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconCircle}>
                    <Lock size={18} color={Colors.moss} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Change Password</Text>
                    <Text style={styles.settingSub}>Update your account security</Text>
                  </View>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.changeActionText}>Update</Text>
                  <ChevronRight size={16} color={Colors.inkSoft} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Change Password Modal */}
            <ChangePasswordModal
              visible={showChangePassword}
              onClose={() => setShowChangePassword(false)}
            />

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
      </SafeAreaView>
    </Modal>
  );
};
