import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Receipt,
  Users,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { styles } from './OnboardingScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const setFirstRunStep = useAppStore((state) => state.setFirstRunStep);
  const setAuthInitialMode = useAppStore((state) => state.setAuthInitialMode);
  const selectedLanguage = useAppStore((state) => state.selectedLanguage);
  const { t } = useTranslation();

  const scrollRef = useRef<ScrollView>(null);

  // Exactly 3 clean visual slides for Phase 1:
  // Slide 0: Daily Expenses
  // Slide 1: Friends Khata & Projects
  // Slide 2: Smart Auto-Capture & Total Privacy
  const totalPages = 3;
  const isLastStep = currentIndex === 2;

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
      setAuthInitialMode('signup');
      setFirstRunStep('auth');
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      setAuthInitialMode('signin');
    } else {
      setAuthInitialMode('signup');
    }
    setFirstRunStep('auth');
  };

  const getButtonText = () => {
    if (isLastStep) {
      if (selectedLanguage === 'mr') return 'सुरू करा';
      if (selectedLanguage === 'hi') return 'शुरू करें';
      return 'Get Started';
    }
    if (selectedLanguage === 'mr') return 'पुढे जा';
    if (selectedLanguage === 'hi') return 'आगे बढ़ें';
    return 'Next Step';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar with Skip */}
      <View style={styles.topBar}>
        <View style={styles.brandTag}>
          <Text style={styles.brandTagText}>CAPITRACK</Text>
        </View>
        {!isLastStep && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSkip}
            style={styles.skipBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.skipBtnText}>{t('skipBtn')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Swipeable Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {/* ================= SLIDE 1: DAILY EXPENSES ================= */}
        <View style={styles.page}>
          <View style={styles.pageContent}>
            {/* Ambient Hero Icon */}
            <View style={styles.heroWrapper}>
              <View style={[styles.haloRing, { backgroundColor: 'rgba(62, 107, 92, 0.15)' }]} />
              <View style={[styles.heroIconBadge, { backgroundColor: Colors.mossLight }]}>
                <Receipt size={36} color={Colors.moss} strokeWidth={2.2} />
              </View>
            </View>

            {/* Punchy Text Copy */}
            <View style={styles.textBlock}>
              <Text style={styles.headline}>
                {selectedLanguage === 'mr'
                  ? 'दैनिक खर्च नोंदवा काही सेकंदात'
                  : selectedLanguage === 'hi'
                  ? 'दैनिक खर्चे दर्ज करें बिना किसी झंझट'
                  : 'Track daily spends without the friction.'}
              </Text>
              <Text style={styles.subheadline}>
                {selectedLanguage === 'mr'
                  ? 'फक्त कॅटेगरी निवडा आणि रक्कम नोंदवा. सोपे आणि झटपट.'
                  : selectedLanguage === 'hi'
                  ? 'बस कैटेगरी चुनें और रकम दर्ज करें। कोई भारी फॉर्म नहीं।'
                  : 'Log day-to-day expenses in seconds with one-tap categories. No complicated forms.'}
              </Text>
            </View>

            {/* Visual Simulated Mockup Card */}
            <View style={styles.previewCard}>
              <View style={styles.previewTopRow}>
                <Text style={styles.previewEyebrow}>TODAY'S EXPENSES</Text>
                <Text style={styles.previewTotal}>₹340</Text>
              </View>

              <View style={styles.previewItemList}>
                <View style={styles.previewItem}>
                  <View style={styles.previewItemLeft}>
                    <Text style={styles.previewEmoji}>🍔</Text>
                    <View>
                      <Text style={styles.previewItemName}>Lunch with team</Text>
                      <Text style={styles.previewItemMeta}>Food · UPI · 1:20pm</Text>
                    </View>
                  </View>
                  <Text style={styles.previewItemAmt}>₹150</Text>
                </View>

                <View style={styles.previewItem}>
                  <View style={styles.previewItemLeft}>
                    <Text style={styles.previewEmoji}>🚕</Text>
                    <View>
                      <Text style={styles.previewItemName}>Auto to office</Text>
                      <Text style={styles.previewItemMeta}>Travel · Cash · 9:05am</Text>
                    </View>
                  </View>
                  <Text style={styles.previewItemAmt}>₹190</Text>
                </View>
              </View>

              <View style={styles.categoryPillRow}>
                <View style={[styles.catPill, styles.catPillActive]}>
                  <Text style={[styles.catPillText, styles.catPillTextActive]}>🍔 Food</Text>
                </View>
                <View style={styles.catPill}>
                  <Text style={styles.catPillText}>🚕 Travel</Text>
                </View>
                <View style={styles.catPill}>
                  <Text style={styles.catPillText}>🛍️ Shopping</Text>
                </View>
                <View style={styles.catPill}>
                  <Text style={styles.catPillText}>⚡ Bills</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ================= SLIDE 2: FRIENDS KHATA & PROJECTS ================= */}
        <View style={styles.page}>
          <View style={styles.pageContent}>
            {/* Ambient Hero Icon */}
            <View style={styles.heroWrapper}>
              <View style={[styles.haloRing, { backgroundColor: 'rgba(201, 138, 62, 0.15)' }]} />
              <View style={[styles.heroIconBadge, { backgroundColor: Colors.amberLight }]}>
                <Users size={36} color={Colors.amber} strokeWidth={2.2} />
              </View>
            </View>

            {/* Punchy Text Copy */}
            <View style={styles.textBlock}>
              <Text style={styles.headline}>
                {selectedLanguage === 'mr'
                  ? 'कोणाकडून किती घ्यायचे, कधीही विसरू नका'
                  : selectedLanguage === 'hi'
                  ? 'कौन कितना देगा, कभी न भूलें'
                  : 'Never forget who owes who.'}
              </Text>
              <Text style={styles.subheadline}>
                {selectedLanguage === 'mr'
                  ? 'मित्रांचे उधारी खाते आणि क्लायंट प्रोजेक्ट्सचे हिशोब एकाच ठिकाणी.'
                  : selectedLanguage === 'hi'
                  ? 'दोस्तों का उधारी खाता और क्लाइंट प्रोजेक्ट्स का हिसाब एक जगह।'
                  : 'Keep a running credit ledger for friends and freelance client milestone dues in one place.'}
              </Text>
            </View>

            {/* Visual Simulated Mockup Card */}
            <View style={styles.previewCard}>
              <View style={styles.previewTopRow}>
                <Text style={styles.previewEyebrow}>RUNNING BALANCES</Text>
                <Text style={[styles.previewTotal, { color: Colors.moss }]}>+₹7,500</Text>
              </View>

              <View style={styles.previewItemList}>
                <View style={styles.previewItem}>
                  <View style={styles.previewItemLeft}>
                    <View style={[styles.avatarCircle, { backgroundColor: Colors.mossLight }]}>
                      <Text style={[styles.avatarText, { color: Colors.moss }]}>A</Text>
                    </View>
                    <View>
                      <Text style={styles.previewItemName}>Akssh</Text>
                      <Text style={styles.previewItemMeta}>Lent for dinner · 3 Sep</Text>
                    </View>
                  </View>
                  <View style={styles.balanceTag}>
                    <Text style={styles.balanceOwedText}>+₹1,400</Text>
                    <Text style={styles.balanceSubText}>Owes you</Text>
                  </View>
                </View>

                <View style={styles.previewItem}>
                  <View style={styles.previewItemLeft}>
                    <View style={[styles.avatarCircle, { backgroundColor: Colors.brickLight }]}>
                      <Text style={[styles.avatarText, { color: Colors.brick }]}>S</Text>
                    </View>
                    <View>
                      <Text style={styles.previewItemName}>Sahil</Text>
                      <Text style={styles.previewItemMeta}>Concert ticket · 1 Sep</Text>
                    </View>
                  </View>
                  <View style={styles.balanceTag}>
                    <Text style={styles.balanceOweText}>−₹900</Text>
                    <Text style={styles.balanceSubText}>You owe</Text>
                  </View>
                </View>

                {/* Milestone Project Bar */}
                <View style={styles.projectSnippet}>
                  <View style={styles.projectSnippetHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Briefcase size={13} color="#0D9488" />
                      <Text style={styles.projectSnippetTitle}>Acme Mobile App</Text>
                    </View>
                    <Text style={styles.projectSnippetStatus}>60% Paid</Text>
                  </View>
                  <View style={styles.progressBarWrap}>
                    <View style={[styles.progressBarFill, { width: '60%' }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ================= SLIDE 3: SMART AUTO-CAPTURE & PRIVACY ================= */}
        <View style={styles.page}>
          <View style={styles.pageContent}>
            {/* Ambient Hero Icon */}
            <View style={styles.heroWrapper}>
              <View style={[styles.haloRing, { backgroundColor: 'rgba(62, 107, 92, 0.18)' }]} />
              <View style={[styles.heroIconBadge, { backgroundColor: Colors.mossLight }]}>
                <Zap size={36} color={Colors.moss} strokeWidth={2.2} />
              </View>
            </View>

            {/* Punchy Text Copy */}
            <View style={styles.textBlock}>
              <Text style={styles.headline}>
                {selectedLanguage === 'mr'
                  ? 'ऑटो-कॅप्चर आणि १००% सुरक्षितता'
                  : selectedLanguage === 'hi'
                  ? 'ऑटो-कैप्चर और १००% प्राइवेसी'
                  : 'Smart auto-capture with total privacy.'}
              </Text>
              <Text style={styles.subheadline}>
                {selectedLanguage === 'mr'
                  ? 'यूपीआय ट्रान्झॅक्शन आपोआप ओळखते. कोणताही मेसेज क्लाउडवर जात नाही.'
                  : selectedLanguage === 'hi'
                  ? 'UPI ट्रांसैक्शन अपने आप पहचानता है। कोई भी पर्सनल SMS क्लाउड पर नहीं जाता।'
                  : 'Detects UPI payments on-device without manual typing. 100% offline privacy.'}
              </Text>
            </View>

            {/* Visual Simulated Mockup Card */}
            <View style={styles.previewCard}>
              <View style={styles.nudgeSimulation}>
                <View style={styles.nudgeTop}>
                  <View style={styles.nudgeSource}>
                    <Text style={styles.nudgeBolt}>⚡</Text>
                    <Text style={styles.nudgeSourceText}>PHONEPE / HDFC BANK</Text>
                  </View>
                  <Text style={styles.nudgeTime}>Just now</Text>
                </View>

                <Text style={styles.nudgeBody}>
                  ₹240 paid to Starbucks India
                </Text>

                <View style={styles.nudgeActionRow}>
                  <View style={styles.nudgeAssignedChip}>
                    <CheckCircle2 size={12} color={Colors.moss} style={{ marginRight: 4 }} />
                    <Text style={styles.nudgeAssignedText}>Auto-saved as Food & Dining</Text>
                  </View>
                </View>
              </View>

              <View style={styles.privacyBanner}>
                <ShieldCheck size={16} color={Colors.moss} style={{ marginRight: 6 }} />
                <Text style={styles.privacyBannerText}>
                  100% On-Device · Zero Cloud SMS Uploads
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Dynamic Animated Pagination Capsules */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalPages }).map((_, i) => {
          const isActive = i === currentIndex;
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() => goToPage(i)}
              style={[styles.dot, isActive && styles.activeDot]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            />
          );
        })}
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <AnimatedPressable
          scaleTo={0.97}
          onPress={handleNext}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>{getButtonText()}</Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
        </AnimatedPressable>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSkip}
          style={styles.ghostBtn}
          hitSlop={{ top: 6, bottom: 6, left: 10, right: 10 }}
        >
          <Text style={styles.ghostBtnText}>
            {isLastStep
              ? selectedLanguage === 'mr'
                ? 'आधीपासून खाते आहे का? साइन इन करा'
                : selectedLanguage === 'hi'
                ? 'पहले से अकाउंट है? साइन इन करें'
                : 'Already have an account? Sign In'
              : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

