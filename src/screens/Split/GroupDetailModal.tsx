import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Users,
  Share2,
  Plus,
  Receipt,
  Copy,
  CheckCircle2,
  Plane,
  Home,
  Utensils,
  Briefcase,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { AnimatedPressable } from '../../components/AnimatedPressable';

export const GroupDetailModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const openModal = useAppStore((state) => state.openModal);
  const selectedGroupId = useAppStore((state) => state.selectedGroupId);
  const groups = useAppStore((state) => state.groups);
  const splitBills = useAppStore((state) => state.splitBills);
  const currencySymbol = useAppStore((state) => state.currencySymbol);

  const isVisible = activeModal === 'group_detail';

  if (!isVisible) return null;

  const group = groups.find((g) => g.id === selectedGroupId || (g as any)._id === selectedGroupId);

  if (!group) return null;

  const groupBills = splitBills.filter(
    (b) => b.groupId === group.id || b.groupName?.toLowerCase() === group.name.toLowerCase()
  );

  const totalExpense = groupBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const handleShareGroup = async () => {
    const message = `Join my group *${group.name}* on CapiTrack! 👥\n\nEnter Group Code: *${group.groupCode}*\n\nDownload CapiTrack: https://capitrack.vercel.app/?join=${group.groupCode}`;
    try {
      await Share.share({ message });
    } catch {}
  };

  const handleAddBill = () => {
    openModal('add_split');
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={closeModal} style={styles.iconBtn}>
            <X size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{group.name}</Text>
          <TouchableOpacity onPress={handleShareGroup} style={styles.iconBtn}>
            <Share2 size={18} color={Colors.moss} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Group Overview Banner */}
          <View style={styles.heroCard}>
            <View style={styles.groupCodeBadge}>
              <Text style={styles.groupCodeLabel}>GROUP CODE</Text>
              <Text style={styles.groupCodeValue}>{group.groupCode}</Text>
            </View>

            <Text style={styles.totalExpenseAmount}>
              {currencySymbol}{totalExpense.toLocaleString()}
            </Text>
            <Text style={styles.totalExpenseLabel}>Total Group Spends</Text>

            <TouchableOpacity activeOpacity={0.8} onPress={handleShareGroup} style={styles.inviteShareBtn}>
              <Share2 size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.inviteShareBtnText}>Invite Members via WhatsApp</Text>
            </TouchableOpacity>
          </View>

          {/* Members Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>MEMBERS ({group.members?.length || 0})</Text>
            </View>

            <View style={styles.membersList}>
              {group.members?.map((m, idx) => (
                <View key={m.id || idx} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{(m.name || 'M')[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      {m.capitrackId && (
                        <View style={styles.cTrackPill}>
                          <CheckCircle2 size={10} color={Colors.mossDark} style={{ marginRight: 3 }} />
                          <Text style={styles.cTrackPillText}>App Member</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberSub}>
                      {m.role === 'admin' ? 'Admin' : 'Member'} • {m.capitrackId ? `@${m.capitrackId}` : m.phone || 'Offline'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Group Bills Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>GROUP BILLS ({groupBills.length})</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleAddBill} style={styles.addBillMiniBtn}>
                <Plus size={14} color={Colors.moss} style={{ marginRight: 3 }} />
                <Text style={styles.addBillMiniText}>Add Bill</Text>
              </TouchableOpacity>
            </View>

            {groupBills.length === 0 ? (
              <View style={styles.zeroBillsCard}>
                <Receipt size={28} color={Colors.inkSoft} />
                <Text style={styles.zeroBillsText}>No split bills logged in this group yet.</Text>
                <TouchableOpacity activeOpacity={0.8} onPress={handleAddBill} style={styles.zeroCtaBtn}>
                  <Text style={styles.zeroCtaText}>Add First Expense</Text>
                </TouchableOpacity>
              </View>
            ) : (
              groupBills.map((bill) => (
                <TouchableOpacity
                  key={bill.id}
                  activeOpacity={0.7}
                  onPress={() => openModal('split_detail', bill.id)}
                  style={styles.billCard}
                >
                  <View style={styles.billIconCircle}>
                    <Receipt size={18} color={Colors.moss} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billTitle}>{bill.title}</Text>
                    <Text style={styles.billSub}>Paid by {bill.paidBy.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.billAmount}>{currencySymbol}{bill.totalAmount.toLocaleString()}</Text>
                    <Text style={[styles.billStatus, bill.status === 'SETTLED' ? { color: Colors.mossDark } : { color: Colors.amber }]}>
                      {bill.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 17,
    color: Colors.ink,
  },
  content: {
    padding: 18,
    gap: 18,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: Colors.line,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  groupCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  groupCodeLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    color: Colors.inkSoft,
  },
  groupCodeValue: {
    fontFamily: Fonts.monoMedium,
    fontSize: 13,
    color: Colors.mossDark,
    fontWeight: '700',
  },
  totalExpenseAmount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 34,
    color: Colors.ink,
  },
  totalExpenseLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  inviteShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 6,
  },
  inviteShareBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  addBillMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBillMiniText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.moss,
  },
  membersList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 12,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
  },
  cTrackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  cTrackPillText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9,
    color: Colors.mossDark,
    fontWeight: '700',
  },
  memberSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  zeroBillsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  zeroBillsText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  zeroCtaBtn: {
    backgroundColor: Colors.mossLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  zeroCtaText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12.5,
    color: Colors.moss,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Colors.line,
    padding: 14,
    gap: 12,
  },
  billIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  billSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  billAmount: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14.5,
    color: Colors.ink,
  },
  billStatus: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },
});
