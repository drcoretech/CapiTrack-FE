import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { styles } from './SplitList.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SplitSummaryRow } from './components/SplitSummaryRow';
import { SplitBillCard } from './components/SplitBillCard';
import {
  Split,
  Plus,
  Settings as SettingsIcon,
  ChevronRight,
  Zap,
  Users,
  Gift,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { SplitBill } from '../../types';

export const SplitListScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'bills' | 'groups'>('bills');
  const splitBills = useAppStore((state) => state.splitBills);
  const groups = useAppStore((state) => state.groups);
  const rewardsData = useAppStore((state) => state.rewardsData);
  const rewardPoints = useAppStore((state) => state.rewardPoints);
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

        <View style={styles.headerRightRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openModal('rewards_modal')}
            style={styles.rewardsPill}
          >
            <Gift size={13} color="#B45309" />
            <Text style={styles.rewardsPillText}>
              {rewardsData?.pointsBalance ?? rewardPoints ?? 50} PTS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenSettings}
            style={styles.settingsBtn}
          >
            <SettingsIcon size={20} color={Colors.ink} />
          </TouchableOpacity>
        </View>
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
        <SplitSummaryRow
          totalOwedToYou={totalOwedToYou}
          totalYouOwe={totalYouOwe}
        />

        {/* View Switcher: All Splits vs Groups */}
        <View style={styles.viewSegmentContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('bills')}
            style={[styles.viewSegmentBtn, viewMode === 'bills' && styles.viewSegmentBtnActive]}
          >
            <Split size={14} color={viewMode === 'bills' ? Colors.moss : Colors.inkSoft} />
            <Text style={[styles.viewSegmentText, viewMode === 'bills' && styles.viewSegmentTextActive]}>
              All Splits ({splitBills.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('groups')}
            style={[styles.viewSegmentBtn, viewMode === 'groups' && styles.viewSegmentBtnActive]}
          >
            <Users size={14} color={viewMode === 'groups' ? Colors.moss : Colors.inkSoft} />
            <Text style={[styles.viewSegmentText, viewMode === 'groups' && styles.viewSegmentTextActive]}>
              Groups ({groups.length})
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'groups' ? (
          /* Groups View (Google Pay Style) */
          <View style={styles.groupsContainer}>
            {/* Group Action Buttons Row */}
            <View style={styles.groupActionsRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openModal('create_group')}
                style={styles.createGroupBtn}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.createGroupBtnText}>Create Group</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openModal('join_group')}
                style={styles.joinGroupBtn}
              >
                <Users size={15} color={Colors.moss} style={{ marginRight: 6 }} />
                <Text style={styles.joinGroupBtnText}>Join with Code</Text>
              </TouchableOpacity>
            </View>

            {/* Groups List */}
            {groups.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={[styles.emptyIconCircle, { backgroundColor: '#E8F5E9' }]}>
                  <Users size={32} color={Colors.moss} />
                </View>
                <Text style={styles.emptyTitle}>No Split Groups Yet</Text>
                <Text style={styles.emptyText}>
                  Create a shared group with friends for trips, flat rent, or outings. Live sync & instant UPI settlements!
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => openModal('create_group')}
                  style={styles.emptyBtn}
                >
                  <Text style={styles.emptyBtnText}>+ Create First Group</Text>
                </TouchableOpacity>
              </View>
            ) : (
              groups.map((group) => {
                const groupBills = splitBills.filter(
                  (b) => b.groupId === group.id || b.groupName?.toLowerCase() === group.name.toLowerCase()
                );
                const totalGroupSpends = groupBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

                return (
                  <TouchableOpacity
                    key={group.id}
                    activeOpacity={0.85}
                    onPress={() => openModal('group_detail', group.id)}
                    style={styles.groupCard}
                  >
                    <View style={styles.groupIconCircle}>
                      <Users size={22} color={Colors.moss} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.groupTitleRow}>
                        <Text style={styles.groupCardTitle}>{group.name}</Text>
                        <View style={styles.groupCodeBadgeMini}>
                          <Text style={styles.groupCodeTextMini}>{group.groupCode}</Text>
                        </View>
                      </View>

                      <Text style={styles.groupCardSub}>
                        {group.members?.length || 1} members • {groupBills.length} bills
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                      <Text style={styles.groupSpendAmount}>₹{totalGroupSpends.toLocaleString()}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text style={styles.groupViewText}>Details</Text>
                        <ChevronRight size={13} color={Colors.moss} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : (
          /* Bills View */
          <>
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
              filteredBills.map((bill) => (
                <SplitBillCard
                  key={bill.id}
                  bill={bill}
                  onPress={handleBillPress}
                />
              ))
        )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
