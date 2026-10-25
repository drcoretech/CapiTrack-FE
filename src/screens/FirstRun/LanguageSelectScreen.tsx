import React from 'react';
import {
  View,
  Text,
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
import { styles } from './LanguageSelectScreen.styles';

interface LanguageItem extends LanguageOption {
  sample: string;
}

const LANGUAGES: LanguageItem[] = [
  {
    code: 'en',
    native: 'English',
    roman: 'Default',
    sample: 'Daily Expenses & Credit Ledger',
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

