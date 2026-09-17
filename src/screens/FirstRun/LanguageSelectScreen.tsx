import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { LanguageOption } from '../../types';
import { useTranslation } from '../../i18n/translations';

const LANGUAGES: LanguageOption[] = [
  { code: 'en', native: 'English', roman: 'Default' },
  { code: 'hi', native: 'हिंदी', roman: 'Hindi' },
  { code: 'mr', native: 'मराठी', roman: 'Marathi' },
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
        return isModalMode ? 'सुरक्षित करें' : 'आगे बढ़ें ›';
      case 'mr':
        return isModalMode ? 'सेव्ह करा' : 'पुढे जा ›';
      default:
        return isModalMode ? 'Save' : 'Continue ›';
    }
  };

  const content = (
    <SafeAreaView style={styles.container} edges={isModalMode ? ['bottom'] : ['top', 'left', 'right', 'bottom']}>
      {isModalMode && (
        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
            <X size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t('languageHeaderEyebrow')}</Text>
          <Text style={styles.title}>{t('chooseLanguageTitle')}</Text>
          <Text style={styles.subtitle}>{t('chooseLanguageSub')}</Text>
        </View>

        <View style={styles.list}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                activeOpacity={0.8}
                onPress={() => setSelectedLanguage(lang.code)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <View style={styles.cardLeft}>
                  <Text style={[styles.nativeText, isSelected && styles.nativeTextSelected]}>
                    {lang.native}
                  </Text>
                  <Text style={styles.romanText}>{lang.roman}</Text>
                </View>
                {isSelected ? (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.radioEmpty} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} onPress={handleContinue} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>{getContinueText()}</Text>
        </TouchableOpacity>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
  },
  eyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 26,
    color: Colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    lineHeight: 19,
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
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  cardSelected: {
    borderColor: Colors.moss,
    backgroundColor: Colors.mossLight,
  },
  cardLeft: {
    gap: 3,
  },
  nativeText: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 18,
    color: Colors.ink,
  },
  nativeTextSelected: {
    color: Colors.moss,
  },
  romanText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  radioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: Colors.mist,
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
});
