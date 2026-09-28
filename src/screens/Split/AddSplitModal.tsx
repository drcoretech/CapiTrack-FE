import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Users,
  Check,
  Plus,
  Trash2,
  Receipt,
  UserCheck,
  Zap,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { ExpenseCategory, SplitParticipant } from '../../types';

const CATEGORIES: ExpenseCategory[] = ['Food', 'Travel', 'Fun', 'Grocery', 'Bills', 'Shopping', 'Custom'];

export const AddSplitModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const addSplitBill = useAppStore((state) => state.addSplitBill);
  const contacts = useAppStore((state) => state.contacts);
  const userName = useAppStore((state) => state.userName) || 'You';

  const isVisible = activeModal === 'add_split';

  // Form State
  const [title, setTitle] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [payerMode, setPayerMode] = useState<'YOU' | 'OTHER'>('YOU');
  const [otherPayerName, setOtherPayerName] = useState('');
  const [otherPayerUpi, setOtherPayerUpi] = useState('');
  const [splitMode, setSplitMode] = useState<'EQUAL' | 'EXACT'>('EQUAL');
  const [syncWithLedger, setSyncWithLedger] = useState(true);

  // Participants list (Always starts with Current User)
  const [participants, setParticipants] = useState<
    Array<{ id: string; name: string; upiId?: string; amount: number; isCurrentUser?: boolean }>
  >([
    {
      id: 'user_me',
      name: 'You',
      amount: 0,
      isCurrentUser: true,
    },
  ]);

  // Quick add contact input
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberUpi, setNewMemberUpi] = useState('');
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);

  const totalAmount = parseFloat(totalAmountStr) || 0;

  // Compute equal split distribution whenever total or members change
  const computedParticipants = useMemo(() => {
    if (splitMode === 'EXACT') return participants;

    const count = participants.length;
    if (count === 0 || totalAmount <= 0) {
      return participants.map((p) => ({ ...p, amount: 0 }));
    }

    const share = Math.floor(totalAmount / count);
    const remainder = totalAmount - share * count;

    return participants.map((p, idx) => ({
      ...p,
      // Payer or first person takes remainder so sum is exactly totalAmount
      amount: idx === 0 ? share + remainder : share,
    }));
  }, [participants, totalAmount, splitMode]);

  const handleAddMember = (name: string, upiId?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (participants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Already Added', `${trimmed} is already in this split.`);
      return;
    }

    const newPart = {
      id: 'part_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      name: trimmed,
      upiId: upiId ? upiId.trim() : undefined,
      amount: 0,
      isCurrentUser: false,
    };

    setParticipants([...participants, newPart]);
    setNewMemberName('');
    setNewMemberUpi('');
    setShowAddMemberInput(false);
  };

  const handleRemoveMember = (id: string) => {
    if (participants.length <= 1) {
      Alert.alert('Minimum 1 Member', 'A split needs at least 2 participants.');
      return;
    }
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleExactAmountChange = (id: string, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, amount: val } : p))
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for this split bill (e.g. "Dinner").');
      return;
    }

    if (totalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bill amount.');
      return;
    }

    if (participants.length < 2) {
      Alert.alert('Add Friends', 'Please add at least 1 friend to split this bill with.');
      return;
    }

    const finalParts: SplitParticipant[] = computedParticipants.map((p) => {
      const isPaid =
        payerMode === 'YOU'
          ? Boolean(p.isCurrentUser) // user paid, so user's share is paid
          : p.name.toLowerCase() === otherPayerName.trim().toLowerCase(); // payer's share is paid

      return {
        id: p.id,
        name: p.isCurrentUser ? userName : p.name,
        upiId: p.upiId,
        amount: p.amount,
        isPaid,
        paidAt: isPaid ? new Date().toISOString() : undefined,
        isCurrentUser: Boolean(p.isCurrentUser),
      };
    });

    // Check sum if in exact mode
    if (splitMode === 'EXACT') {
      const currentSum = finalParts.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(currentSum - totalAmount) > 1) {
        Alert.alert(
          'Split Amount Mismatch',
          `The sum of individual shares (₹${currentSum}) does not match the total bill amount (₹${totalAmount}).`
        );
        return;
      }
    }

    const payer =
      payerMode === 'YOU'
        ? {
            participantId: 'user_me',
            name: userName,
            isCurrentUser: true,
          }
        : {
            participantId: 'payer_' + Date.now(),
            name: otherPayerName.trim() || 'Friend',
            isCurrentUser: false,
            upiId: otherPayerUpi.trim() || undefined,
          };

    await addSplitBill(
      {
        title: title.trim(),
        totalAmount,
        category,
        date: 'Today',
        paidBy: payer,
        splitType: splitMode,
        participants: finalParts,
      },
      syncWithLedger
    );

    // Reset state
    setTitle('');
    setTotalAmountStr('');
    setPayerMode('YOU');
    setOtherPayerName('');
    setOtherPayerUpi('');
    closeModal();
  };

  if (!isVisible) return null;

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
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.iconBtn}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>New Split Bill</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSave} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Bill Title & Total Amount */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>BILL DETAILS</Text>

              <TextInput
                style={styles.inputTitle}
                placeholder="What is this bill for? (e.g. Dinner, Trip)"
                placeholderTextColor={Colors.inkSoft + '70'}
                value={title}
                onChangeText={setTitle}
              />

              <View style={styles.amountInputRow}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={Colors.inkSoft + '50'}
                  keyboardType="numeric"
                  value={totalAmountStr}
                  onChangeText={setTotalAmountStr}
                />
              </View>

              {/* Category Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={{ gap: 8 }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.75}
                      onPress={() => setCategory(cat)}
                      style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Who Paid Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>WHO PAID THE BILL?</Text>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPayerMode('YOU')}
                  style={[styles.toggleBtn, payerMode === 'YOU' && styles.toggleBtnActive]}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      payerMode === 'YOU' && styles.toggleBtnTextActive,
                    ]}
                  >
                    I Paid (You)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPayerMode('OTHER')}
                  style={[styles.toggleBtn, payerMode === 'OTHER' && styles.toggleBtnActive]}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      payerMode === 'OTHER' && styles.toggleBtnTextActive,
                    ]}
                  >
                    Someone Else Paid
                  </Text>
                </TouchableOpacity>
              </View>

              {payerMode === 'OTHER' && (
                <View style={styles.otherPayerInputs}>
                  <TextInput
                    style={styles.inputRegular}
                    placeholder="Payer's name (e.g. Rahul)"
                    placeholderTextColor={Colors.inkSoft + '70'}
                    value={otherPayerName}
                    onChangeText={setOtherPayerName}
                  />
                  <TextInput
                    style={[styles.inputRegular, { marginTop: 8 }]}
                    placeholder="Payer's UPI ID (optional, e.g. rahul@upi)"
                    placeholderTextColor={Colors.inkSoft + '70'}
                    value={otherPayerUpi}
                    onChangeText={setOtherPayerUpi}
                    autoCapitalize="none"
                  />
                </View>
              )}
            </View>

            {/* Split Members Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>SPLIT WITH ({participants.length} MEMBERS)</Text>

                {/* Split Mode Toggle */}
                <View style={styles.modeToggle}>
                  <TouchableOpacity
                    onPress={() => setSplitMode('EQUAL')}
                    style={[styles.modeToggleItem, splitMode === 'EQUAL' && styles.modeToggleItemActive]}
                  >
                    <Text style={[styles.modeToggleText, splitMode === 'EQUAL' && styles.modeToggleTextActive]}>
                      Equal
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSplitMode('EXACT')}
                    style={[styles.modeToggleItem, splitMode === 'EXACT' && styles.modeToggleItemActive]}
                  >
                    <Text style={[styles.modeToggleText, splitMode === 'EXACT' && styles.modeToggleTextActive]}>
                      Exact
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Contacts Suggestion Chips */}
              {contacts.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Quick add from Khata:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {contacts.slice(0, 8).map((c) => {
                      const alreadyAdded = participants.some(
                        (p) => p.name.toLowerCase() === c.name.toLowerCase()
                      );
                      if (alreadyAdded) return null;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          activeOpacity={0.75}
                          onPress={() => handleAddMember(c.name)}
                          style={styles.contactChip}
                        >
                          <Plus size={12} color={Colors.moss} />
                          <Text style={styles.contactChipText}>{c.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Members List */}
              <View style={styles.membersList}>
                {computedParticipants.map((member) => (
                  <View key={member.id} style={styles.memberRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {(member.name || 'F')[0].toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.memberName}>
                        {member.name} {member.isCurrentUser ? '(You)' : ''}
                      </Text>
                      {member.upiId && (
                        <Text style={styles.memberUpiText}>{member.upiId}</Text>
                      )}
                    </View>

                    {splitMode === 'EQUAL' ? (
                      <View style={styles.equalAmountBadge}>
                        <Text style={styles.equalAmountText}>₹{member.amount}</Text>
                      </View>
                    ) : (
                      <View style={styles.exactAmountContainer}>
                        <Text style={styles.exactAmountPrefix}>₹</Text>
                        <TextInput
                          style={styles.exactAmountInput}
                          keyboardType="numeric"
                          value={String(member.amount || '')}
                          onChangeText={(v) => handleExactAmountChange(member.id, v)}
                        />
                      </View>
                    )}

                    {!member.isCurrentUser && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRemoveMember(member.id)}
                        style={styles.removeMemberBtn}
                      >
                        <Trash2 size={16} color={Colors.brick} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* Custom Add Member Input */}
              {showAddMemberInput ? (
                <View style={styles.addMemberBox}>
                  <TextInput
                    style={styles.inputRegular}
                    placeholder="Friend's Name"
                    placeholderTextColor={Colors.inkSoft + '70'}
                    value={newMemberName}
                    onChangeText={setNewMemberName}
                    autoFocus
                  />
                  <TextInput
                    style={[styles.inputRegular, { marginTop: 8 }]}
                    placeholder="Friend's UPI ID (optional, e.g. friend@upi)"
                    placeholderTextColor={Colors.inkSoft + '70'}
                    value={newMemberUpi}
                    onChangeText={setNewMemberUpi}
                    autoCapitalize="none"
                  />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowAddMemberInput(false)}
                      style={[styles.smallBtn, { backgroundColor: Colors.mist }]}
                    >
                      <Text style={{ color: Colors.inkSoft, fontFamily: Fonts.sansMedium }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleAddMember(newMemberName, newMemberUpi)}
                      style={[styles.smallBtn, { backgroundColor: Colors.moss }]}
                    >
                      <Text style={{ color: '#FFFFFF', fontFamily: Fonts.sansSemiBold }}>Add Member</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setShowAddMemberInput(true)}
                  style={styles.addMemberBtn}
                >
                  <Plus size={16} color={Colors.moss} />
                  <Text style={styles.addMemberBtnText}>Add Friend by Name / UPI</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sync with Ledger Checkbox */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSyncWithLedger(!syncWithLedger)}
              style={styles.syncCard}
            >
              <View style={[styles.checkbox, syncWithLedger && styles.checkboxActive]}>
                {syncWithLedger && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.syncTitle}>Sync with Ledger Khata</Text>
                <Text style={styles.syncSubtext}>
                  Automatically tracks who owes you in the Ledger tab so your overall balances stay updated.
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSave}
              style={styles.submitBtn}
            >
              <Text style={styles.submitBtnText}>
                Create Split Bill · ₹{totalAmount.toLocaleString()}
              </Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  topBarTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 17,
    color: Colors.ink,
  },
  doneBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: Colors.moss,
    borderRadius: 10,
  },
  doneBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputTitle: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    paddingVertical: 8,
    marginBottom: 12,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  currencyPrefix: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 32,
    color: Colors.moss,
    marginRight: 6,
  },
  amountInput: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 36,
    color: Colors.ink,
    flex: 1,
  },
  categoryScroll: {
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  categoryChipActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
  },
  categoryChipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
  },
  toggleBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
  },
  otherPayerInputs: {
    marginTop: 12,
  },
  inputRegular: {
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    backgroundColor: Colors.mist,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    color: Colors.ink,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.mist,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  modeToggleItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeToggleItemActive: {
    backgroundColor: Colors.card,
  },
  modeToggleText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  modeToggleTextActive: {
    color: Colors.ink,
    fontFamily: Fonts.sansSemiBold,
  },
  suggestionsContainer: {
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    marginBottom: 6,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  contactChipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11.5,
    color: Colors.moss,
  },
  membersList: {
    gap: 10,
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mist,
    borderRadius: 14,
    padding: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.moss,
  },
  memberName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
  },
  memberUpiText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  equalAmountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  equalAmountText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  exactAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 8,
  },
  exactAmountPrefix: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  exactAmountInput: {
    fontFamily: Fonts.monoMedium,
    fontSize: 13,
    color: Colors.ink,
    width: 60,
    paddingVertical: 4,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  removeMemberBtn: {
    padding: 6,
    marginLeft: 6,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.moss,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addMemberBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.moss,
  },
  addMemberBox: {
    backgroundColor: Colors.mist,
    padding: 12,
    borderRadius: 14,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  checkboxActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
  },
  syncTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
  },
  syncSubtext: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    lineHeight: 16,
    marginTop: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.card,
  },
  submitBtn: {
    backgroundColor: Colors.moss,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
