import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';

interface EditNameModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({
  visible,
  currentName,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [nameInput, setNameInput] = useState(currentName);

  useEffect(() => {
    setNameInput(currentName);
  }, [currentName, visible]);

  const handleSave = () => {
    if (nameInput.trim()) {
      onSave(nameInput.trim());
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.nameModalCard}>
          <Text style={styles.nameModalTitle}>{t('editYourName')}</Text>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder={t('enterNamePlaceholder')}
            placeholderTextColor={Colors.inkSoft}
            style={styles.nameModalInput}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <View style={styles.nameModalBtnRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.nameModalCancelBtn}
            >
              <Text style={styles.nameModalCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              style={styles.nameModalSaveBtn}
            >
              <Text style={styles.nameModalSaveText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 42, 36, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  nameModalCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 22,
    gap: 14,
  },
  nameModalTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    color: Colors.ink,
  },
  nameModalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  nameModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  nameModalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  nameModalCancelText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  nameModalSaveBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  nameModalSaveText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
