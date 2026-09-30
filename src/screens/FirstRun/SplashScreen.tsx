import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const setFirstRunStep = useAppStore((state) => state.setFirstRunStep);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const isCompletedRef = useRef(hasCompletedOnboarding);
  const hasTransitionedRef = useRef(false);

  // Entrance & Exit Animators
  const containerFade = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;
  const badgeSlide = useRef(new Animated.Value(15)).current;
  const promptPulse = useRef(new Animated.Value(0.2)).current;

  const handleProceed = () => {
    if (hasTransitionedRef.current) return;
    hasTransitionedRef.current = true;

    // Smooth exit dissolve before swapping screens
    Animated.timing(containerFade, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      const isAuth = useAppStore.getState().isAuthenticated;
      if (isAuth) {
        setFirstRunStep('main');
      } else {
        setFirstRunStep('onboarding');
      }
    });
  };

  useEffect(() => {
    // Check persistent storage immediately on mount
    AsyncStorage.getItem('@capitrack_auth_token')
      .then((token) => {
        if (token && token.trim().length > 0) {
          isCompletedRef.current = true;
          useAppStore.setState({ isAuthenticated: true });
        } else {
          isCompletedRef.current = false;
        }
      })
      .catch(() => {});

    // 1. Stage 1: Ambient Glow Expansion & Elastic Logo Spring
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 110,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(glowScale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.85,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Start gentle breathing pulse loop on the mark
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.04,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // 3. Stage 2: Staggered Wordmark & Tagline reveal
    const textTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // 4. Stage 3: Privacy & Security Trust Pill reveal
    const badgeTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(badgeFade, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(badgeSlide, {
          toValue: 0,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }, 450);

    // 5. Pulsing bottom skip prompt
    Animated.loop(
      Animated.sequence([
        Animated.timing(promptPulse, {
          toValue: 0.9,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(promptPulse, {
          toValue: 0.25,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 6. Automatic transition:
    // Returning users get a sleek 1.3s introduction directly into dashboard.
    // Brand new users get 2.4s before moving to onboarding.
    const transitionDelay = isCompletedRef.current ? 1300 : 2400;
    const exitTimer = setTimeout(() => {
      handleProceed();
    }, transitionDelay);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(badgeTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <Animated.View style={[styles.outerContainer, { opacity: containerFade }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleProceed}
        style={styles.touchArea}
      >
        {/* Soft Ambient Background Aura */}
        <Animated.View
          style={[
            styles.ambientAura,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        <View style={styles.content}>
          {/* Animated Logo Mark with Dynamic Layered Glass Rings */}
          <Animated.View
            style={[
              styles.markWrapper,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, pulseScale) },
                ],
              },
            ]}
          >
            {/* Outer Soft Halo */}
            <View style={styles.outerHalo} />
            {/* Inner Emerald Glass Ring */}
            <View style={styles.innerGlassRing} />
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.markImage}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Animated Wordmark & Tagline */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textFade,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            <Text style={styles.wordmark}>CapiTrack</Text>
            <View style={styles.taglineWrapper}>
              <View style={styles.taglineLine} />
              <Text style={styles.tag}>FINANCIAL CLARITY, EFFORTLESSLY</Text>
              <View style={styles.taglineLine} />
            </View>
          </Animated.View>

          {/* Privacy & Security Trust Badge */}
          <Animated.View
            style={[
              styles.trustBadge,
              {
                opacity: badgeFade,
                transform: [{ translateY: badgeSlide }],
              },
            ]}
          >
            <Text style={styles.trustBadgeIcon}>🔒</Text>
            <Text style={styles.trustBadgeText}>100% On-Device · Zero Cloud Snooping</Text>
          </Animated.View>
        </View>

        {/* Pulsing Skip Prompt */}
        <Animated.View style={[styles.promptContainer, { opacity: promptPulse }]}>
          <Text style={styles.tapPrompt}>Tap anywhere to continue</Text>
          <Text style={styles.promptChevron}>›</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0E1411', // Deep Obsidian Emerald
  },
  touchArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientAura: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_WIDTH * 0.95,
    borderRadius: (SCREEN_WIDTH * 0.95) / 2,
    backgroundColor: 'rgba(62, 107, 92, 0.22)',
    top: SCREEN_HEIGHT * 0.22,
  },
  content: {
    alignItems: 'center',
    gap: 20,
    zIndex: 2,
  },
  markWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  outerHalo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 38,
    backgroundColor: 'rgba(62, 107, 92, 0.20)',
  },
  innerGlassRing: {
    position: 'absolute',
    width: 98,
    height: 98,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  markImage: {
    width: 84,
    height: 84,
    borderRadius: 26,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    fontFamily: Fonts.serifSemiBold,
    color: '#FFFFFF',
    fontSize: 34,
    letterSpacing: -0.02,
  },
  taglineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  taglineLine: {
    width: 16,
    height: 1,
    backgroundColor: 'rgba(143, 168, 156, 0.35)',
  },
  tag: {
    fontFamily: Fonts.monoMedium,
    color: '#8FA89C',
    fontSize: 10,
    letterSpacing: 2.2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 100,
    marginTop: 8,
  },
  trustBadgeIcon: {
    fontSize: 11,
  },
  trustBadgeText: {
    fontFamily: Fonts.monoRegular,
    color: '#B6CBC2',
    fontSize: 10.5,
    letterSpacing: 0.4,
  },
  promptContainer: {
    position: 'absolute',
    bottom: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tapPrompt: {
    fontFamily: Fonts.sansRegular,
    color: '#7D958A',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  promptChevron: {
    fontFamily: Fonts.monoMedium,
    color: '#7D958A',
    fontSize: 14,
  },
});
