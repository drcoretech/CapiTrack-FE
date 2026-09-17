import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';

export const SplashScreen: React.FC = () => {
  const setFirstRunStep = useAppStore((state) => state.setFirstRunStep);

  // Animators
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(15)).current;
  const promptPulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // 1. Elastic Logo Pop
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4.5,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Start gentle breathing pulse loop on the mark
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // 3. Staggered Wordmark & Tag reveal
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, 250);

    // 4. Pulsing bottom prompt
    Animated.loop(
      Animated.sequence([
        Animated.timing(promptPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(promptPulse, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Automatic transition after 3.2 seconds
    const timer = setTimeout(() => {
      setFirstRunStep('language');
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => setFirstRunStep('language')}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated Mark / Logo */}
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
          {/* Subtle glowing ring behind */}
          <View style={styles.glowRing} />
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.markImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Animated Wordmark & Tag */}
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
          <Text style={styles.tag}>TRACK. LEND. KNOW.</Text>
        </Animated.View>
      </View>

      {/* Pulsing prompt */}
      <Animated.Text style={[styles.tapPrompt, { opacity: promptPulse }]}>
        Tap anywhere to continue ›
      </Animated.Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  markWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: 'rgba(62, 107, 92, 0.35)',
  },
  markImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    gap: 6,
  },
  wordmark: {
    fontFamily: Fonts.serifMedium,
    color: '#FFFFFF',
    fontSize: 30,
    letterSpacing: 0.6,
  },
  tag: {
    fontFamily: Fonts.monoMedium,
    color: '#8AA69B',
    fontSize: 11,
    letterSpacing: 1.8,
  },
  tapPrompt: {
    position: 'absolute',
    bottom: 50,
    fontFamily: Fonts.monoRegular,
    color: '#A0B4AB',
    fontSize: 12.5,
    letterSpacing: 0.5,
  },
});
