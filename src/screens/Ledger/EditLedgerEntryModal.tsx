import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Trash2 } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';

import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

export const EditLedgerEntryModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const editingLedgerTxn = useAppStore((state) => state.editingLedgerTxn);
  const contacts = useAppStore((state) => state.contacts);
  const closeModal = useAppStore((state) => state.closeModal);
  const updateLedgerEntry = useAppStore((state) => state.updateLedgerEntry);
  const deleteLedgerEntry = useAppStore((state) => state.deleteLedgerEntry);
  const { t } = useTranslation();

  const [personName, setPersonName] = useState('');
  const [direction, setDirection] = useState<'LENT' | 'BORROWED'>('LENT');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isVisible = activeModal === 'edit_ledger_entry' && !!editingLedgerTxn;

  useEffect(() => {
    if (editingLedgerTxn) {
      const contact = contacts.find((c) => c.id === editingLedgerTxn.personId);
      setPersonName(contact ? contact.name : '');
      const txn = editingLedgerTxn.txn;
      setDirection(txn.direction === 'BORROWED' ? 'BORROWED' : 'LENT');
      setAmountStr(txn.amount ? String(txn.amount) : '');
      setNote(txn.note || '');
      setShowDeleteConfirm(false);
    }
  }, [editingLedgerTxn, contacts]);

  const handleSave = () => {
    if (!editingLedgerTxn) return;
    const num = parseFloat(amountStr) || 0;
    if (num <= 0 || !personName.trim()) {
      Alert.alert('Invalid Entry', 'Please enter a valid amount and person name.');
      return;
    }

    updateLedgerEntry(editingLedgerTxn.personId, editingLedgerTxn.txn.id, {
      personName: personName.trim(),
      amount: num,
      direction,
      note: note.trim(),
    });

    Keyboard.dismiss();
    closeModal();
  };

  const handleConfirmDelete = () => {
    if (!editingLedgerTxn) return;
    deleteLedgerEntry(editingLedgerTxn.personId, editingLedgerTxn.txn.id);
    setShowDeleteConfirm(false);
    closeModal();
  };

  if (!editingLedgerTxn) return null;

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
              <Text style={styles.eyebrow}>EDIT ENTRY</Text>
              <Text style={styles.title}>Edit Lent / Borrowed</Text>
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
            {/* Person Name Input */}
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
                onPress={() => setDirection('LENT')}
                style={[styles.toggleBtn, direction === 'LENT' && styles.toggleLentSelected]}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    direction === 'LENT' && styles.toggleBtnTextSelected,
                  ]}
                >
                  {t('iLent')} (+)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setDirection('BORROWED')}
                style={[styles.toggleBtn, direction === 'BORROWED' && styles.toggleBorrowedSelected]}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    direction === 'BORROWED' && styles.toggleBtnTextSelected,
                  ]}
                >
                  {t('iBorrowed')} (-)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={styles.curLabel}>{t('amountLabel')}</Text>
              <TextInput
                value={amountStr}
                onChangeText={setAmountStr}
                keyboardType="numeric"
                style={styles.amountInput}
                placeholder="1000"
                placeholderTextColor={Colors.line}
              />
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

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowDeleteConfirm(true)}
              style={styles.deleteBtn}
            >
              <Trash2 size={18} color={Colors.brick} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSave}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Custom Confirmation Modal for Deletion */}
        <ConfirmDeleteModal
          visible={showDeleteConfirm}
          title="Delete Entry?"
          message="Are you sure you want to delete this lent/borrowed entry? Your contact balance will be updated automatically."
          itemBadge={`${direction === 'LENT' ? 'I Lent' : 'I Borrowed'} ₹${amountStr} · ${personName}`}
          confirmLabel="Delete Entry"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
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
  avoidingView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  eyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    color: Colors.ink,
    marginTop: 2,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: Colors.inkSoft,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleLentSelected: {
    backgroundColor: Colors.moss,
  },
  toggleBorrowedSelected: {
    backgroundColor: Colors.brick,
  },
  toggleBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  toggleBtnTextSelected: {
    fontFamily: Fonts.sansSemiBold,
    color: '#FFFFFF',
  },
  amountContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  curLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  amountInput: {
    fontFamily: Fonts.serifMedium,
    fontSize: 32,
    color: Colors.ink,
    marginTop: 4,
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    gap: 12,
    backgroundColor: Colors.mist,
  },
  deleteBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#FADBD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
