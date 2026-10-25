import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Colors } from '../../../theme/colors';
import { styles } from './LedgerSkeleton.styles';
import { useAppStore } from '../../../store/useAppStore';

interface LedgerSkeletonProps {
  subTab?: 'personal' | 'projects';
}

export const LedgerSkeleton: React.FC<LedgerSkeletonProps> = ({ subTab: propSubTab }) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;
  const storeSubTab = useAppStore((state) => state.ledgerSubTab);
  const businessTrackingEnabled = useAppStore((state) => state.businessTrackingEnabled);

  const activeSubTab = propSubTab || (businessTrackingEnabled ? storeSubTab : 'personal');

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
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.shimmerBox,
            { width: activeSubTab === 'projects' ? 140 : 95, height: 10, marginBottom: 8, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerBox,
            { width: activeSubTab === 'projects' ? 200 : 130, height: 28, borderRadius: 6, opacity: pulseAnim },
          ]}
        />
      </View>

      {/* Segmented Sub-Tab Switcher Skeleton */}
      {businessTrackingEnabled && (
        <View style={styles.segmentContainer}>
          <View
            style={[
              styles.segmentBtn,
              activeSubTab === 'personal' && styles.segmentBtnActive,
            ]}
          >
            <Animated.View
              style={[
                styles.shimmerBox,
                { width: 110, height: 13, borderRadius: 4, opacity: pulseAnim },
              ]}
            />
          </View>
          <View
            style={[
              styles.segmentBtn,
              activeSubTab === 'projects' && styles.segmentBtnActive,
            ]}
          >
            <Animated.View
              style={[
                styles.shimmerBox,
                { width: 115, height: 13, borderRadius: 4, opacity: pulseAnim },
              ]}
            />
          </View>
        </View>
      )}

      {/* Conditional Sub-Tab Skeleton */}
      {activeSubTab === 'projects' ? (
        <View style={{ gap: 16 }}>
          {/* 3 Metric Cards (Total Invoiced, Received, Pending Due) */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Animated.View
                style={[styles.shimmerBox, { width: 65, height: 18, borderRadius: 4, opacity: pulseAnim }]}
              />
              <Animated.View
                style={[styles.shimmerBox, { width: 75, height: 9, marginTop: 6, opacity: pulseAnim }]}
              />
            </View>
            <View style={styles.metricCard}>
              <Animated.View
                style={[styles.shimmerBox, { width: 65, height: 18, borderRadius: 4, opacity: pulseAnim }]}
              />
              <Animated.View
                style={[styles.shimmerBox, { width: 55, height: 9, marginTop: 6, opacity: pulseAnim }]}
              />
            </View>
            <View style={styles.metricCard}>
              <Animated.View
                style={[styles.shimmerBox, { width: 65, height: 18, borderRadius: 4, opacity: pulseAnim }]}
              />
              <Animated.View
                style={[styles.shimmerBox, { width: 68, height: 9, marginTop: 6, opacity: pulseAnim }]}
              />
            </View>
          </View>

          {/* Active Contracts Header */}
          <View style={styles.sectionHeaderRow}>
            <Animated.View
              style={[styles.shimmerBox, { width: 135, height: 12, borderRadius: 4, opacity: pulseAnim }]}
            />
            <Animated.View
              style={[styles.shimmerBox, { width: 90, height: 26, borderRadius: 8, opacity: pulseAnim }]}
            />
          </View>

          {/* Project Cards */}
          {[1, 2].map((idx) => (
            <View key={idx} style={styles.projectCard}>
              {/* Card Header */}
              <View style={styles.projectCardTop}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Animated.View
                    style={[styles.shimmerBox, { width: 110, height: 15, borderRadius: 4, opacity: pulseAnim }]}
                  />
                  <Animated.View
                    style={[styles.shimmerBox, { width: 160, height: 12, borderRadius: 3, opacity: pulseAnim }]}
                  />
                </View>
                <Animated.View
                  style={[styles.shimmerBox, { width: 85, height: 22, borderRadius: 100, opacity: pulseAnim }]}
                />
              </View>

              {/* Deal Numbers Bar */}
              <View style={styles.dealBar}>
                <View style={{ gap: 4 }}>
                  <Animated.View
                    style={[styles.shimmerBox, { width: 60, height: 9, opacity: pulseAnim }]}
                  />
                  <Animated.View
                    style={[styles.shimmerBox, { width: 50, height: 14, borderRadius: 3, opacity: pulseAnim }]}
                  />
                </View>
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <Animated.View
                    style={[styles.shimmerBox, { width: 55, height: 9, opacity: pulseAnim }]}
                  />
                  <Animated.View
                    style={[styles.shimmerBox, { width: 50, height: 14, borderRadius: 3, opacity: pulseAnim }]}
                  />
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Animated.View
                    style={[styles.shimmerBox, { width: 50, height: 9, opacity: pulseAnim }]}
                  />
                  <Animated.View
                    style={[styles.shimmerBox, { width: 50, height: 14, borderRadius: 3, opacity: pulseAnim }]}
                  />
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressRow}>
                <Animated.View
                  style={[styles.progressTrack, { opacity: pulseAnim }]}
                />
                <Animated.View
                  style={[styles.shimmerBox, { width: 32, height: 10, opacity: pulseAnim }]}
                />
              </View>

              {/* Action Button */}
              <View style={styles.btnRow}>
                <Animated.View
                  style={[styles.shimmerBtn, { flex: 1, opacity: pulseAnim }]}
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <>
          {/* Summary Row (Personal Udhar) */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Animated.View
                style={[styles.shimmerBox, { width: 85, height: 26, borderRadius: 6, opacity: pulseAnim }]}
              />
              <Animated.View
                style={[styles.shimmerBox, { width: 95, height: 11, marginTop: 8, opacity: pulseAnim }]}
              />
            </View>
            <View style={styles.summaryCard}>
              <Animated.View
                style={[styles.shimmerBox, { width: 75, height: 26, borderRadius: 6, opacity: pulseAnim }]}
              />
              <Animated.View
                style={[styles.shimmerBox, { width: 80, height: 11, marginTop: 8, opacity: pulseAnim }]}
              />
            </View>
          </View>

          {/* Person Items List */}
          <View style={styles.list}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.personItem}>
                <View style={styles.personLeft}>
                  <Animated.View style={[styles.avatar, { opacity: pulseAnim }]} />
                  <View style={styles.personDetails}>
                    <Animated.View
                      style={[
                        styles.shimmerBox,
                        { width: 120, height: 16, borderRadius: 4, marginBottom: 6, opacity: pulseAnim },
                      ]}
                    />
                    <Animated.View
                      style={[styles.shimmerBox, { width: 80, height: 11, borderRadius: 3, opacity: pulseAnim }]}
                    />
                  </View>
                </View>
                <View style={styles.personRight}>
                  <Animated.View
                    style={[styles.shimmerBox, { width: 70, height: 22, borderRadius: 6, opacity: pulseAnim }]}
                  />
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

