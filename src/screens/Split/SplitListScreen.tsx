import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Split,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Settings as SettingsIcon,
  ChevronRight,
  Zap,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { SplitBill } from '../../types';

export const SplitListScreen: React.FC = () => {
  const splitBills = useAppStore((state) => state.splitBills);
  const activeFilter = useAppStore((state) => state.activeSplitFilter);
  const setActiveFilter = useAppStore((state) => state.setActiveSplitFilter);
  const openModal = useAppStore((state) => state.openModal);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const refreshDashboard = useAppStore((state) => state.refreshDashboard);
  const { t } = useTranslation();

  // Calculate totals:
  // 1. Owed to you: sum of shares from others on bills you paid
  // 2. You owe: sum of your share on bills others paid
  const { totalOwedToYou, totalYouOwe } = useMemo(() => {
    let owedToYou = 0;
    let youOwe = 0;

    splitBills.forEach((bill) => {
      if (bill.status === 'SETTLED') return;

      const userPaid = bill.paidBy.isCurrentUser;
      if (userPaid) {
        bill.participants.forEach((p) => {
          if (!p.isCurrentUser && !p.isPaid) {
            owedToYou += p.amount;
          }
        });
      } else {
        const myShare = bill.participants.find((p) => p.isCurrentUser);
        if (myShare && !myShare.isPaid) {
          youOwe += myShare.amount;
        }
      }
    });

    return { totalOwedToYou: owedToYou, totalYouOwe: youOwe };
  }, [splitBills]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return splitBills.filter((bill) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'SETTLED') return bill.status === 'SETTLED';

      const userPaid = bill.paidBy.isCurrentUser;
      if (activeFilter === 'OWED_TO_YOU') {
        return userPaid && bill.participants.some((p) => !p.isCurrentUser && !p.isPaid);
      }
      if (activeFilter === 'YOU_OWE') {
        const myShare = bill.participants.find((p) => p.isCurrentUser);
        return !userPaid && myShare && !myShare.isPaid;
      }
      return true;
    });
  }, [splitBills, activeFilter]);

  const handleOpenSettings = () => {
    openModal('profile_details');
  };

  const handleCreateSplit = () => {
    openModal('add_split');
  };

  const handleBillPress = (billId: string) => {
    openModal('split_detail', billId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Split Bills</Text>
          <Text style={styles.headerSubtitle}>Share expenses & settle up instantly</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleOpenSettings}
          style={styles.settingsBtn}
        >
          <SettingsIcon size={20} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={refreshDashboard}
            tintColor={Colors.moss}
          />
        }
      >
        {/* Summary Balance Cards */}
        <View style={styles.summaryRow}>
          {/* Card: Owed to You */}
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <View style={styles.summaryIconBadgeGreen}>
              <ArrowDownLeft size={16} color={Colors.moss} />
            </View>
            <Text style={styles.summaryLabel}>You are Owed</Text>
            <Text style={[styles.summaryAmount, { color: Colors.moss }]}>
              ₹{totalOwedToYou.toLocaleString()}
            </Text>
            <Text style={styles.summarySubtext}>From split members</Text>
          </View>

          {/* Card: You Owe */}
          <View style={[styles.summaryCard, styles.summaryCardRed]}>
            <View style={styles.summaryIconBadgeRed}>
              <ArrowUpRight size={16} color={Colors.brick} />
            </View>
            <Text style={styles.summaryLabel}>You Owe</Text>
            <Text style={[styles.summaryAmount, { color: Colors.brick }]}>
              ₹{totalYouOwe.toLocaleString()}
            </Text>
            <Text style={styles.summarySubtext}>Your pending share</Text>
          </View>
        </View>

        {/* Quick Action Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCreateSplit}
          style={styles.newSplitBtn}
        >
          <View style={styles.newSplitBtnIcon}>
            <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
          </View>
          <Text style={styles.newSplitBtnText}>Create New Split Bill</Text>
          <Zap size={15} color="#FFFFFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Filter Pills */}
        <View style={styles.filterBar}>
          {(
            [
              { key: 'ALL', label: 'All' },
              { key: 'OWED_TO_YOU', label: 'Owed to You' },
              { key: 'YOU_OWE', label: 'You Owe' },
              { key: 'SETTLED', label: 'Settled' },
            ] as const
          ).map((item) => {
            const isActive = activeFilter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(item.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bills List */}
        {filteredBills.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Split size={32} color={Colors.moss} />
            </View>
            <Text style={styles.emptyTitle}>No Split Bills Found</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'ALL'
                ? 'Splitting dinner, rent, or a trip with friends? Create your first split and settle up with 1 tap!'
                : `No bills matching "${activeFilter.toLowerCase().replace('_', ' ')}"`}
            </Text>
            {activeFilter === 'ALL' && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCreateSplit}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>+ Start a Split</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBills.map((bill) => {
            const paidCount = bill.participants.filter((p) => p.isPaid).length;
            const totalCount = bill.participants.length;
            const progressPct = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
            const isSettled = bill.status === 'SETTLED';
            const userPaid = bill.paidBy.isCurrentUser;
            const myParticipant = bill.participants.find((p) => p.isCurrentUser);

            return (
              <TouchableOpacity
                key={bill.id}
                activeOpacity={0.85}
                onPress={() => handleBillPress(bill.id)}
                style={styles.billCard}
              >
                {/* Top Row: Title + Total */}
                <View style={styles.billCardHeader}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.billTitle} numberOfLines={1}>
                        {bill.title}
                      </Text>
                      {bill.category && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{bill.category}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.billDate}>{bill.date}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.billTotalAmount}>
                      ₹{bill.totalAmount.toLocaleString()}
                    </Text>
                    <Text style={styles.billTotalLabel}>Total Bill</Text>
                  </View>
                </View>

                {/* Middle Row: Payer badge & Progress */}
                <View style={styles.billCardMiddle}>
                  <View style={styles.payerBadge}>
                    <Text style={styles.payerBadgeText}>
                      Paid by{' '}
                      <Text style={{ fontWeight: '700' }}>
                        {userPaid ? 'You' : bill.paidBy.name}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    {isSettled ? (
                      <View style={[styles.statusPill, { backgroundColor: '#DCFCE7' }]}>
                        <CheckCircle2 size={12} color="#15803D" />
                        <Text style={[styles.statusPillText, { color: '#15803D' }]}>
                          Settled
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.statusPill, { backgroundColor: '#FEF3C7' }]}>
                        <Clock size={12} color="#B45309" />
                        <Text style={[styles.statusPillText, { color: '#B45309' }]}>
                          {paidCount}/{totalCount} Paid
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Progress Bar */}
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

                {/* Bottom Row: Your Share & Action */}
                <View style={styles.billCardFooter}>
                  {userPaid ? (
                    <Text style={styles.footerShareText}>
                      You lent{' '}
                      <Text style={{ color: Colors.moss, fontWeight: '700' }}>
                        ₹{(bill.totalAmount - (myParticipant?.amount || 0)).toLocaleString()}
                      </Text>{' '}
                      to {totalCount - 1} friends
                    </Text>
                  ) : (
                    <Text style={styles.footerShareText}>
                      Your share:{' '}
                      <Text style={{ color: Colors.brick, fontWeight: '700' }}>
                        ₹{myParticipant ? myParticipant.amount.toLocaleString() : '0'}
                      </Text>
                    </Text>
                  )}

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.viewDetailsText}>View Split</Text>
                    <ChevronRight size={14} color={Colors.moss} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
  headerTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 26,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 110,
    paddingTop: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardGreen: {
    backgroundColor: '#F3FAF6',
    borderColor: '#D4EADF',
  },
  summaryCardRed: {
    backgroundColor: '#FEF6F4',
    borderColor: '#F6D9D2',
  },
  summaryIconBadgeGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryIconBadgeRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brickLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
    marginBottom: 4,
  },
  summaryAmount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 22,
    marginBottom: 2,
  },
  summarySubtext: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    opacity: 0.8,
  },
  newSplitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.moss,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newSplitBtnIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  newSplitBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  filterChipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  filterChipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.inkSoft,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
  },
  billCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  billCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    color: Colors.ink,
  },
  categoryBadge: {
    backgroundColor: Colors.mist,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  categoryBadgeText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  billDate: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 3,
  },
  billTotalAmount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 18,
    color: Colors.ink,
  },
  billTotalLabel: {
    fontFamily: Fonts.sansRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  billCardMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  payerBadge: {
    backgroundColor: Colors.mist,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  payerBadgeText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
  },
  statusBadge: {},
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  billCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  footerShareText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.ink,
  },
  viewDetailsText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12.5,
    color: Colors.moss,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 18,
    color: Colors.ink,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13.5,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  emptyBtn: {
    backgroundColor: Colors.moss,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
});
