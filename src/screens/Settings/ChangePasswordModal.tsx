import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Eye, EyeOff, X, CheckCircle, AlertCircle, Shield } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { api } from '../../services/api';
import { haptics } from '../../services/haptics';
import { styles } from './ChangePasswordModal.styles';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('New password must be at least 4 characters long.');
      haptics.warning();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match. Please check and retype.');
      haptics.warning();
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.changePassword({
        currentPassword: currentPassword.trim() || undefined,
        newPassword: newPassword.trim(),
      });

      if (res && res.success) {
        setSuccessMessage('Password updated successfully!');
        haptics.success();
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        setErrorMessage(res?.message || 'Failed to update password. Please check your current password.');
        haptics.warning();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update password. Please verify current password.');
      haptics.warning();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <View style={styles.headerIcon}>
                  <Shield size={20} color={Colors.moss} />
                </View>
                <View>
                  <Text style={styles.title}>Change Password</Text>
                  <Text style={styles.subTitle}>Keep your CapiTrack account protected</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeBtn}
              >
                <X size={20} color={Colors.inkSoft} />
              </TouchableOpacity>
            </View>

            {/* Success Banner */}
            {!!successMessage && (
              <View style={styles.successBanner}>
                <CheckCircle size={18} color={Colors.moss} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Error Banner */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color={Colors.brick} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={16} color={Colors.inkSoft} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={Colors.inkSoft}
                    secureTextEntry={!showCurrent}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrent(!showCurrent)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showCurrent ? (
                      <EyeOff size={18} color={Colors.inkSoft} />
                    ) : (
                      <Eye size={18} color={Colors.inkSoft} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={16} color={Colors.inkSoft} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="At least 4 characters"
                    placeholderTextColor={Colors.inkSoft}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew(!showNew)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showNew ? (
                      <EyeOff size={18} color={Colors.inkSoft} />
                    ) : (
                      <Eye size={18} color={Colors.inkSoft} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={16} color={Colors.inkSoft} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter new password"
                    placeholderTextColor={Colors.inkSoft}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showConfirm ? (
                      <EyeOff size={18} color={Colors.inkSoft} />
                    ) : (
                      <Eye size={18} color={Colors.inkSoft} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSubmit}
                disabled={isLoading}
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

