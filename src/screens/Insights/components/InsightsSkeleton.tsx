import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../../theme/colors';
import { useAppStore } from '../../../store/useAppStore';

export const InsightsSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;
  const businessTrackingEnabled = useAppStore((state) => state.businessTrackingEnabled);
  const insightsSubTab = useAppStore((state) => state.insightsSubTab);

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
        <Animated.View style={[styles.shimmerBox, { width: 110, height: 10, marginBottom: 8, opacity: pulseAnim }]} />
        <Animated.View style={[styles.shimmerBox, { width: 160, height: 28, borderRadius: 6, opacity: pulseAnim }]} />
      </View>

      {/* Segmented Sub-Tab Switcher Skeleton */}
      {businessTrackingEnabled && (
        <View style={styles.segmentContainer}>
          <View
            style={[
              styles.segmentBtn,
              insightsSubTab === 'personal' && styles.segmentBtnActive,
            ]}
          >
            <Animated.View
              style={[styles.shimmerBox, { width: 90, height: 14, opacity: pulseAnim }]}
            />
          </View>
          <View
            style={[
              styles.segmentBtn,
              insightsSubTab === 'revenue' && styles.segmentBtnActive,
            ]}
          >
            <Animated.View
              style={[styles.shimmerBox, { width: 100, height: 14, opacity: pulseAnim }]}
            />
          </View>
        </View>
      )}

      {/* Month Selector Bar */}
      <View style={styles.monthBar}>
        <Animated.View style={[styles.shimmerBox, { width: 28, height: 28, borderRadius: 14, opacity: pulseAnim }]} />
        <Animated.View style={[styles.shimmerBox, { width: 130, height: 18, borderRadius: 6, opacity: pulseAnim }]} />
        <Animated.View style={[styles.shimmerBox, { width: 28, height: 28, borderRadius: 14, opacity: pulseAnim }]} />
      </View>

      {/* Month Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Animated.View style={[styles.shimmerBox, { width: 110, height: 12, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 70, height: 22, borderRadius: 12, opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.shimmerBox, { width: 180, height: 38, borderRadius: 8, marginVertical: 14, opacity: pulseAnim }]} />
        <View style={styles.heroStatsRow}>
          <View style={{ flex: 1, gap: 6 }}>
            <Animated.View style={[styles.shimmerBox, { width: 60, height: 10, opacity: pulseAnim }]} />
            <Animated.View style={[styles.shimmerBox, { width: 70, height: 18, borderRadius: 4, opacity: pulseAnim }]} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Animated.View style={[styles.shimmerBox, { width: 65, height: 10, opacity: pulseAnim }]} />
            <Animated.View style={[styles.shimmerBox, { width: 75, height: 18, borderRadius: 4, opacity: pulseAnim }]} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Animated.View style={[styles.shimmerBox, { width: 55, height: 10, opacity: pulseAnim }]} />
            <Animated.View style={[styles.shimmerBox, { width: 60, height: 18, borderRadius: 4, opacity: pulseAnim }]} />
          </View>
        </View>
      </View>

      {/* Spend Charts Card */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Animated.View style={[styles.shimmerBox, { width: 100, height: 12, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 120, height: 26, borderRadius: 8, opacity: pulseAnim }]} />
        </View>
        <View style={styles.chartBars}>
          {[40, 65, 85, 30, 95, 55, 75].map((h, idx) => (
            <View key={idx} style={styles.barColumn}>
              <Animated.View
                style={[
                  styles.shimmerBar,
                  { height: h, opacity: pulseAnim },
                ]}
              />
              <Animated.View style={[styles.shimmerBox, { width: 18, height: 8, marginTop: 6, opacity: pulseAnim }]} />
            </View>
          ))}
        </View>
      </View>

      {/* Category Breakdown Card */}
      <View style={styles.breakdownCard}>
        <View style={styles.chartHeader}>
          <Animated.View style={[styles.shimmerBox, { width: 130, height: 12, opacity: pulseAnim }]} />
          <Animated.View style={[styles.shimmerBox, { width: 50, height: 12, opacity: pulseAnim }]} />
        </View>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.categoryRow}>
            <View style={styles.catInfoRow}>
              <Animated.View style={[styles.shimmerBox, { width: 90, height: 14, borderRadius: 4, opacity: pulseAnim }]} />
              <Animated.View style={[styles.shimmerBox, { width: 60, height: 14, borderRadius: 4, opacity: pulseAnim }]} />
            </View>
            <Animated.View style={[styles.progressBar, { opacity: pulseAnim }]} />
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
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroStatsRow: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
    paddingTop: 10,
    paddingBottom: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  shimmerBar: {
    width: 22,
    borderRadius: 6,
    backgroundColor: Colors.line,
  },
  breakdownCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 16,
  },
  categoryRow: {
    gap: 6,
  },
  catInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.line,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
  },
});
