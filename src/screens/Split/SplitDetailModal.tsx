import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  QrCode,
  Zap,
  ArrowUpRight,
  Share2,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { payViaUPI, shareWhatsAppReminder } from '../../services/upiPayment';
import { SplitParticipant } from '../../types';

export const SplitDetailModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const selectedSplitBillId = useAppStore((state) => state.selectedSplitBillId);
  const splitBills = useAppStore((state) => state.splitBills);
  const closeModal = useAppStore((state) => state.closeModal);
  const deleteSplitBill = useAppStore((state) => state.deleteSplitBill);
  const settleSplitParticipant = useAppStore((state) => state.settleSplitParticipant);
  const setQrModalData = useAppStore((state) => state.setQrModalData);
  const userName = useAppStore((state) => state.userName) || 'You';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isVisible = activeModal === 'split_detail';
  const bill = splitBills.find((b) => b.id === selectedSplitBillId);

  if (!bill) return null;

  const userPaid = bill.paidBy.isCurrentUser;
  const paidCount = bill.participants.filter((p) => p.isPaid).length;
  const totalCount = bill.participants.length;
  const progressPct = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
  const isSettled = bill.status === 'SETTLED';

  const handlePayViaUPI = async (participant: SplitParticipant) => {
    // If user owes the payer
    const targetUpi = bill.paidBy.upiId || participant.upiId;
    const targetName = bill.paidBy.name;

    if (!targetUpi) {
      Alert.alert(
        'Missing UPI ID',
        `No UPI ID recorded for ${targetName}. You can mark this entry as paid manually, or enter their UPI ID.`
      );
      return;
    }

    const success = await payViaUPI({
      upiId: targetUpi,
      name: targetName,
      amount: participant.amount,
      note: `Split: ${bill.title}`,
    });

    if (success) {
      Alert.alert(
        'UPI Payment Initiated',
        `Did the payment of ₹${participant.amount} to ${targetName} succeed?`,
        [
          { text: 'Not yet', style: 'cancel' },
          {
            text: 'Mark as Paid',
            onPress: () => settleSplitParticipant(bill.id, participant.id),
          },
        ]
      );
    }
  };

  const handleWhatsAppRemind = (participant: SplitParticipant) => {
    shareWhatsAppReminder({
      phone: participant.phone,
      friendName: participant.name,
      amount: participant.amount,
      billTitle: bill.title,
      upiId: bill.paidBy.upiId,
      receiverName: userName,
    });
  };

  const handleShowQR = (participant: SplitParticipant) => {
    setQrModalData({
      upiId: bill.paidBy.upiId || 'digvijay@upi',
      name: userName,
      amount: participant.amount,
      note: `Split: ${bill.title}`,
    });
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    const billId = bill.id;
    closeModal();
    await deleteSplitBill(billId);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.container}>
        {/* Top bar with unified [X] Title [Trash2] */}
        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.iconBtn}>
            <X size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Split Details</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDeleteConfirm(true)}
            style={styles.iconBtn}
          >
            <Trash2 size={18} color={Colors.brick} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Header Card */}
          <View style={styles.heroCard}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{bill.category || 'General'}</Text>
            </View>

            <Text style={styles.heroTitle}>{bill.title}</Text>
            <Text style={styles.heroAmount}>₹{bill.totalAmount.toLocaleString()}</Text>

            <View style={styles.heroMetaRow}>
              <Text style={styles.heroMetaText}>
                Paid by{' '}
                <Text style={{ fontWeight: '700', color: Colors.ink }}>
                  {userPaid ? 'You' : bill.paidBy.name}
                </Text>
              </Text>
              <Text style={styles.heroDot}>•</Text>
              <Text style={styles.heroMetaText}>{bill.date}</Text>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  {paidCount} of {totalCount} settled
                </Text>
                <Text style={styles.progressPercent}>{Math.round(progressPct)}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPct}%`,
                      backgroundColor: isSettled ? Colors.moss : Colors.amber,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Members Breakdown Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>MEMBERS & SETTLEMENTS</Text>
            <Text style={styles.sectionHeaderSub}>
              {bill.splitType === 'EQUAL' ? 'Equal Split' : 'Exact Split'}
            </Text>
          </View>

          <View style={styles.membersList}>
            {bill.participants.map((participant) => {
              const isPayer = userPaid
                ? participant.isCurrentUser
                : participant.name.toLowerCase() === bill.paidBy.name.toLowerCase();

              const youOweThisPerson = !userPaid && participant.isCurrentUser && !participant.isPaid;
              const theyOweYou = userPaid && !participant.isCurrentUser && !participant.isPaid;

              return (
                <View key={participant.id} style={styles.participantCard}>
                  {/* Participant Header Info */}
                  <View style={styles.participantTopRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {(participant.name || 'F')[0].toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.participantName}>
                        {participant.name} {participant.isCurrentUser ? '(You)' : ''}
                      </Text>
                      {participant.upiId ? (
                        <Text style={styles.participantUpi}>{participant.upiId}</Text>
                      ) : (
                        <Text style={styles.participantUpi}>
                          {isPayer ? 'Paid full bill' : 'Member'}
                        </Text>
                      )}
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.participantAmount}>
                        ₹{participant.amount.toLocaleString()}
                      </Text>
                      {participant.isPaid ? (
                        <View style={styles.paidBadge}>
                          <CheckCircle2 size={12} color="#15803D" />
                          <Text style={styles.paidBadgeText}>Paid</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingBadge}>
                          <Clock size={12} color="#B45309" />
                          <Text style={styles.pendingBadgeText}>Pending</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Contextual Actions */}
                  {!participant.isPaid && (
                    <View style={styles.actionRow}>
                      {/* Scenario 1: You owe them -> Show "Pay via UPI" button */}
                      {youOweThisPerson && (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => handlePayViaUPI(participant)}
                          style={styles.payUpiBtn}
                        >
                          <Zap size={14} color="#FFFFFF" />
                          <Text style={styles.payUpiBtnText}>
                            Pay ₹{participant.amount} via UPI
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Scenario 2: They owe you -> Show "WhatsApp Remind" and "Show QR" */}
                      {theyOweYou && (
                        <>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleWhatsAppRemind(participant)}
                            style={styles.remindBtn}
                          >
                            <Send size={13} color={Colors.moss} />
                            <Text style={styles.remindBtnText}>Remind</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleShowQR(participant)}
                            style={styles.qrBtn}
                          >
                            <QrCode size={13} color={Colors.ink} />
                            <Text style={styles.qrBtnText}>QR</Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {/* Mark as Settled / Paid Offline button */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          Alert.alert(
                            'Mark as Settled',
                            `Mark ₹${participant.amount} for ${participant.name} as paid?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Confirm Paid',
                                onPress: () => settleSplitParticipant(bill.id, participant.id),
                              },
                            ]
                          )
                        }
                        style={styles.markPaidBtn}
                      >
                        <Text style={styles.markPaidBtnText}>Mark Paid ✓</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          visible={showDeleteConfirm}
          title="Delete Split Bill?"
          message={`Are you sure you want to delete "${bill.title}"? This will remove this split record and associated settlement tracking.`}
          itemBadge={`${bill.title} · ₹${bill.totalAmount.toLocaleString()}`}
          confirmLabel="Delete Split"
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 20,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryBadge: {
    backgroundColor: Colors.mossLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11.5,
    color: Colors.moss,
  },
  heroTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroAmount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 34,
    color: Colors.ink,
    marginBottom: 6,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroMetaText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  heroDot: {
    marginHorizontal: 8,
    color: Colors.line,
  },
  progressContainer: {
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  progressPercent: {
    fontFamily: Fonts.monoMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
    letterSpacing: 0.6,
  },
  sectionHeaderSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  membersList: {
    gap: 12,
  },
  participantCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  participantTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.moss,
  },
  participantName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14.5,
    color: Colors.ink,
  },
  participantUpi: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  participantAmount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 16,
    color: Colors.ink,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  paidBadgeText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: '#15803D',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  pendingBadgeText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: '#B45309',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  payUpiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803D',
    paddingVertical: 9,
    borderRadius: 10,
  },
  payUpiBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  remindBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.mossLight,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  remindBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.moss,
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  qrBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  markPaidBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  markPaidBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11.5,
    color: Colors.inkSoft,
  },
});
