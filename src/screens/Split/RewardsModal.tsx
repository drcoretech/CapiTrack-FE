import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Gift,
  Share2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { shareInviteLink } from '../../services/upiPayment';

export const RewardsModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const userName = useAppStore((state) => state.userName);
  const capitrackId = useAppStore((state) => state.capitrackId);
  const referralCode = useAppStore((state) => state.referralCode);
  const rewardPoints = useAppStore((state) => state.rewardPoints);
  const rewardsData = useAppStore((state) => state.rewardsData);

  const isVisible = activeModal === 'rewards_modal';

  if (!isVisible) return null;

  const currentHandle = capitrackId ? `@${capitrackId}` : `@${(userName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const currentRefCode = referralCode || `CT-${(userName ? userName.slice(0, 3) : 'CAP').toUpperCase()}782`;
  const points = rewardsData?.pointsBalance ?? rewardPoints ?? 50;

  const handleShare = () => {
    shareInviteLink({
      userName,
      referralCode: currentRefCode,
      capitrackId: currentHandle.replace(/^@/, ''),
    });
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={closeModal} style={styles.iconBtn}>
            <X size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CapiPoints & Rewards</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Points Card */}
          <View style={styles.heroCard}>
            <View style={styles.giftBadge}>
              <Gift size={32} color={Colors.amber} />
            </View>

            <Text style={styles.pointsCount}>{points}</Text>
            <Text style={styles.pointsLabel}>CapiPoints Available</Text>

            <View style={styles.comingSoonTag}>
              <Sparkles size={13} color="#B45309" style={{ marginRight: 5 }} />
              <Text style={styles.comingSoonText}>Redeem for Cash & Gift Cards (Coming Soon)</Text>
            </View>
          </View>

          {/* User ID & Referral Code Card */}
          <View style={styles.codeCard}>
            <View style={styles.codeRow}>
              <View style={styles.codeCol}>
                <Text style={styles.codeLabel}>YOUR CAPITRACK ID</Text>
                <Text style={styles.codeValue}>{currentHandle}</Text>
              </View>

              <View style={styles.codeDivider} />

              <View style={styles.codeCol}>
                <Text style={styles.codeLabel}>INVITE CODE</Text>
                <Text style={styles.codeValue}>{currentRefCode}</Text>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={handleShare} style={styles.shareBtn}>
              <Share2 size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.shareBtnText}>Invite Friends on WhatsApp (+50 Pts)</Text>
            </TouchableOpacity>
          </View>

          {/* How It Works */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>HOW CAPIPOINTS WORK</Text>

            <View style={styles.stepCard}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Share Your Link or CapiTrack ID</Text>
                <Text style={styles.stepDesc}>Send your invite link to friends or tell them your @CapiTrackID.</Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Earn 50 Points Per Friend</Text>
                <Text style={styles.stepDesc}>Your friend gets 25 welcome points, and you get 50 CapiPoints credited instantly.</Text>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Redeem in Cash or Amazon Vouchers</Text>
                <Text style={styles.stepDesc}>100 CapiPoints = ₹50 Cash / Gift Card. Redemption portal launches in upcoming update!</Text>
              </View>
            </View>
          </View>

          {/* Anti-Fraud Security Guarantee */}
          <View style={styles.securityBox}>
            <ShieldCheck size={20} color={Colors.mossDark} style={{ marginRight: 10, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>1-Time Referral Lock Protection</Text>
              <Text style={styles.securityDesc}>
                Each friend can only be referred once. Our database locks referee accounts permanently to ensure a 100% fair and authentic rewards ecosystem.
              </Text>
            </View>
          </View>

          {/* Referred Friends History */}
          {rewardsData?.referrals && rewardsData.referrals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>YOUR REFERRED FRIENDS ({rewardsData.referrals.length})</Text>
              {rewardsData.referrals.map((ref: any) => (
                <View key={ref.id} style={styles.friendRow}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>{ref.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendName}>{ref.name}</Text>
                    <Text style={styles.friendDate}>Joined {new Date(ref.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.friendPointsBadge}>
                    <Text style={styles.friendPointsText}>+{ref.points} PTS</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    padding: 22,
    alignItems: 'center',
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  giftBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pointsCount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 42,
    color: Colors.ink,
  },
  pointsLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13.5,
    color: Colors.inkSoft,
    marginBottom: 12,
  },
  comingSoonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
  },
  comingSoonText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: Colors.line,
    padding: 16,
    gap: 14,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeCol: {
    flex: 1,
    alignItems: 'center',
  },
  codeDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.line,
  },
  codeLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    color: Colors.inkSoft,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  codeValue: {
    fontFamily: Fonts.monoMedium,
    fontSize: 16,
    color: Colors.mossDark,
    fontWeight: '700',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  shareBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 12,
    gap: 12,
  },
  stepNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.moss,
  },
  stepTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
    marginBottom: 2,
  },
  stepDesc: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    lineHeight: 16.5,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 14,
    padding: 14,
  },
  securityTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.mossDark,
    marginBottom: 2,
  },
  securityDesc: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.mossDark,
    lineHeight: 16,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 12,
    gap: 12,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  friendName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
  },
  friendDate: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  friendPointsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  friendPointsText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },
});
