import React from 'react';
import {
  View,
  Text,
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
import { styles } from './RewardsModal.styles';

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

