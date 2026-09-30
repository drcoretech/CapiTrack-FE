import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { notificationListener } from '../../services/notificationListener';
import { biometrics } from '../../services/biometrics';
import { haptics } from '../../services/haptics';

export const SettingsScreen: React.FC = () => {
  const autoCaptureEnabled = useAppStore((state) => state.autoCaptureEnabled);
  const toggleAutoCapture = useAppStore((state) => state.toggleAutoCapture);
  const businessTrackingEnabled = useAppStore((state) => state.businessTrackingEnabled);
  const toggleBusinessTracking = useAppStore((state) => state.toggleBusinessTracking);
  const isBiometricEnabled = useAppStore((state) => state.isBiometricEnabled);
  const toggleBiometricLock = useAppStore((state) => state.toggleBiometricLock);
  const selectedLanguage = useAppStore((state) => state.selectedLanguage);
  const categories = useAppStore((state) => state.categories);
  const openModal = useAppStore((state) => state.openModal);
  const setFirstRunStep = useAppStore((state) => state.setFirstRunStep);
  const { t } = useTranslation();

  const [bioLabel, setBioLabel] = React.useState('Face ID / Fingerprint');

  React.useEffect(() => {
    biometrics.getTypeLabel().then(setBioLabel);
  }, []);

  const activeCategoriesCount = categories.filter((c) => c.enabled).length;

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'hi':
        return 'हिंदी (Hindi)';
      case 'mr':
        return 'मराठी (Marathi)';
      default:
        return 'English (Default)';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settingsTitle')}</Text>
        </View>

        <View style={styles.settingsGroup}>
          {/* Freelance & Client Projects Tracking */}
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>Freelance & Client Projects</Text>
              <Text style={[styles.itemSub, { color: businessTrackingEnabled ? Colors.moss : Colors.inkSoft }]}>
                {businessTrackingEnabled ? 'Active (Website deals, milestones & dues)' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={businessTrackingEnabled}
              onValueChange={toggleBusinessTracking}
              trackColor={{ false: Colors.line, true: Colors.moss }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Auto-Capture Toggle */}
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>{t('autoCaptureTitle')}</Text>
              <Text style={[styles.itemSub, { color: autoCaptureEnabled ? Colors.moss : Colors.inkSoft }]}>
                {autoCaptureEnabled ? t('autoCaptureActive') : t('autoCaptureOff')}
              </Text>
            </View>
            <Switch
              value={autoCaptureEnabled}
              onValueChange={async () => {
                const nextVal = !autoCaptureEnabled;
                await toggleAutoCapture();
                if (nextVal) {
                  await notificationListener.openSettings();
                }
              }}
              trackColor={{ false: Colors.line, true: Colors.moss }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Biometric App Lock */}
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>App Lock ({bioLabel})</Text>
              <Text style={[styles.itemSub, { color: isBiometricEnabled ? Colors.moss : Colors.inkSoft }]}>
                {isBiometricEnabled
                  ? `Protected with ${bioLabel}`
                  : `Require ${bioLabel} to open CapiTrack`}
              </Text>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={async () => {
                haptics.selection();
                const success = await toggleBiometricLock();
                if (success) {
                  haptics.success();
                } else {
                  haptics.warning();
                }
              }}
              trackColor={{ false: Colors.line, true: Colors.moss }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Manage Categories (Fully Interactive) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openModal('manage_categories')}
            style={styles.item}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>{t('manageCategoriesTitle')}</Text>
              <Text style={styles.itemSub}>
                {t('activeCategoriesCount', { count: activeCategoriesCount })}
              </Text>
            </View>
            <Text style={styles.ghostBtnText}>{t('editGhost')}</Text>
          </TouchableOpacity>

          {/* App Language */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openModal('language_select')}
            style={styles.item}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>{t('appLanguageTitle')}</Text>
              <Text style={styles.itemSub}>{getLanguageLabel(selectedLanguage)}</Text>
            </View>
            <Text style={styles.ghostBtnText}>{t('changeGhost')}</Text>
          </TouchableOpacity>

          {/* App Onboarding & Mode Setup Wizard */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFirstRunStep('onboarding')}
            style={[styles.item, styles.lastItem]}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>Onboarding & Mode Wizard</Text>
              <Text style={styles.itemSub}>
                {businessTrackingEnabled ? 'Personal + Freelance Mode' : 'Personal Only Mode'} • Re-run setup
              </Text>
            </View>
            <Text style={styles.ghostBtnText}>Replay ›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 26,
    color: Colors.ink,
  },
  settingsGroup: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  disabledItem: {
    opacity: 0.65,
  },
  disabledText: {
    color: Colors.inkSoft,
  },
  itemLeft: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  itemSub: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  ghostBtnText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 12,
    color: Colors.moss,
  },
});
