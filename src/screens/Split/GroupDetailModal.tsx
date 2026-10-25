import React from 'react';
import {
  View,
  Text,
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
import { styles } from './GroupDetailModal.styles';

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

