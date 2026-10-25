import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { useKeyboard } from '../../hooks/useKeyboard';
import { haptics } from '../../services/haptics';
import { styles } from './AddLedgerEntryModal.styles';

export const AddLedgerEntryModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const selectedPersonId = useAppStore((state) => state.selectedPersonId);
  const contacts = useAppStore((state) => state.contacts);
  const closeModal = useAppStore((state) => state.closeModal);
  const addLedgerEntry = useAppStore((state) => state.addLedgerEntry);
  const { t } = useTranslation();

  const [personName, setPersonName] = useState('');
  const [direction, setDirection] = useState<'LENT' | 'BORROWED'>('LENT');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  const isVisible = activeModal === 'add_ledger';

  useEffect(() => {
    if (selectedPersonId) {
      const p = contacts.find((c) => c.id === selectedPersonId);
      if (p) setPersonName(p.name);
    }
  }, [selectedPersonId, contacts]);

  const handleSave = () => {
    const num = parseFloat(amountStr) || 0;
    if (num <= 0 || !personName.trim()) {
      haptics.warning();
      return;
    }
    haptics.success();
    addLedgerEntry(personName, num, direction, note);
    setPersonName('');
    setAmountStr('');
    setNote('');
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.eyebrow}>{t('newEntry')}</Text>
              <Text style={styles.title}>{t('addToLedger')}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Person Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t('personLabel')}</Text>
              <TextInput
                value={personName}
                onChangeText={setPersonName}
                placeholder={t('personPlaceholder')}
                placeholderTextColor={Colors.inkSoft}
                style={styles.textInput}
              />
            </View>

            {/* Direction Dual-Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  haptics.selection();
                  setDirection('LENT');
                }}
                style={[styles.toggleBtn, direction === 'LENT' && styles.toggleLentSelected]}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    direction === 'LENT' && styles.toggleBtnTextSelected,
                  ]}
                >
                  {t('iLent')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  haptics.selection();
                  setDirection('BORROWED');
                }}
                style={[styles.toggleBtn, direction === 'BORROWED' && styles.toggleBorrowedSelected]}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    direction === 'BORROWED' && styles.toggleBtnTextSelected,
                  ]}
                >
                  {t('iBorrowed')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={styles.curLabel}>{t('amountLabel')}</Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  value={amountStr}
                  onChangeText={setAmountStr}
                  keyboardType="numeric"
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.line}
                />
              </View>

              {/* Quick Amount Increment Presets */}
              <View style={styles.quickAmountRow}>
                {[100, 500, 1000, 2000].map((increment) => (
                  <TouchableOpacity
                    key={increment}
                    activeOpacity={0.7}
                    onPress={() => {
                      haptics.selection();
                      const current = parseFloat(amountStr) || 0;
                      setAmountStr(String(current + increment));
                    }}
                    style={styles.quickAmountChip}
                  >
                    <Text style={styles.quickAmountText}>+{increment}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{t('noteOptional')}</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('noteLedgerPlaceholder')}
                placeholderTextColor={Colors.inkSoft}
                style={styles.textInput}
              />
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.88} onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{t('saveEntry')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

