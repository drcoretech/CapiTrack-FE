import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Briefcase, Check } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useAppStore } from '../../../store/useAppStore';

export const AddProjectModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const addClientProject = useAppStore((state) => state.addClientProject);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [dealValueStr, setDealValueStr] = useState('12000');
  const [advanceStr, setAdvanceStr] = useState('6000');
  const [addToIncome, setAddToIncome] = useState(true);
  const [notes, setNotes] = useState('');

  const isVisible = activeModal === 'add_project';

  const handleSave = () => {
    const dealVal = parseFloat(dealValueStr) || 0;
    const advVal = parseFloat(advanceStr) || 0;
    if (!clientName.trim() || dealVal <= 0) return;

    addClientProject(
      {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        projectTitle: projectTitle.trim() || `${clientName.trim()} Website Project`,
        totalValue: dealVal,
        notes: notes.trim(),
      },
      advVal,
      addToIncome
    );

    setClientName('');
    setClientPhone('');
    setProjectTitle('');
    setDealValueStr('12000');
    setAdvanceStr('6000');
    setNotes('');
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
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Briefcase size={16} color={Colors.moss} />
              </View>
              <Text style={styles.title}>New Client Contract</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Client / Company Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CLIENT / COMPANY NAME *</Text>
              <TextInput
                value={clientName}
                onChangeText={setClientName}
                placeholder="e.g. Kemlite, Audiology"
                placeholderTextColor={Colors.inkSoft}
                style={styles.input}
              />
            </View>

            {/* Project Title */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PROJECT TITLE</Text>
              <TextInput
                value={projectTitle}
                onChangeText={setProjectTitle}
                placeholder="e.g. Website Development & Redesign"
                placeholderTextColor={Colors.inkSoft}
                style={styles.input}
              />
            </View>

            {/* Client Phone / WhatsApp */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CLIENT WHATSAPP NUMBER (FOR REMINDERS)</Text>
              <TextInput
                value={clientPhone}
                onChangeText={setClientPhone}
                placeholder="e.g. +91 98220 12345"
                placeholderTextColor={Colors.inkSoft}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* Deal Value */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>TOTAL CONTRACT / DEAL VALUE (₹) *</Text>
              <TextInput
                value={dealValueStr}
                onChangeText={setDealValueStr}
                placeholder="12000"
                placeholderTextColor={Colors.inkSoft}
                keyboardType="numeric"
                style={[styles.input, styles.numInput]}
              />
            </View>

            {/* Advance Milestone Payment */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>ADVANCE PAYMENT RECEIVED (₹)</Text>
              <TextInput
                value={advanceStr}
                onChangeText={setAdvanceStr}
                placeholder="0"
                placeholderTextColor={Colors.inkSoft}
                keyboardType="numeric"
                style={[styles.input, styles.numInput]}
              />
              <Text style={styles.subHint}>
                Leave as 0 if payment is pending. If paid, will record as 1st milestone.
              </Text>
            </View>

            {/* Income Bridge Toggle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAddToIncome(!addToIncome)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, addToIncome && styles.checkboxActive]}>
                {addToIncome && <Check size={14} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkboxTitle}>Bridge to Personal Income</Text>
                <Text style={styles.checkboxSub}>
                  Also reflect this advance payment as personal earnings on your monthly dashboard.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Project Notes */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PROJECT NOTES / SCOPE</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Deliverables, scope, or agreed milestones..."
                placeholderTextColor={Colors.inkSoft}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />
            </View>
          </ScrollView>

          {/* Bottom Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              style={[
                styles.saveBtn,
                (!clientName.trim() || !(parseFloat(dealValueStr) > 0)) && styles.saveBtnDisabled,
              ]}
              disabled={!clientName.trim() || !(parseFloat(dealValueStr) > 0)}
            >
              <Text style={styles.saveBtnText}>Save & Start Tracking Contract</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    color: Colors.ink,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  numInput: {
    fontFamily: Fonts.monoMedium,
    fontSize: 16,
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  subHint: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
  },
  checkboxTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  checkboxSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    lineHeight: 16,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.card,
  },
  saveBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
