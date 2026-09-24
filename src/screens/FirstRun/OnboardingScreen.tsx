import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, Briefcase, User, BookOpen, SlidersHorizontal, Zap, Sparkles } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { notificationListener } from '../../services/notificationListener';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const userName = useAppStore((state) => state.userName);
  const [inputName, setInputName] = useState(userName || 'Digvijay');
  const [selectedMode, setSelectedMode] = useState<'both' | 'personal'>('personal');
  const autoCaptureEnabled = useAppStore((state) => state.autoCaptureEnabled);
  const toggleAutoCapture = useAppStore((state) => state.toggleAutoCapture);
  const setFirstRunStep = useAppStore((state) => state.setFirstRunStep);
  const setUserName = useAppStore((state) => state.setUserName);
  const { t } = useTranslation();

  const scrollRef = useRef<ScrollView>(null);

  // Exactly 4 pages total:
  // Page 0: Combined Expenses & Khata
  // Page 1: Choose Tracking Mode (Personal Only vs Both Personal & Freelance Projects)
  // Page 2: Auto-Capture (with Settings redirect on enable)
  // Page 3: Name Input Step
  const totalPages = 4;
  const isNameStep = currentIndex === 3;

  const handleToggleAutoCapture = async () => {
    const nextVal = !autoCaptureEnabled;
    await toggleAutoCapture();
    if (nextVal) {
      await notificationListener.openSettings();
    }
  };

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
      // Final Step: Complete Onboarding
      const targetName = inputName.trim() || 'Digvijay';
      const isBusinessActive = selectedMode === 'both';

      // Persist chosen workflow mode
      useAppStore.setState({ businessTrackingEnabled: isBusinessActive });
      AsyncStorage.setItem('@capitrack_business_tracking_enabled', isBusinessActive ? 'true' : 'false').catch(() => {});

      // Persist onboarding completed flag immediately
      AsyncStorage.setItem('@capitrack_onboarding_completed', 'true').catch(() => {});
      useAppStore.setState({ hasCompletedOnboarding: true });

      // Immediate instant navigation to dashboard
      setFirstRunStep('main');
      // Fire name update and persistence in background
      setUserName(targetName).catch(() => {});
    }
  };

  const handleSkip = () => {
    goToPage(3); // Jump directly to Name step
  };

  const getButtonText = () => {
    if (isNameStep) return t('getStartedBtn');
    if (currentIndex === 2) return t('continueBtn');
    return t('nextBtn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
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

          {/* Screen 2: Choose Workflow Mode (Personal vs Both) */}
          <View style={styles.page}>
            <View style={styles.pageInner}>
              <View style={[styles.heroIcon, { backgroundColor: Colors.mossLight }]}>
                <SlidersHorizontal size={40} color={Colors.moss} strokeWidth={2} />
              </View>

              <Text style={styles.title}>{t('onboardingModeTitle')}</Text>
              <Text style={styles.desc}>{t('onboardingModeDesc')}</Text>

              {/* Mode Selection Cards */}
              <View style={styles.modeContainer}>
                {/* Option 1: Personal Expenses Only (Default) */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSelectedMode('personal')}
                  style={[
                    styles.modeCard,
                    selectedMode === 'personal' && styles.modeCardActive,
                  ]}
                >
                  <View style={styles.modeCardTop}>
                    <View style={styles.modeIconCircle}>
                      <User size={20} color={selectedMode === 'personal' ? Colors.moss : Colors.inkSoft} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modeTitle}>{t('modePersonalTitle')}</Text>
                      <Text style={styles.modeDesc}>{t('modePersonalDesc')}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedMode === 'personal' && styles.radioCircleActive,
                      ]}
                    >
                      {selectedMode === 'personal' && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Option 2: Personal + Freelance Projects */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSelectedMode('both')}
                  style={[
                    styles.modeCard,
                    selectedMode === 'both' && styles.modeCardActive,
                  ]}
                >
                  <View style={styles.modeCardTop}>
                    <View style={styles.modeIconCircle}>
                      <Briefcase size={20} color={selectedMode === 'both' ? Colors.moss : Colors.inkSoft} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modeTitle}>{t('modeBothTitle')}</Text>
                      <Text style={styles.modeDesc}>{t('modeBothDesc')}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedMode === 'both' && styles.radioCircleActive,
                      ]}
                    >
                      {selectedMode === 'both' && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Screen 3: Smart Auto-Capture with Settings Redirect */}
          <View style={styles.page}>
            <View style={styles.pageInner}>
              <View style={[styles.heroIcon, { backgroundColor: Colors.amberLight }]}>
                <Zap size={40} color={Colors.amber} strokeWidth={2} />
              </View>

              <Text style={styles.title}>{t('onboardingAutoCaptureTitle')}</Text>
              <Text style={styles.desc}>{t('onboardingAutoCaptureDesc')}</Text>

              {/* Interactive Auto-Capture Toggle Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleToggleAutoCapture}
                style={styles.autoCaptureCard}
              >
                <View style={styles.autoCaptureCardLeft}>
                  <Text style={styles.autoCaptureCardTitle}>{t('enableAutoCaptureLabel')}</Text>
                  <Text style={[styles.autoCaptureCardSub, { color: autoCaptureEnabled ? Colors.moss : Colors.inkSoft }]}>
                    {autoCaptureEnabled ? t('autoCaptureStatusOn') : t('autoCaptureStatusOff')}
                  </Text>
                </View>
                <Switch
                  value={autoCaptureEnabled}
                  onValueChange={handleToggleAutoCapture}
                  trackColor={{ false: Colors.line, true: Colors.moss }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>

              <View style={styles.autoCaptureNoticeBox}>
                <Text style={styles.autoCaptureNoticeText}>{t('autoCaptureOffNotice')}</Text>
                <Text style={styles.autoCapturePrivacyText}>{t('privateOnDeviceNote')}</Text>
              </View>
            </View>
          </View>

          {/* Screen 4: Name Customization Step */}
          <View style={styles.page}>
            <View style={styles.pageInner}>
              <View style={[styles.heroIcon, { backgroundColor: Colors.mossLight }]}>
                <Sparkles size={40} color={Colors.moss} strokeWidth={2} />
              </View>

              <Text style={styles.title}>{t('whatShouldWeCallYou')}</Text>
              <Text style={styles.desc}>{t('nameSubDesc')}</Text>

              <View style={styles.nameInputContainer}>
                <TextInput
                  value={inputName}
                  onChangeText={setInputName}
                  placeholder={t('enterNamePlaceholder')}
                  placeholderTextColor={Colors.inkSoft}
                  style={styles.nameInput}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Paging Dots (4 dots) */}
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

          {currentIndex > 0 && !isNameStep ? (
            <TouchableOpacity activeOpacity={0.7} onPress={handleSkip} style={styles.ghostBtn}>
              <Text style={styles.ghostBtnText}>{t('skipBtn')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.ghostBtnPlaceholder} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  keyboardView: {
    flex: 1,
  },
  horizontalScrollContent: {
    alignItems: 'center',
  },
  page: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  pageInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroEmoji: {
    fontSize: 38,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  desc: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13.5,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  modeContainer: {
    width: '100%',
    gap: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  modeCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 16,
  },
  modeCardActive: {
    borderColor: Colors.moss,
    backgroundColor: '#F7FAF7',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  modeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14.5,
    color: Colors.ink,
  },
  modeDesc: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 3,
    lineHeight: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
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
  nameInputContainer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.moss,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 8,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  nameInput: {
    fontFamily: Fonts.sansMedium,
    fontSize: 18,
    color: Colors.ink,
    paddingVertical: 12,
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
  ghostBtnPlaceholder: {
    height: 34,
  },
});
