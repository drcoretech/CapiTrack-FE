import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../../theme/colors';

export const LedgerSkeleton: React.FC = () => {
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
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.shimmerBox, { width: 95, height: 10, marginBottom: 8, opacity: pulseAnim }]} />
        <Animated.View style={[styles.shimmerBox, { width: 130, height: 28, borderRadius: 6, opacity: pulseAnim }]} />
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Animated.View style={[styles.shimmerBox, { width: 85, height: 26, borderRadius: 6, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 95, height: 11, marginTop: 8, opacity: pulseAnim }]} />
        </View>
        <View style={styles.summaryCard}>
          <Animated.View style={[styles.shimmerBox, { width: 75, height: 26, borderRadius: 6, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 80, height: 11, marginTop: 8, opacity: pulseAnim }]} />
        </View>
      </View>

      {/* Person Items List */}
      <View style={styles.list}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.personItem}>
            <View style={styles.personLeft}>
              <Animated.View style={[styles.avatar, { opacity: pulseAnim }]} />
              <View style={styles.personDetails}>
                <Animated.View style={[styles.shimmerBox, { width: 120, height: 16, borderRadius: 4, marginBottom: 6, opacity: pulseAnim }]} />
                <Animated.View style={[styles.shimmerBox, { width: 80, height: 11, borderRadius: 3, opacity: pulseAnim }]} />
              </View>
            </View>
            <View style={styles.personRight}>
              <Animated.View style={[styles.shimmerBox, { width: 70, height: 22, borderRadius: 6, opacity: pulseAnim }]} />
            </View>
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
  header: {
    marginBottom: 4,
  },
  shimmerBox: {
    backgroundColor: Colors.line,
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  list: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  personLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.line,
  },
  personDetails: {
    flex: 1,
  },
  personRight: {
    alignItems: 'flex-end',
  },
});
