import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../../theme/colors';

export const HomeSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.headerRow}>
        <View style={{ gap: 6 }}>
          <Animated.View style={[styles.shimmerBox, { width: 90, height: 12, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 140, height: 24, borderRadius: 6, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 80, height: 10, opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.avatarSkeleton, { opacity: pulseAnim }]} />
      </View>

      {/* Big Stat (Spent Today) Card Skeleton */}
      <View style={styles.bigCard}>
        <View style={styles.bigCardHeader}>
          <Animated.View style={[styles.shimmerBox, { width: 100, height: 12, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerPill, { width: 64, height: 20, opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.shimmerBox, { width: 160, height: 38, borderRadius: 8, marginVertical: 12, opacity: pulseAnim }]} />
        <Animated.View style={[styles.shimmerBox, { width: 120, height: 12, opacity: pulseAnim }]} />
      </View>

      {/* AI Insight Card Skeleton */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Animated.View style={[styles.shimmerBox, { width: 110, height: 12, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerPill, { width: 50, height: 18, opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.shimmerBox, { width: '95%', height: 14, marginVertical: 6, opacity: pulseAnim }]} />
        <Animated.View style={[styles.shimmerBox, { width: '70%', height: 14, opacity: pulseAnim }]} />
      </View>

      {/* Ledger Cards Skeleton (Owed to you / You owe) */}
      <View style={styles.ledgerRow}>
        <View style={styles.ledgerCard}>
          <Animated.View style={[styles.shimmerBox, { width: 70, height: 10, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 90, height: 22, marginTop: 8, borderRadius: 6, opacity: pulseAnim }]} />
        </View>
        <View style={styles.ledgerCard}>
          <Animated.View style={[styles.shimmerBox, { width: 60, height: 10, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 80, height: 22, marginTop: 8, borderRadius: 6, opacity: pulseAnim }]} />
        </View>
      </View>

      {/* Recent Activity Skeleton */}
      <View style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <Animated.View style={[styles.shimmerBox, { width: 120, height: 12, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 50, height: 12, opacity: pulseAnim }]} />
        </View>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.activityRow}>
            <Animated.View style={[styles.activityIcon, { opacity: pulseAnim }]} />
            <View style={{ flex: 1, gap: 6 }}>
              <Animated.View style={[styles.shimmerBox, { width: '60%', height: 14, opacity: pulseAnim }]} />
              <Animated.View style={[styles.shimmerBox, { width: '35%', height: 10, opacity: pulseAnim }]} />
            </View>
            <Animated.View style={[styles.shimmerBox, { width: 60, height: 16, borderRadius: 4, opacity: pulseAnim }]} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  shimmerBox: {
    backgroundColor: Colors.line,
    borderRadius: 4,
  },
  shimmerPill: {
    backgroundColor: Colors.line,
    borderRadius: 12,
  },
  avatarSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.line,
  },
  bigCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  bigCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightCard: {
    backgroundColor: Colors.mossLight,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(62, 107, 92, 0.15)',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ledgerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ledgerCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.line,
  },
});
