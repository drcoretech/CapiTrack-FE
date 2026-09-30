import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Fingerprint, Lock, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { biometrics } from '../../services/biometrics';
import { haptics } from '../../services/haptics';

export const BiometricLockScreen: React.FC = () => {
  const setAppLocked = useAppStore((state) => state.setAppLocked);
  const userName = useAppStore((state) => state.userName);
  const [bioLabel, setBioLabel] = useState('Face ID / Fingerprint');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    biometrics.getTypeLabel().then((label) => {
      setBioLabel(label);
    });
    // Auto-prompt biometric on appear
    const timer = setTimeout(() => {
      handleUnlock();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleUnlock = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    haptics.light();
    try {
      const success = await biometrics.authenticate('Unlock CapiTrack');
      if (success) {
        haptics.success();
        setAppLocked(false);
      } else {
        haptics.error();
      }
    } catch {
      haptics.error();
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Lockup */}
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandName}>CAPITRACK</Text>
        </View>

        {/* Center Shield Graphic */}
        <View style={styles.centerGraphic}>
          <View style={styles.outerAura}>
            <View style={styles.innerAura}>
              <View style={styles.iconCircle}>
                <Fingerprint size={42} color={Colors.card} strokeWidth={1.8} />
              </View>
            </View>
          </View>

          <Text style={styles.title}>CapiTrack is Locked</Text>
          <Text style={styles.subtitle}>
            {userName ? `Welcome back, ${userName}. ` : ''}
            Biometric verification is required to access your financial records.
          </Text>

          <View style={styles.privacyBadge}>
            <Shield size={13} color={Colors.card} strokeWidth={2} />
            <Text style={styles.privacyBadgeText}>100% On-Device Biometric Security</Text>
          </View>
        </View>

        {/* Footer Action */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleUnlock}
            style={styles.unlockBtn}
          >
            <Lock size={18} color="#FFFFFF" strokeWidth={2.2} style={{ marginRight: 8 }} />
            <Text style={styles.unlockBtnText}>Unlock with {bioLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1411', // Obsidian Emerald
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.moss,
  },
  brandName: {
    fontFamily: Fonts.monoMedium,
    fontSize: 12,
    letterSpacing: 3,
    color: '#8CA598',
  },
  centerGraphic: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  outerAura: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(62, 107, 92, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  innerAura: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(62, 107, 92, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  title: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 26,
    color: '#F4F7F4',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    lineHeight: 21,
    color: '#A3B8AD',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 20,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  privacyBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: '#C6D8CE',
    letterSpacing: 0.3,
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.moss,
    borderRadius: 16,
    paddingVertical: 17,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  unlockBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
