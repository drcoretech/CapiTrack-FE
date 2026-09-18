import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Trash2, MessageSquare, Check, Plus, Briefcase, ArrowUpRight, DollarSign } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useAppStore } from '../../../store/useAppStore';
import { ProjectPayment } from '../../../types';

export const ProjectDetailModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const selectedProjectId = useAppStore((state) => state.selectedProjectId);
  const clientProjects = useAppStore((state) => state.clientProjects);
  const closeModal = useAppStore((state) => state.closeModal);
  const addProjectPayment = useAppStore((state) => state.addProjectPayment);
  const deleteClientProject = useAppStore((state) => state.deleteClientProject);

  const isVisible = activeModal === 'project_detail';
  const project = clientProjects.find((p) => p.id === selectedProjectId);

  // New payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmountStr, setPayAmountStr] = useState('');
  const [payMethod, setPayMethod] = useState<ProjectPayment['method']>('UPI');
  const [payNote, setPayNote] = useState('');
  const [bridgeToIncome, setBridgeToIncome] = useState(true);

  if (!project) return null;

  const totalReceived = project.payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingDue = Math.max(0, project.totalValue - totalReceived);
  const pctPaid =
    project.totalValue > 0
      ? Math.min(100, Math.round((totalReceived / project.totalValue) * 100))
      : 100;
  const isCompleted = pendingDue === 0;

  const handleSendWhatsApp = async () => {
    const cleanPhone = (project.clientPhone || '').replace(/[^0-9]/g, '');
    const message = `Hi ${project.clientName} team, hope you are doing well!\n\nThis is a friendly update regarding your project "${project.projectTitle}".\n\n• Agreed Deal Value: ₹${project.totalValue.toLocaleString()}\n• Balance Pending: ₹${pendingDue.toLocaleString()}\n\nPlease transfer at your convenience and share the confirmation screenshot. Thank you!`;
    const encoded = encodeURIComponent(message);
    const url = cleanPhone
      ? `whatsapp://send?phone=${cleanPhone}&text=${encoded}`
      : `whatsapp://send?text=${encoded}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://wa.me/${cleanPhone}?text=${encoded}`);
      }
    } catch {
      Alert.alert('WhatsApp Error', 'Could not open WhatsApp. Please ensure WhatsApp is installed.');
    }
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(payAmountStr);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    await addProjectPayment(
      project.id,
      amount,
      payNote.trim() || `${payMethod} Payment`,
      payMethod,
      bridgeToIncome
    );

    setPayAmountStr('');
    setPayNote('');
    setShowPaymentForm(false);
    Keyboard.dismiss();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.projectTitle}"? All recorded milestone payments will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteClientProject(project.id);
          },
        },
      ]
    );
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
          style={{ flex: 1 }}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.iconButton}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Client Project Contract</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} style={styles.iconButton}>
              <Trash2 size={18} color={Colors.brick} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Project Hero Header */}
            <View style={styles.hero}>
              <View style={styles.heroIconBadge}>
                <Briefcase size={26} color={Colors.moss} />
              </View>
              <Text style={styles.clientName}>{project.clientName}</Text>
              <Text style={styles.projectTitle}>{project.projectTitle}</Text>
              {project.clientPhone ? (
                <Text style={styles.clientPhone}>📞 {project.clientPhone}</Text>
              ) : null}

              <View
                style={[
                  styles.statusBadge,
                  isCompleted ? styles.statusBadgeCompleted : styles.statusBadgePending,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isCompleted ? styles.statusTextCompleted : styles.statusTextPending,
                  ]}
                >
                  {isCompleted ? 'Fully Settled & Paid ✅' : `₹${pendingDue.toLocaleString()} Due ⏳`}
                </Text>
              </View>
            </View>

            {/* Financial Overview Card */}
            <View style={styles.overviewCard}>
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>DEAL VALUE</Text>
                  <Text style={styles.metricValue}>₹{project.totalValue.toLocaleString()}</Text>
                </View>
                <View style={[styles.metricItem, styles.metricBorder]}>
                  <Text style={styles.metricLabel}>RECEIVED</Text>
                  <Text style={[styles.metricValue, { color: Colors.moss }]}>
                    ₹{totalReceived.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>PENDING</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: isCompleted ? Colors.moss : Colors.brick },
                    ]}
                  >
                    ₹{pendingDue.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${pctPaid}%`,
                        backgroundColor: isCompleted ? Colors.moss : Colors.amber,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>{pctPaid}% Collected</Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionsRow}>
              {pendingDue > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSendWhatsApp}
                  style={styles.whatsAppBtn}
                >
                  <MessageSquare size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.whatsAppBtnText}>Send WhatsApp Reminder</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setShowPaymentForm(!showPaymentForm);
                  if (!payAmountStr && pendingDue > 0) {
                    setPayAmountStr(pendingDue.toString());
                  }
                }}
                style={[
                  styles.recordPaymentBtn,
                  pendingDue === 0 && { flex: 1, backgroundColor: Colors.card, borderColor: Colors.line },
                ]}
              >
                <Plus size={16} color={pendingDue === 0 ? Colors.ink : '#FFFFFF'} style={{ marginRight: 6 }} />
                <Text
                  style={[
                    styles.recordPaymentBtnText,
                    pendingDue === 0 && { color: Colors.ink },
                  ]}
                >
                  {showPaymentForm ? 'Hide Payment Form' : 'Record Payment'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Record Payment Form Sheet */}
            {showPaymentForm && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Record Milestone Payment</Text>
                <Text style={styles.formSub}>
                  Enter the amount received from {project.clientName}.
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>AMOUNT RECEIVED (₹) *</Text>
                  <TextInput
                    value={payAmountStr}
                    onChangeText={setPayAmountStr}
                    keyboardType="numeric"
                    placeholder="e.g. 6000"
                    placeholderTextColor={Colors.inkSoft}
                    style={styles.amountInput}
                  />
                </View>

                {/* Payment Method Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>PAYMENT METHOD</Text>
                  <View style={styles.methodRow}>
                    {(['UPI', 'Bank Transfer', 'Cash', 'Cheque'] as const).map((m) => (
                      <TouchableOpacity
                        key={m}
                        activeOpacity={0.7}
                        onPress={() => setPayMethod(m)}
                        style={[
                          styles.methodChip,
                          payMethod === m && styles.methodChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.methodChipText,
                            payMethod === m && styles.methodChipTextActive,
                          ]}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Payment Note */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>MILESTONE / NOTE</Text>
                  <TextInput
                    value={payNote}
                    onChangeText={setPayNote}
                    placeholder="e.g. Final milestone payment after launch"
                    placeholderTextColor={Colors.inkSoft}
                    style={styles.input}
                  />
                </View>

                {/* Income Bridge Checkbox */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setBridgeToIncome(!bridgeToIncome)}
                  style={styles.bridgeCheckboxRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      bridgeToIncome && styles.checkboxActive,
                    ]}
                  >
                    {bridgeToIncome && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.bridgeTitle}>Bridge to Monthly Personal Income</Text>
                    <Text style={styles.bridgeSub}>
                      Counts this business payment as personal income for this month's cashflow.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Submit Payment */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleRecordPayment}
                  style={styles.submitPaymentBtn}
                >
                  <Check size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitPaymentBtnText}>Save Milestone Payment</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Payment History Section */}
            <View style={styles.historySection}>
              <Text style={styles.historyHeader}>
                PAYMENT MILESTONES ({project.payments.length})
              </Text>

              {project.payments.length === 0 ? (
                <View style={styles.emptyHistoryCard}>
                  <Text style={styles.emptyHistoryText}>No payments recorded yet.</Text>
                </View>
              ) : (
                project.payments.map((payment) => (
                  <View key={payment.id} style={styles.paymentCard}>
                    <View style={styles.paymentLeft}>
                      <View style={styles.paymentIconBadge}>
                        <ArrowUpRight size={16} color={Colors.moss} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.paymentNote}>{payment.note}</Text>
                        <Text style={styles.paymentMeta}>
                          {payment.date} • {payment.method}
                        </Text>
                        {payment.recordedAsIncome && (
                          <View style={styles.incomeBadge}>
                            <DollarSign size={10} color={Colors.moss} />
                            <Text style={styles.incomeBadgeText}>Personal Income Bridge</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text style={styles.paymentAmount}>+₹{payment.amount.toLocaleString()}</Text>
                  </View>
                ))
              )}
            </View>

            {/* Project Notes Section */}
            {project.notes ? (
              <View style={styles.notesSection}>
                <Text style={styles.historyHeader}>CONTRACT NOTES</Text>
                <View style={styles.notesCard}>
                  <Text style={styles.notesText}>{project.notes}</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  iconButton: {
    padding: 6,
  },
  topBarTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  heroIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontFamily: Fonts.serifMedium,
    fontSize: 24,
    color: Colors.ink,
    textAlign: 'center',
  },
  projectTitle: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.inkSoft,
    marginTop: 4,
    textAlign: 'center',
  },
  clientPhone: {
    fontFamily: Fonts.monoRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  statusBadgePending: {
    backgroundColor: Colors.amberLight,
  },
  statusBadgeCompleted: {
    backgroundColor: Colors.mossLight,
  },
  statusBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  statusTextPending: {
    color: Colors.amber,
  },
  statusTextCompleted: {
    color: Colors.moss,
  },
  overviewCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.line,
  },
  metricLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    color: Colors.inkSoft,
    letterSpacing: 0.8,
  },
  metricValue: {
    fontFamily: Fonts.serifMedium,
    fontSize: 17,
    color: Colors.ink,
    marginTop: 4,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.line,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  whatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 12,
  },
  whatsAppBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  recordPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.moss,
  },
  recordPaymentBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.mossLight,
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  formTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    color: Colors.ink,
  },
  formSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
    marginTop: -8,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    color: Colors.inkSoft,
    letterSpacing: 0.9,
  },
  amountInput: {
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.serifMedium,
    fontSize: 20,
    color: Colors.ink,
  },
  input: {
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
  },
  methodChipActive: {
    backgroundColor: Colors.mossLight,
    borderColor: Colors.moss,
  },
  methodChipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  methodChipTextActive: {
    color: Colors.moss,
    fontFamily: Fonts.sansSemiBold,
  },
  bridgeCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.mossLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: Colors.moss,
  },
  bridgeTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  bridgeSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
    lineHeight: 15,
  },
  submitPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 4,
  },
  submitPaymentBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  historySection: {
    gap: 10,
    marginTop: 6,
  },
  historyHeader: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    letterSpacing: 1,
    color: Colors.inkSoft,
  },
  emptyHistoryCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 18,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    padding: 14,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  paymentIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentNote: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
  },
  paymentMeta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  incomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.mossLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  incomeBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    color: Colors.moss,
  },
  paymentAmount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 16,
    color: Colors.moss,
  },
  notesSection: {
    gap: 8,
  },
  notesCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    padding: 14,
  },
  notesText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    lineHeight: 18,
  },
});
