import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Globe, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { LanguageOption } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';

interface LanguageItem extends LanguageOption {
  sample: string;
}

const LANGUAGES: LanguageItem[] = [
  {
    code: 'en',
    native: 'English',
    roman: 'Default',
    sample: 'Daily Expenses & Friends Khata',
  },
  {
    code: 'hi',
    native: 'हिंदी',
    roman: 'Hindi',
    sample: 'दैनिक खर्चे और उधारी हिसाब',
  },
  {
    code: 'mr',
    native: 'मराठी',
    roman: 'Marathi',
    sample: 'दैनिक खर्च आणि उधारी हिशोब',
  },
];

export const LanguageSelectScreen: React.FC = () => {
  const selectedLanguage = useAppStore((state) => state.selectedLanguage);
  const setSelectedLanguage = useAppStore((state) => state.setSelectedLanguage);
  const setFirstRunStep = useAppStore((state) => state.setFirstRunStep);
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const { t } = useTranslation();

  const isModalMode = activeModal === 'language_select';

  const handleContinue = () => {
    if (isModalMode) {
      closeModal();
    } else {
      setFirstRunStep('onboarding');
    }
  };

  const getContinueText = () => {
    switch (selectedLanguage) {
      case 'hi':
        return isModalMode ? 'सुरक्षित करें' : 'आगे बढ़ें';
      case 'mr':
        return isModalMode ? 'सेव्ह करा' : 'पुढे जा';
      default:
        return isModalMode ? 'Save Preference' : 'Continue';
    }
  };

  const content = (
    <SafeAreaView
      style={styles.container}
      edges={isModalMode ? ['bottom'] : ['top', 'left', 'right', 'bottom']}
    >
      {isModalMode && (
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={closeModal}
            style={styles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Globe size={13} color={Colors.moss} style={{ marginRight: 4 }} />
            <Text style={styles.eyebrow}>
              {selectedLanguage === 'mr'
                ? 'भाषा निवडा'
                : selectedLanguage === 'hi'
                ? 'भाषा चुनें'
                : 'LANGUAGE / भाषा'}
            </Text>
          </View>
          <Text style={styles.title}>{t('chooseLanguageTitle')}</Text>
          <Text style={styles.subtitle}>{t('chooseLanguageSub')}</Text>
        </View>

        <View style={styles.list}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <AnimatedPressable
                key={lang.code}
                scaleTo={0.98}
                onPress={() => setSelectedLanguage(lang.code)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.nativeText,
                        isSelected && styles.nativeTextSelected,
                      ]}
                    >
                      {lang.native}
                    </Text>
                    <View
                      style={[
                        styles.romanBadge,
                        isSelected && styles.romanBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.romanText,
                          isSelected && styles.romanTextSelected,
                        ]}
                      >
                        {lang.roman}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sampleText}>{lang.sample}</Text>
                </View>

                {isSelected ? (
                  <View style={styles.checkBadge}>
                    <Check size={14} color="#FFFFFF" strokeWidth={2.8} />
                  </View>
                ) : (
                  <View style={styles.radioEmpty} />
                )}
              </AnimatedPressable>
            );
          })}
        </View>

        {/* Friendly Sub-Notice */}
        <View style={styles.reassurancePill}>
          <Text style={styles.reassuranceText}>
            ⚙️{' '}
            {selectedLanguage === 'mr'
              ? 'तुम्ही ही भाषा नंतर Settings मधून कधीही बदलू शकता.'
              : selectedLanguage === 'hi'
              ? 'आप इसे बाद में Settings में जाकर कभी भी बदल सकते हैं।'
              : 'You can change your language anytime in Settings.'}
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Action */}
      <View style={styles.footer}>
        <AnimatedPressable
          scaleTo={0.97}
          onPress={handleContinue}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>{getContinueText()}</Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );

  if (isModalMode) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.moss,
  },
  title: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 28,
    color: Colors.ink,
    letterSpacing: -0.01,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13.5,
    color: Colors.inkSoft,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    borderColor: Colors.moss,
    backgroundColor: Colors.mossLight,
    shadowColor: Colors.moss,
    shadowOpacity: 0.15,
  },
  cardLeft: {
    gap: 5,
    flex: 1,
    paddingRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nativeText: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 20,
    color: Colors.ink,
  },
  nativeTextSelected: {
    color: Colors.moss,
  },
  romanBadge: {
    backgroundColor: 'rgba(31, 42, 36, 0.06)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  romanBadgeSelected: {
    backgroundColor: 'rgba(62, 107, 92, 0.15)',
  },
  romanText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10,
    color: Colors.inkSoft,
    letterSpacing: 0.3,
  },
  romanTextSelected: {
    color: Colors.moss,
  },
  sampleText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  radioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: 'transparent',
  },
  reassurancePill: {
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: Colors.line,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reassuranceText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: Colors.mist,
    borderTopWidth: 1,
    borderTopColor: 'rgba(220, 224, 217, 0.6)',
  },
  primaryBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
