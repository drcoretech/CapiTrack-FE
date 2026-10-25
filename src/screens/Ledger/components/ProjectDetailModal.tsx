import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { styles } from './ProjectDetailModal.styles';
import { ProjectOverviewCard } from './ProjectOverviewCard';
import { ProjectPaymentItem } from './ProjectPaymentItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Trash2, Check, Plus, Briefcase, Calendar as CalendarIcon, Pencil } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useAppStore } from '../../../store/useAppStore';
import { ProjectPayment } from '../../../types';
import { useKeyboard } from '../../../hooks/useKeyboard';
import { MonthPickerModal, formatMonthLabel } from '../../../components/MonthPickerModal';

export const ProjectDetailModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const selectedProjectId = useAppStore((state) => state.selectedProjectId);
  const clientProjects = useAppStore((state) => state.clientProjects);
  const closeModal = useAppStore((state) => state.closeModal);
  const addProjectPayment = useAppStore((state) => state.addProjectPayment);
  const updateClientProject = useAppStore((state) => state.updateClientProject);
  const updateProjectPayment = useAppStore((state) => state.updateProjectPayment);
  const deleteProjectPayment = useAppStore((state) => state.deleteProjectPayment);
  const deleteClientProject = useAppStore((state) => state.deleteClientProject);

  const isVisible = activeModal === 'project_detail';
  const project = clientProjects.find((p) => p.id === selectedProjectId);

  // New payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmountStr, setPayAmountStr] = useState('');
  const [payMethod, setPayMethod] = useState<ProjectPayment['method']>('UPI');
  const [payNote, setPayNote] = useState('');
  const [bridgeToIncome, setBridgeToIncome] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Edit project state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editClientName, setEditClientName] = useState('');
  const [editProjectTitle, setEditProjectTitle] = useState('');
  const [editTotalValueStr, setEditTotalValueStr] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editProjectYear, setEditProjectYear] = useState(now.getFullYear());
  const [editProjectMonth, setEditProjectMonth] = useState(now.getMonth() + 1);
  const [showEditProjectMonthPicker, setShowEditProjectMonthPicker] = useState(false);

  // Edit milestone payment state
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPayAmountStr, setEditPayAmountStr] = useState('');
  const [editPayNote, setEditPayNote] = useState('');
  const [editPayMethod, setEditPayMethod] = useState<ProjectPayment['method']>('UPI');
  const [editPayBridge, setEditPayBridge] = useState(true);
  const [editPayYear, setEditPayYear] = useState(now.getFullYear());
  const [editPayMonth, setEditPayMonth] = useState(now.getMonth() + 1);
  const [showEditPayMonthPicker, setShowEditPayMonthPicker] = useState(false);

  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  React.useEffect(() => {
    if (project) {
      setEditClientName(project.clientName);
      setEditProjectTitle(project.projectTitle);
      setEditTotalValueStr(project.totalValue.toString());
      setEditNotes(project.notes || '');
      const d = project.createdAt ? new Date(project.createdAt) : new Date();
      if (!isNaN(d.getTime())) {
        setEditProjectYear(d.getFullYear());
        setEditProjectMonth(d.getMonth() + 1);
      }
    }
  }, [project?.id, project?.totalValue, project?.clientName, project?.projectTitle, project?.notes, project?.createdAt]);

  if (!project) return null;

  const totalReceived = project.payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingDue = Math.max(0, project.totalValue - totalReceived);
  const pctPaid =
    project.totalValue > 0
      ? Math.min(100, Math.round((totalReceived / project.totalValue) * 100))
      : 100;
  const isCompleted = pendingDue === 0;

  const handleRecordPayment = async () => {
    const amount = parseFloat(payAmountStr);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    const paymentDate = new Date(selectedYear, selectedMonth - 1, 15, 12, 0, 0).toISOString();

    await addProjectPayment(
      project.id,
      amount,
      payNote.trim() || `${payMethod} Payment`,
      payMethod,
      bridgeToIncome,
      paymentDate
    );

    setPayAmountStr('');
    setPayNote('');
    const resetDate = new Date();
    setSelectedYear(resetDate.getFullYear());
    setSelectedMonth(resetDate.getMonth() + 1);
    setShowPaymentForm(false);
    Keyboard.dismiss();
  };

  const handleSaveProjectEdits = async () => {
    const val = parseFloat(editTotalValueStr);
    if (!editClientName.trim() || isNaN(val) || val <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid client name and total contract value.');
      return;
    }
    const targetDate = new Date(editProjectYear, editProjectMonth - 1, 15, 12, 0, 0).toISOString();
    await updateClientProject(project.id, {
      clientName: editClientName.trim(),
      projectTitle: editProjectTitle.trim() || `${editClientName.trim()} Website Project`,
      totalValue: val,
      notes: editNotes.trim(),
      createdAt: targetDate,
    });
    setIsEditingProject(false);
    Keyboard.dismiss();
  };

  const startEditPayment = (payment: ProjectPayment) => {
    setEditingPaymentId(payment.id);
    setEditPayAmountStr(payment.amount.toString());
    setEditPayNote(payment.note || '');
    setEditPayMethod(payment.method || 'UPI');
    setEditPayBridge(payment.recordedAsIncome ?? true);
    const d = new Date(payment.date);
    if (!isNaN(d.getTime())) {
      setEditPayYear(d.getFullYear());
      setEditPayMonth(d.getMonth() + 1);
    } else {
      setEditPayYear(now.getFullYear());
      setEditPayMonth(now.getMonth() + 1);
    }
  };

  const handleSavePaymentEdit = async () => {
    if (!editingPaymentId) return;
    const amount = parseFloat(editPayAmountStr);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }
    const paymentDate = new Date(editPayYear, editPayMonth - 1, 15, 12, 0, 0).toISOString();
    await updateProjectPayment(project.id, editingPaymentId, {
      amount,
      note: editPayNote.trim() || `${editPayMethod} Payment`,
      method: editPayMethod,
      recordedAsIncome: editPayBridge,
      date: paymentDate,
    });
    setEditingPaymentId(null);
    Keyboard.dismiss();
  };

  const handleDeletePayment = (payment: ProjectPayment) => {
    Alert.alert(
      'Delete Payment Milestone',
      `Are you sure you want to remove this payment of ₹${payment.amount.toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProjectPayment(project.id, payment.id),
        },
      ]
    );
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditingProject(!isEditingProject)}
                style={[styles.iconButton, isEditingProject && { backgroundColor: Colors.mossLight, borderRadius: 8 }]}
              >
                <Pencil size={18} color={isEditingProject ? Colors.moss : Colors.inkSoft} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} style={styles.iconButton}>
                <Trash2 size={18} color={Colors.brick} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: isKeyboardVisible
                  ? (Platform.OS === 'android' ? keyboardHeight + 80 : 30)
                  : 40,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Project Hero or Edit Form */}
            {isEditingProject ? (
              <View style={styles.editProjectCard}>
                <View style={styles.editProjectHeaderRow}>
                  <Text style={styles.formTitle}>Edit Contract Details</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsEditingProject(false)}
                    style={styles.closeEditPill}
                  >
                    <Text style={styles.closeEditPillText}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                {/* Client / Company Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>CLIENT / COMPANY NAME *</Text>
                  <TextInput
                    value={editClientName}
                    onChangeText={setEditClientName}
                    placeholder="e.g. Audiology, Kemlite"
                    placeholderTextColor={Colors.inkSoft}
                    style={styles.input}
                  />
                </View>

                {/* Project Title */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>PROJECT TITLE</Text>
                  <TextInput
                    value={editProjectTitle}
                    onChangeText={setEditProjectTitle}
                    placeholder="e.g. Website Development"
                    placeholderTextColor={Colors.inkSoft}
                    style={styles.input}
                  />
                </View>

                {/* Deal Value */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>TOTAL CONTRACT / DEAL VALUE (₹) *</Text>
                  <TextInput
                    value={editTotalValueStr}
                    onChangeText={setEditTotalValueStr}
                    keyboardType="numeric"
                    placeholder="12000"
                    placeholderTextColor={Colors.inkSoft}
                    style={styles.amountInput}
                  />
                </View>

                {/* Contract Month Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>CONTRACT / SIGNING MONTH</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowEditProjectMonthPicker(true)}
                    style={styles.monthSelectorBtn}
                  >
                    <View style={styles.monthSelectorLeft}>
                      <CalendarIcon size={18} color={Colors.moss} />
                      <Text style={styles.monthSelectorText}>
                        {formatMonthLabel(editProjectYear, editProjectMonth)}
                      </Text>
                    </View>
                    <Text style={styles.changeText}>Change ▾</Text>
                  </TouchableOpacity>
                  <Text style={styles.subHint}>
                    Sets which month this project contract belongs to in your Freelance Insights.
                  </Text>
                </View>

                {/* Notes */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>CONTRACT NOTES / SCOPE</Text>
                  <TextInput
                    value={editNotes}
                    onChangeText={setEditNotes}
                    placeholder="Scope, deliverable details, payment terms..."
                    placeholderTextColor={Colors.inkSoft}
                    multiline
                    numberOfLines={3}
                    style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
                  />
                </View>

                {/* Save Button */}
                <View style={styles.editBtnRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsEditingProject(false)}
                    style={styles.editCancelBtn}
                  >
                    <Text style={styles.editCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSaveProjectEdits}
                    style={styles.editSaveBtn}
                  >
                    <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.editSaveBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Project Hero Header */
              <View style={styles.hero}>
                <View style={styles.heroIconBadge}>
                  <Briefcase size={26} color={Colors.moss} />
                </View>
                <Text style={styles.clientName}>{project.clientName}</Text>
                <Text style={styles.projectTitle}>{project.projectTitle}</Text>

                <View style={styles.heroPillsRow}>
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
                      {isCompleted ? 'Fully Settled & Paid' : `₹${pendingDue.toLocaleString()} Due`}
                    </Text>
                  </View>

                  {project.createdAt && (
                    <View style={styles.contractDateBadge}>
                      <CalendarIcon size={12} color={Colors.inkSoft} />
                      <Text style={styles.contractDateBadgeText}>
                        {new Date(project.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Edit Contract Hero Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsEditingProject(true)}
                  style={styles.editContractHeroBtn}
                >
                  <Pencil size={13} color={Colors.moss} style={{ marginRight: 5 }} />
                  <Text style={styles.editContractHeroText}>Edit Contract Details</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Financial Overview Card */}
            <ProjectOverviewCard
              project={project}
              totalReceived={totalReceived}
              pendingDue={pendingDue}
              pctPaid={pctPaid}
              isCompleted={isCompleted}
              showPaymentForm={showPaymentForm}
              onTogglePaymentForm={() => {
                setShowPaymentForm(!showPaymentForm);
                if (!payAmountStr && pendingDue > 0) {
                  setPayAmountStr(pendingDue.toString());
                }
              }}
            />

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
                  <View style={styles.methodGrid}>
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
                          numberOfLines={1}
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

                {/* Optional Payment Month Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>PAYMENT MONTH (OPTIONAL)</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowMonthPicker(true)}
                    style={styles.monthSelectorBtn}
                  >
                    <View style={styles.monthSelectorLeft}>
                      <CalendarIcon size={18} color={Colors.moss} />
                      <Text style={styles.monthSelectorText}>
                        {formatMonthLabel(selectedYear, selectedMonth)}
                      </Text>
                    </View>
                    <Text style={styles.changeText}>Change</Text>
                  </TouchableOpacity>
                  <Text style={styles.subHint}>
                    Defaults to current month. Change if payment was received in a prior month (e.g. July).
                  </Text>
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
                  <ProjectPaymentItem
                    key={payment.id}
                    payment={payment}
                    isEditing={editingPaymentId === payment.id}
                    editAmountStr={editPayAmountStr}
                    setEditAmountStr={setEditPayAmountStr}
                    editYear={editPayYear}
                    editMonth={editPayMonth}
                    onOpenMonthPicker={() => setShowEditPayMonthPicker(true)}
                    editNote={editPayNote}
                    setEditNote={setEditPayNote}
                    editMethod={editPayMethod}
                    setEditMethod={setEditPayMethod}
                    editBridge={editPayBridge}
                    setEditBridge={setEditPayBridge}
                    onCancelEdit={() => setEditingPaymentId(null)}
                    onSaveEdit={handleSavePaymentEdit}
                    onStartEdit={startEditPayment}
                    onDeletePayment={handleDeletePayment}
                  />
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

      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.deleteIconCircle}>
              <Trash2 size={24} color={Colors.brick} />
            </View>
            <Text style={styles.confirmTitle}>Delete Project?</Text>
            <Text style={styles.confirmSub}>
              Are you sure you want to delete{' '}
              <Text style={{ fontWeight: '700', color: Colors.ink }}>
                "{project.projectTitle}"
              </Text>
              ? All recorded milestone payments and contract history will be permanently deleted.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  deleteClientProject(project.id);
                }}
                style={styles.confirmDeleteBtn}
              >
                <Trash2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.confirmDeleteText}>Yes, Delete Project</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowDeleteConfirm(false)}
                style={styles.confirmCancelBtn}
              >
                <Text style={styles.confirmCancelText}>Cancel / Keep Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <MonthPickerModal
        visible={showMonthPicker}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelectMonth={(year, month) => {
          setSelectedYear(year);
          setSelectedMonth(month);
          setShowMonthPicker(false);
        }}
        onClose={() => setShowMonthPicker(false)}
      />

      <MonthPickerModal
        visible={showEditProjectMonthPicker}
        selectedYear={editProjectYear}
        selectedMonth={editProjectMonth}
        onSelectMonth={(year, month) => {
          setEditProjectYear(year);
          setEditProjectMonth(month);
          setShowEditProjectMonthPicker(false);
        }}
        onClose={() => setShowEditProjectMonthPicker(false)}
      />

      <MonthPickerModal
        visible={showEditPayMonthPicker}
        selectedYear={editPayYear}
        selectedMonth={editPayMonth}
        onSelectMonth={(year, month) => {
          setEditPayYear(year);
          setEditPayMonth(month);
          setShowEditPayMonthPicker(false);
        }}
        onClose={() => setShowEditPayMonthPicker(false)}
      />
    </Modal>
  );
};


