import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import {
  X,
  Calendar as CalendarIcon,
  Check,
  ArrowUpRight,
  DollarSign,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { ProjectPayment } from '../../../types';
import { formatMonthLabel } from '../../../components/MonthPickerModal';
import { styles } from './ProjectDetailModal.styles';

export interface ProjectPaymentItemProps {
  payment: ProjectPayment;
  isEditing: boolean;
  editAmountStr: string;
  setEditAmountStr: (val: string) => void;
  editYear: number;
  editMonth: number;
  onOpenMonthPicker: () => void;
  editNote: string;
  setEditNote: (val: string) => void;
  editMethod?: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque';
  setEditMethod: (m: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque') => void;
  editBridge: boolean;
  setEditBridge: (b: boolean) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onStartEdit: (payment: ProjectPayment) => void;
  onDeletePayment: (payment: ProjectPayment) => void;
}

export const ProjectPaymentItem: React.FC<ProjectPaymentItemProps> = ({
  payment,
  isEditing,
  editAmountStr,
  setEditAmountStr,
  editYear,
  editMonth,
  onOpenMonthPicker,
  editNote,
  setEditNote,
  editMethod,
  setEditMethod,
  editBridge,
  setEditBridge,
  onCancelEdit,
  onSaveEdit,
  onStartEdit,
  onDeletePayment,
}) => {
  return (
    <View style={styles.paymentCard}>
      {isEditing ? (
        /* Inline Payment Edit Form */
        <View style={styles.inlineEditPaymentCard}>
          <View style={styles.inlineEditHeaderRow}>
            <Text style={styles.inlineEditTitle}>Edit Payment Milestone</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancelEdit}
              style={styles.closeInlineEditBtn}
            >
              <X size={16} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>AMOUNT RECEIVED (₹) *</Text>
            <TextInput
              value={editAmountStr}
              onChangeText={setEditAmountStr}
              keyboardType="numeric"
              placeholder="e.g. 6000"
              placeholderTextColor={Colors.inkSoft}
              style={styles.amountInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PAYMENT MONTH</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onOpenMonthPicker}
              style={styles.monthSelectorBtn}
            >
              <View style={styles.monthSelectorLeft}>
                <CalendarIcon size={16} color={Colors.moss} />
                <Text style={styles.monthSelectorText}>
                  {formatMonthLabel(editYear, editMonth)}
                </Text>
              </View>
              <Text style={styles.changeText}>Change ▾</Text>
            </TouchableOpacity>
            <Text style={styles.subHint}>
              Assigns this milestone payment to a specific month in your Freelance Insights.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>NOTE / MILESTONE</Text>
            <TextInput
              value={editNote}
              onChangeText={setEditNote}
              placeholder="e.g. Advance payment, Milestone 2"
              placeholderTextColor={Colors.inkSoft}
              style={styles.input}
            />
          </View>

          {/* Payment Method Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>METHOD</Text>
            <View style={styles.methodGrid}>
              {(['UPI', 'Bank Transfer', 'Cash', 'Cheque'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  activeOpacity={0.7}
                  onPress={() => setEditMethod(m)}
                  style={[
                    styles.methodChip,
                    editMethod === m && styles.methodChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.methodChipText,
                      editMethod === m && styles.methodChipTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bridge to income checkbox */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setEditBridge(!editBridge)}
            style={styles.bridgeCheckboxRow}
          >
            <View
              style={[
                styles.checkbox,
                editBridge && styles.checkboxActive,
              ]}
            >
              {editBridge && <Check size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.bridgeTitle}>Bridge to Monthly Personal Income</Text>
          </TouchableOpacity>

          <View style={styles.editBtnRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancelEdit}
              style={styles.editCancelBtn}
            >
              <Text style={styles.editCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onSaveEdit}
              style={styles.editSaveBtn}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.editSaveBtnText}>Save Milestone</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.paymentLeft}>
            <View style={styles.paymentIconBadge}>
              <ArrowUpRight size={16} color={Colors.moss} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentNote}>{payment.note}</Text>
              <Text style={styles.paymentMeta}>
                {payment.date ? new Date(payment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Logged payment'} • {payment.method}
              </Text>
              {payment.recordedAsIncome && (
                <View style={styles.incomeBadge}>
                  <DollarSign size={10} color={Colors.moss} />
                  <Text style={styles.incomeBadgeText}>Personal Income Bridge</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.paymentRightCol}>
            <Text style={styles.paymentAmount}>+₹{payment.amount.toLocaleString()}</Text>
            <View style={styles.paymentActionsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onStartEdit(payment)}
                style={styles.paymentActionIconBtn}
              >
                <Pencil size={13} color={Colors.inkSoft} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onDeletePayment(payment)}
                style={styles.paymentActionIconBtn}
              >
                <Trash2 size={13} color={Colors.brick} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};
