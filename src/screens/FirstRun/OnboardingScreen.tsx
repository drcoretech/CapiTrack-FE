import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Briefcase,
  User,
  BookOpen,
  SlidersHorizontal,
  Zap,
  PieChart,
  Users,
  Building2,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  BellRing,
  Split,
  QrCode,
  Gift,
  Share2,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const setFirstRunStep = useAppStore((state) => state.setFirstRunStep);
  const setAuthInitialMode = useAppStore((state) => state.setAuthInitialMode);
  const { t } = useTranslation();

  const scrollRef = useRef<ScrollView>(null);

  // Exactly 5 feature introduction pages total:
  // Page 0: Combined Expenses & Khata
  // Page 1: Split Bills & Settle via UPI
  // Page 2: Split Groups, CapiTrack ID & Referral Rewards
  // Page 3: Personal & Freelance Workflows
  // Page 4: Auto-Capture & Security
  const totalPages = 5;
  const isLastStep = currentIndex === 4;

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (pageIndex !== currentIndex && pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentIndex(pageIndex);
    }
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      scrollRef.current?.scrollTo({
        x: pageIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(pageIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalPages - 1) {
      goToPage(currentIndex + 1);
    } else {
      // "Get Started" routes directly to Sign Up
      setAuthInitialMode('signup');
      setFirstRunStep('auth');
    }
  };

  const handleSkip = () => {
    // If on the last step ("Already have an account? Sign In"), route to Sign In
    if (isLastStep) {
      setAuthInitialMode('signin');
    } else {
      setAuthInitialMode('signup');
    }
    setFirstRunStep('auth');
  };

  const getButtonText = () => {
    if (isLastStep) return 'Get Started ›';
    return t('nextBtn');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Horizontal Swipeable ScrollView */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {/* Screen 1: Combined Expenses & Khata */}
        <View style={styles.page}>
          <View style={styles.pageInner}>
            <View style={[styles.heroIcon, { backgroundColor: Colors.mossLight }]}>
              <BookOpen size={40} color={Colors.moss} strokeWidth={2} />
            </View>

            <Text style={styles.title}>{t('onboardingCombinedTitle')}</Text>
            <Text style={styles.desc}>{t('onboardingCombinedDesc')}</Text>
          </View>
        </View>

        {/* Screen 2: Split Bills & Instant UPI Settlement (Google Pay Style) */}
        <View style={styles.page}>
          <View style={styles.pageInner}>
            <View style={[styles.heroIcon, { backgroundColor: Colors.mossLight }]}>
              <Split size={40} color={Colors.moss} strokeWidth={2} />
            </View>

            <Text style={styles.title}>Split Bills & Settle via UPI</Text>
            <Text style={styles.desc}>
              Split dinner, rent, and trips with friends in seconds. Pay or collect your share instantly with Google Pay & PhonePe.
            </Text>

            {/* Informational Feature Cards */}
            <View style={styles.modeContainer}>
              {/* Feature 1: 1-Tap Google Pay & UPI Intent */}
              <View style={styles.modeCard}>
                <View style={styles.modeCardTop}>
                  <View style={[styles.modeIconCircle, { backgroundColor: '#E8F5E9' }]}>
                    <Zap size={20} color={Colors.moss} />
                  </View>
                  <View style={styles.modeHeaderTexts}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>Google Pay & UPI Intent</Text>
                      <View style={[styles.modeTagPill, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[styles.modeTagText, { color: Colors.mossDark }]}>
                          Zero Fee
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modeDesc}>
                      One tap opens Google Pay, PhonePe, or Paytm with the exact amount and UPI ID pre-filled.
                    </Text>
                  </View>
                </View>

                {/* Feature Chips */}
                <View style={styles.chipRow}>
                  <View style={styles.featureChip}>
                    <Zap size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>1-Click GPay</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <CheckCircle2 size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Direct Bank P2P</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <Users size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Equal & Custom</Text>
                  </View>
                </View>
              </View>

              {/* Feature 2: WhatsApp Pay Links & QR Codes */}
              <View style={styles.modeCard}>
                <View style={styles.modeCardTop}>
                  <View style={[styles.modeIconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <QrCode size={20} color={Colors.amber} />
                  </View>
                  <View style={styles.modeHeaderTexts}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>WhatsApp Links & QR Codes</Text>
                      <View style={[styles.modeTagPill, { backgroundColor: '#FFFBEB' }]}>
                        <Text style={[styles.modeTagText, { color: '#B45309' }]}>
                          Instant Collect
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modeDesc}>
                      Send payment reminders with 1-tap UPI links on WhatsApp or show dynamic QR codes to scan.
                    </Text>
                  </View>
                </View>

                {/* Feature Chips */}
                <View style={styles.chipRow}>
                  <View style={styles.featureChip}>
                    <QrCode size={11} color={Colors.amber} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Dynamic QR</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <TrendingUp size={11} color={Colors.amber} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Auto-Khata Sync</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <Sparkles size={11} color={Colors.amber} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Live Status</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Screen 3: Split Groups, CapiTrack ID & Referral Rewards */}
        <View style={styles.page}>
          <View style={styles.pageInner}>
            <View style={[styles.heroIcon, { backgroundColor: '#FEF3C7' }]}>
              <Gift size={38} color={Colors.amber} strokeWidth={2} />
            </View>

            <Text style={styles.title}>{t('onboardingGroupsTitle')}</Text>
            <Text style={styles.desc}>{t('onboardingGroupsDesc')}</Text>

            {/* Informational Feature Cards */}
            <View style={styles.modeContainer}>
              {/* Feature 1: Google Pay-Style Shared Groups & CapiTrack ID */}
              <View style={styles.modeCard}>
                <View style={styles.modeCardTop}>
                  <View style={[styles.modeIconCircle, { backgroundColor: '#E8F5E9' }]}>
                    <Users size={20} color={Colors.moss} />
                  </View>
                  <View style={styles.modeHeaderTexts}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>Shared Groups & CapiTrack ID</Text>
                      <View style={[styles.modeTagPill, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[styles.modeTagText, { color: Colors.mossDark }]}>
                          Google Pay Style
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modeDesc}>
                      Connect with friends via unique @CapiTrackID or phone. When Suresh adds a bill, it syncs instantly to Ramesh!
                    </Text>
                  </View>
                </View>

                {/* Feature Chips */}
                <View style={styles.chipRow}>
                  <View style={styles.featureChip}>
                    <Zap size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Instant Cloud Sync</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <Users size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Trip & Flat Groups</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <CheckCircle2 size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Unique @Handle</Text>
                  </View>
                </View>
              </View>

              {/* Feature 2: Invite Friends & Earn Rewards (CapiPoints) */}
              <View style={styles.modeCard}>
                <View style={styles.modeCardTop}>
                  <View style={[styles.modeIconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Gift size={20} color={Colors.amber} />
                  </View>
                  <View style={styles.modeHeaderTexts}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>Invite Friends & Earn Rewards</Text>
                      <View style={[styles.modeTagPill, { backgroundColor: '#FFFBEB' }]}>
                        <Text style={[styles.modeTagText, { color: '#B45309' }]}>
                          50 Pts / Invite
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modeDesc}>
                      Invite friends via WhatsApp with your referral link. Collect CapiPoints now and redeem for Cash & Gift Cards (Coming Soon)!
                    </Text>
                  </View>
                </View>

                {/* Feature Chips */}
                <View style={styles.chipRow}>
                  <View style={styles.featureChip}>
                    <Gift size={11} color={Colors.amber} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>+50 CapiPoints</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <Share2 size={11} color={Colors.amber} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>1-Tap WhatsApp Link</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <ShieldCheck size={11} color={Colors.amber} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>1-Time Protected</Text>
                  </View>
                </View>
              </View>

              {/* Informational Guidance Notice */}
              <View style={styles.infoNoticeBox}>
                <Sparkles size={14} color={Colors.mossDark} style={{ marginRight: 8 }} />
                <Text style={styles.infoNoticeText}>
                  Points are collected immediately. 1-time referral security prevents duplicate loops and ensures 100% fair rewards.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Screen 4: Informative Workflow Preview (Personal & Freelance) */}
        <View style={styles.page}>
          <View style={styles.pageInner}>
            <View style={[styles.heroIcon, { backgroundColor: Colors.mossLight }]}>
              <SlidersHorizontal size={40} color={Colors.moss} strokeWidth={2} />
            </View>

            <Text style={styles.title}>{t('onboardingModeTitle')}</Text>
            <Text style={styles.desc}>{t('onboardingModeDesc')}</Text>

            {/* Informational Feature Cards */}
            <View style={styles.modeContainer}>
              {/* Feature 1: Personal Expenses */}
              <View style={styles.modeCard}>
                <View style={styles.modeCardTop}>
                  <View style={[styles.modeIconCircle, { backgroundColor: '#E8F5E9' }]}>
                    <User size={20} color={Colors.moss} />
                  </View>
                  <View style={styles.modeHeaderTexts}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>{t('modePersonalTitle')}</Text>
                      <View style={[styles.modeTagPill, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[styles.modeTagText, { color: Colors.mossDark }]}>
                          {t('modePersonalBadge')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modeDesc}>{t('modePersonalDesc')}</Text>
                  </View>
                </View>

                {/* Feature Chips */}
                <View style={styles.chipRow}>
                  <View style={styles.featureChip}>
                    <Zap size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Quick Log</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <PieChart size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Category Budgets</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <Users size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Friends Khata</Text>
                  </View>
                </View>
              </View>

              {/* Feature 2: Freelance & Client Projects */}
              <View style={styles.modeCard}>
                <View style={styles.modeCardTop}>
                  <View style={[styles.modeIconCircle, { backgroundColor: '#F0FDFA' }]}>
                    <Briefcase size={20} color="#0D9488" />
                  </View>
                  <View style={styles.modeHeaderTexts}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>{t('modeBothTitle')}</Text>
                      <View style={[styles.modeTagPill, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={[styles.modeTagText, { color: '#047857' }]}>
                          {t('modeBothBadge')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modeDesc}>{t('modeBothDesc')}</Text>
                  </View>
                </View>

                {/* Feature Chips */}
                <View style={styles.chipRow}>
                  <View style={styles.featureChip}>
                    <Building2 size={11} color="#0D9488" strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Client CRM</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <CheckCircle2 size={11} color="#0D9488" strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Milestone Payments</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <TrendingUp size={11} color="#0D9488" strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Revenue Trends</Text>
                  </View>
                </View>
              </View>

              {/* Informational Guidance Notice */}
              <View style={styles.infoNoticeBox}>
                <Sparkles size={14} color={Colors.mossDark} style={{ marginRight: 8 }} />
                <Text style={styles.infoNoticeText}>{t('onboardingModeNote')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Screen 3: Smart Auto-Capture & Privacy Showcase */}
        <View style={styles.page}>
          <View style={styles.pageInner}>
            <View style={[styles.heroIcon, { backgroundColor: Colors.amberLight }]}>
              <Zap size={40} color={Colors.amber} strokeWidth={2} />
            </View>

            <Text style={styles.title}>{t('onboardingAutoCaptureTitle')}</Text>
            <Text style={styles.desc}>{t('onboardingAutoCaptureDesc')}</Text>

            {/* Informational Feature Cards */}
            <View style={styles.modeContainer}>
              {/* Feature 1: UPI & Bank Detection */}
              <View style={styles.modeCard}>
                <View style={styles.modeCardTop}>
                  <View style={[styles.modeIconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Zap size={20} color={Colors.amber} />
                  </View>
                  <View style={styles.modeHeaderTexts}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>Instant UPI Parsing</Text>
                      <View style={[styles.modeTagPill, { backgroundColor: '#FFFBEB' }]}>
                        <Text style={[styles.modeTagText, { color: '#B45309' }]}>
                          Automated
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modeDesc}>
                      Recognizes payments from GPay, PhonePe, Paytm, and bank SMS automatically.
                    </Text>
                  </View>
                </View>

                {/* Feature Chips */}
                <View style={styles.chipRow}>
                  <View style={styles.featureChip}>
                    <Zap size={11} color={Colors.amber} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Real-Time</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <Sparkles size={11} color={Colors.amber} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Zero Typing</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <BellRing size={11} color={Colors.amber} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Smart Match</Text>
                  </View>
                </View>
              </View>

              {/* Feature 2: 100% On-Device Privacy */}
              <View style={styles.modeCard}>
                <View style={styles.modeCardTop}>
                  <View style={[styles.modeIconCircle, { backgroundColor: '#E8F5E9' }]}>
                    <ShieldCheck size={20} color={Colors.moss} />
                  </View>
                  <View style={styles.modeHeaderTexts}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>Private & On-Device</Text>
                      <View style={[styles.modeTagPill, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[styles.modeTagText, { color: Colors.mossDark }]}>
                          100% Private
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.modeDesc}>
                      Parsed locally on your smartphone. SMS texts and notifications are never uploaded.
                    </Text>
                  </View>
                </View>

                {/* Feature Chips */}
                <View style={styles.chipRow}>
                  <View style={styles.featureChip}>
                    <ShieldCheck size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Zero Cloud SMS</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <CheckCircle2 size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>Encrypted Local</Text>
                  </View>
                  <View style={styles.featureChip}>
                    <SlidersHorizontal size={11} color={Colors.moss} strokeWidth={2.5} style={styles.chipIcon} />
                    <Text style={styles.featureChipText}>User Gated</Text>
                  </View>
                </View>
              </View>

              {/* Informational Guidance Notice */}
              <View style={styles.infoNoticeBox}>
                <Sparkles size={14} color={Colors.mossDark} style={{ marginRight: 8 }} />
                <Text style={styles.infoNoticeText}>
                  Kept disabled by default for privacy. You can enable notification auto-capture anytime in Settings.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Paging Dots (3 dots) */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalPages }).map((_, i) => {
          const isActive = i === currentIndex;
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() => goToPage(i)}
              style={[styles.dot, isActive && styles.activeDot]}
            />
          );
        })}
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <AnimatedPressable scaleTo={0.96} onPress={handleNext} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>{getButtonText()}</Text>
        </AnimatedPressable>

        <TouchableOpacity activeOpacity={0.7} onPress={handleSkip} style={styles.ghostBtn}>
          <Text style={styles.ghostBtnText}>
            {isLastStep ? 'Already have an account? Sign In' : t('skipBtn')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  horizontalScrollContent: {
    alignItems: 'center',
  },
  page: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 26,
  },
  pageInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 28,
  },
  desc: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  modeContainer: {
    width: '100%',
    gap: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: Colors.line,
    padding: 13,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  modeCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  modeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  modeHeaderTexts: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  modeTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14.5,
    color: Colors.ink,
  },
  modeTagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeTagText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    letterSpacing: 0.2,
  },
  modeDesc: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    lineHeight: 16.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  chipIcon: {
    marginRight: 4,
  },
  featureChipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  infoNoticeBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
  },
  infoNoticeText: {
    flex: 1,
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.mossDark,
    lineHeight: 16,
  },
  autoCaptureCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  autoCaptureCardLeft: {
    flex: 1,
    gap: 3,
  },
  autoCaptureCardTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  autoCaptureCardSub: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
  },
  autoCaptureNoticeBox: {
    width: '100%',
    backgroundColor: Colors.mist,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    alignItems: 'center',
  },
  autoCaptureNoticeText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    textAlign: 'center',
  },
  autoCapturePrivacyText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    color: Colors.mossDark,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.line,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.moss,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  ghostBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.inkSoft,
  },
});
