import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Pencil, Trash2, Plus, Check, MessageSquare, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { shareWhatsAppReminder } from '../../services/upiPayment';

export const PersonDetailModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const selectedPersonId = useAppStore((state) => state.selectedPersonId);
  const contacts = useAppStore((state) => state.contacts);
  const userName = useAppStore((state) => state.userName);
  const closeModal = useAppStore((state) => state.closeModal);
  const openModal = useAppStore((state) => state.openModal);
  const setEditingLedgerTxn = useAppStore((state) => state.setEditingLedgerTxn);
  const deletePerson = useAppStore((state) => state.deletePerson);
  const settlePerson = useAppStore((state) => state.settlePerson);
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isVisible = activeModal === 'person_detail';
  const person = contacts.find((c) => c.id === selectedPersonId);

  if (!person) return null;

  const transactions = person.transactions || [];
  const isOwed = person.netBalance > 0;
  const isSettled = person.netBalance === 0;

  const handleSettle = () => {
    settlePerson(person.id);
  };

  const handleAddTxn = () => {
    openModal('add_ledger', person.id);
  };

  const handleWhatsAppReminder = () => {
    shareWhatsAppReminder({
      phone: (person as any).phone,
      friendName: person.name,
      amount: Math.abs(person.netBalance),
      billTitle: 'Pending Khata Balance',
      receiverName: userName || 'Friend',
    });
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.iconButton}>
            <X size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Khata Details</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (transactions.length > 0) {
                  setEditingLedgerTxn({ personId: person.id, txn: transactions[0] });
                }
              }}
              style={styles.iconButton}
            >
              <Pencil size={18} color={Colors.inkSoft} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDeleteConfirm(true)}
              style={[styles.iconButton, styles.deleteBtn]}
            >
              <Trash2 size={18} color={Colors.brick} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Person Hero */}
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{person.initial}</Text>
            </View>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personSub}>
              {transactions.length} recorded {transactions.length === 1 ? 'transaction' : 'transactions'}
            </Text>

            {/* Net Balance Card */}
            <View
              style={[
                styles.balanceCard,
                isOwed
                  ? styles.balanceCardOwed
                  : isSettled
                  ? styles.balanceCardSettled
                  : styles.balanceCardOwe,
              ]}
            >
              <View style={styles.balanceBadgeRow}>
                {isOwed ? (
                  <View style={[styles.badgePill, { backgroundColor: Colors.mossLight }]}>
                    <ArrowDownLeft size={12} color={Colors.moss} strokeWidth={2.6} />
                    <Text style={[styles.badgeText, { color: Colors.moss }]}>OWES YOU</Text>
                  </View>
                ) : isSettled ? (
                  <View style={[styles.badgePill, { backgroundColor: Colors.mist }]}>
                    <Check size={12} color={Colors.moss} strokeWidth={2.6} />
                    <Text style={[styles.badgeText, { color: Colors.moss }]}>ALL SETTLED</Text>
                  </View>
                ) : (
                  <View style={[styles.badgePill, { backgroundColor: '#FEE2E2' }]}>
                    <ArrowUpRight size={12} color={Colors.brick} strokeWidth={2.6} />
                    <Text style={[styles.badgeText, { color: Colors.brick }]}>YOU OWE</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.balanceAmount,
                  isOwed
                    ? { color: Colors.moss }
                    : isSettled
                    ? { color: Colors.inkSoft }
                    : { color: Colors.brick },
                ]}
              >
                {isOwed
                  ? `+₹${person.netBalance.toLocaleString()}`
                  : isSettled
                  ? '₹0'
                  : `-₹${Math.abs(person.netBalance).toLocaleString()}`}
              </Text>
            </View>

            {/* WhatsApp Reminder Button (If money is owed) */}
            {isOwed && (
              <AnimatedPressable
                scaleTo={0.96}
                onPress={handleWhatsAppReminder}
                style={styles.whatsappReminderBtn}
              >
                <MessageSquare size={15} color="#25D366" strokeWidth={2.2} />
                <Text style={styles.whatsappReminderText}>Send WhatsApp Reminder</Text>
              </AnimatedPressable>
            )}
          </View>

          {/* Transactions list */}
          <View style={styles.txnSection}>
            <View style={styles.txnHeaderRow}>
              <Text style={styles.sectionHeader}>{t('transactionHistory')}</Text>
              <Text style={styles.txnCounter}>{transactions.length} entries</Text>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>{t('noEntriesYet')}</Text>
              </View>
            ) : (
              transactions.map((txn) => {
                const isLent = txn.direction === 'LENT';
                const isBorrowed = txn.direction === 'BORROWED';

                return (
                  <TouchableOpacity
                    key={txn.id}
                    activeOpacity={0.75}
                    onPress={() => setEditingLedgerTxn({ personId: person.id, txn })}
                    style={styles.txnRow}
                  >
                    <View style={styles.txnLeft}>
                      <View
                        style={[
                          styles.txnIconCircle,
                          isLent
                            ? { backgroundColor: Colors.mossLight }
                            : isBorrowed
                            ? { backgroundColor: '#FEE2E2' }
                            : { backgroundColor: Colors.mist },
                        ]}
                      >
                        {isLent ? (
                          <ArrowDownLeft size={14} color={Colors.moss} strokeWidth={2.5} />
                        ) : isBorrowed ? (
                          <ArrowUpRight size={14} color={Colors.brick} strokeWidth={2.5} />
                        ) : (
                          <Check size={14} color={Colors.moss} strokeWidth={2.5} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.txnNote}>{txn.note || (isLent ? 'Lent to friend' : 'Borrowed')}</Text>
                        <Text style={styles.txnDate}>{txn.date === 'Today' ? t('dayToday') : txn.date}</Text>
                      </View>
                    </View>
                    <View style={styles.txnRight}>
                      <Text
                        style={[
                          styles.txnAmount,
                          isLent
                            ? { color: Colors.moss }
                            : isBorrowed
                            ? { color: Colors.brick }
                            : { color: Colors.inkSoft },
                        ]}
                      >
                        {isLent
                          ? `+₹${txn.amount.toLocaleString()}`
                          : isBorrowed
                          ? `-₹${txn.amount.toLocaleString()}`
                          : `₹${txn.amount.toLocaleString()}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.btnRow}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleAddTxn} style={styles.secondaryBtn}>
              <Plus size={16} color={Colors.moss} strokeWidth={2.2} style={{ marginRight: 6 }} />
              <Text style={styles.secondaryBtnText}>{t('addTxn')}</Text>
            </TouchableOpacity>

            {!isSettled && (
              <TouchableOpacity activeOpacity={0.88} onPress={handleSettle} style={styles.primaryBtn}>
                <Check size={16} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>{t('markSettled')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Delete Contact Confirmation */}
        <ConfirmDeleteModal
          visible={showDeleteConfirm}
          title="Delete Contact & Records?"
          message={`Are you sure you want to delete ${person.name} and all associated ledger transaction history? This cannot be undone.`}
          itemBadge={`${person.name} · ${transactions.length} entries`}
          confirmLabel="Delete Contact"
          cancelLabel="Cancel"
          onConfirm={async () => {
            const personId = person.id;
            const personName = person.name;
            setShowDeleteConfirm(false);
            closeModal();
            try {
              await deletePerson(personId, personName);
            } catch (err) {
              console.warn('Failed to delete contact:', err);
            }
          }}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  topBarTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 17,
    color: Colors.ink,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 18,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 24,
    color: Colors.moss,
  },
  personName: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 22,
    color: Colors.ink,
  },
  personSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  balanceCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  balanceCardOwed: {
    borderColor: 'rgba(62, 107, 92, 0.3)',
    backgroundColor: '#F4F8F6',
  },
  balanceCardOwe: {
    borderColor: 'rgba(196, 83, 58, 0.3)',
    backgroundColor: '#FDF6F5',
  },
  balanceCardSettled: {
    borderColor: Colors.line,
    backgroundColor: Colors.card,
  },
  balanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  badgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  balanceAmount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 32,
  },
  whatsappReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  whatsappReminderText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#166534',
  },
  txnSection: {
    gap: 10,
  },
  txnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionHeader: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  txnCounter: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.line,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  txnLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 10,
  },
  txnIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnNote: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  txnDate: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  txnAmount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.card,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.moss,
    backgroundColor: Colors.card,
  },
  secondaryBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.moss,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.moss,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
