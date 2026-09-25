import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

interface ConfirmDeleteModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  itemBadge?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  title = 'Delete Entry?',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemBadge,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Trash Icon Badge */}
              <View style={styles.iconCircle}>
                <Trash2 size={24} color={Colors.brick} />
              </View>

              {/* Title & Message */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Optional Item Highlight Badge */}
              {!!itemBadge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{itemBadge}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={onCancel}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onConfirm}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>{confirmLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  title: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 20,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13.5,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  badgeContainer: {
    backgroundColor: Colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 18,
  },
  badgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.brick,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brick,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
