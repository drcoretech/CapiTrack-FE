import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../../theme/colors';

export const ExpenseSkeleton: React.FC = () => {
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
      {/* Eyebrow & Title */}
      <View style={styles.header}>
        <Animated.View style={[styles.shimmerBox, { width: 80, height: 10, marginBottom: 8, opacity: pulseAnim }]} />
        <Animated.View style={[styles.shimmerBox, { width: 140, height: 28, borderRadius: 6, opacity: pulseAnim }]} />
      </View>

      {/* Group 1 Skeleton */}
      <View style={styles.groupContainer}>
        <View style={styles.groupHeader}>
          <Animated.View style={[styles.shimmerBox, { width: 130, height: 12, opacity: pulseAnim }]} />
        </View>
        <View style={styles.list}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.expItem}>
              <View style={styles.left}>
                <Animated.View style={[styles.iconContainer, { opacity: pulseAnim }]} />
                <View style={styles.details}>
                  <Animated.View style={[styles.shimmerBox, { width: 110, height: 15, borderRadius: 4, marginBottom: 6, opacity: pulseAnim }]} />
                  <Animated.View style={[styles.shimmerBox, { width: 75, height: 11, borderRadius: 3, opacity: pulseAnim }]} />
                </View>
              </View>
              <Animated.View style={[styles.shimmerBox, { width: 65, height: 18, borderRadius: 4, opacity: pulseAnim }]} />
            </View>
          ))}
        </View>
      </View>

      {/* Group 2 Skeleton */}
      <View style={styles.groupContainer}>
        <View style={styles.groupHeader}>
          <Animated.View style={[styles.shimmerBox, { width: 150, height: 12, opacity: pulseAnim }]} />
        </View>
        <View style={styles.list}>
          {[1, 2].map((i) => (
            <View key={i} style={styles.expItem}>
              <View style={styles.left}>
                <Animated.View style={[styles.iconContainer, { opacity: pulseAnim }]} />
                <View style={styles.details}>
                  <Animated.View style={[styles.shimmerBox, { width: 95, height: 15, borderRadius: 4, marginBottom: 6, opacity: pulseAnim }]} />
                  <Animated.View style={[styles.shimmerBox, { width: 85, height: 11, borderRadius: 3, opacity: pulseAnim }]} />
                </View>
              </View>
              <Animated.View style={[styles.shimmerBox, { width: 55, height: 18, borderRadius: 4, opacity: pulseAnim }]} />
            </View>
          ))}
        </View>
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
  groupContainer: {
    gap: 8,
  },
  groupHeader: {
    paddingVertical: 4,
  },
  list: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  expItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.line,
  },
  details: {
    flex: 1,
  },
});
