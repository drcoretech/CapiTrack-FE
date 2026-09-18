import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { LedgerSkeleton } from './components/LedgerSkeleton';
import { ClientProjectsView } from './components/ClientProjectsView';

export const LedgerListScreen: React.FC = () => {
  const contacts = useAppStore((state) => state.contacts);
  const clientProjects = useAppStore((state) => state.clientProjects);
  const businessTrackingEnabled = useAppStore((state) => state.businessTrackingEnabled);
  const ledgerSubTab = useAppStore((state) => state.ledgerSubTab);
  const setLedgerSubTab = useAppStore((state) => state.setLedgerSubTab);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const refreshDashboard = useAppStore((state) => state.refreshDashboard);
  const openModal = useAppStore((state) => state.openModal);
  const { t } = useTranslation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const receiveTotal = contacts.reduce(
    (sum, c) => (c.netBalance > 0 ? sum + c.netBalance : sum),
    0
  );
  const oweTotal = contacts.reduce(
    (sum, c) => (c.netBalance < 0 ? sum + Math.abs(c.netBalance) : sum),
    0
  );

  const isInitialLoading = isSyncing && contacts.length === 0;
  const showBusinessTab = businessTrackingEnabled;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={refreshDashboard}
            tintColor={Colors.moss}
          />
        }
      >
        {isInitialLoading ? (
          <LedgerSkeleton />
        ) : (
          <Animated.View
            style={{
              gap: 16,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              {ledgerSubTab === 'projects' ? 'BUSINESS & FREELANCE' : t('udhaarKhata')}
            </Text>
            <Text style={styles.title}>
              {ledgerSubTab === 'projects' ? 'Client Projects & Dues' : t('ledgerTitle')}
            </Text>
          </View>

          {/* Segmented Sub-Tab Switcher (Personal Udhar vs Client Projects) */}
          {showBusinessTab && (
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLedgerSubTab('personal')}
                style={[
                  styles.segmentBtn,
                  ledgerSubTab === 'personal' && styles.segmentBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    ledgerSubTab === 'personal' && styles.segmentTextActive,
                  ]}
                >
                  👥 Personal Udhar ({contacts.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLedgerSubTab('projects')}
                style={[
                  styles.segmentBtn,
                  ledgerSubTab === 'projects' && styles.segmentBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    ledgerSubTab === 'projects' && styles.segmentTextActive,
                  ]}
                >
                  💼 Client Projects ({clientProjects.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Conditional Content Based on Sub-Tab */}
          {ledgerSubTab === 'projects' && showBusinessTab ? (
            <ClientProjectsView
              projects={clientProjects}
              onOpenProject={(id) => openModal('project_detail', id)}
              onAddPayment={(id) => openModal('project_detail', id)}
              onNewProject={() => openModal('add_project')}
            />
          ) : (
            <>
              {/* Summary Row */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={[styles.summaryNum, { color: Colors.moss }]}>
                    ₹{receiveTotal.toLocaleString()}
                  </Text>
                  <Text style={styles.summaryLbl}>{t('youWillReceive')}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={[styles.summaryNum, { color: Colors.brick }]}>
                    ₹{oweTotal.toLocaleString()}
                  </Text>
                  <Text style={styles.summaryLbl}>{t('youOweKhata')}</Text>
                </View>
              </View>

              {/* Person Items */}
              <View style={styles.list}>
                {contacts.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No Personal Udhar Records</Text>
                    <Text style={styles.emptySub}>
                      Tap the "+" button below to track money you lent or borrowed from friends.
                    </Text>
                  </View>
                ) : (
                  contacts.map((person) => {
                    const isOwed = person.netBalance > 0;
                    const isSettled = person.netBalance === 0;
                    const dateStr = person.lastDate === 'Today' ? t('dayToday') : person.lastDate;

                    return (
                      <AnimatedPressable
                        key={person.id}
                        scaleTo={0.96}
                        onPress={() => openModal('person_detail', person.id)}
                        style={styles.personItem}
                      >
                        <View style={styles.personLeft}>
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{person.initial}</Text>
                          </View>
                          <View style={styles.personDetails}>
                            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                              {person.name}
                            </Text>
                            <Text style={styles.meta} numberOfLines={1} ellipsizeMode="tail">
                              {t('lastPrefix')} {dateStr}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.personRight}>
                          <Text
                            style={[
                              styles.amount,
                              isOwed ? styles.amountOwed : styles.amountOwe,
                              isSettled && styles.amountSettled,
                            ]}
                          >
                            {isOwed
                              ? `+₹${person.netBalance.toLocaleString()}`
                              : isSettled
                              ? '₹0'
                              : `-₹${Math.abs(person.netBalance).toLocaleString()}`}
                          </Text>
                          <View
                            style={[
                              styles.pill,
                              person.status === 'settled' ? styles.pillSettled : styles.pillPending,
                            ]}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                person.status === 'settled'
                                  ? styles.pillTextSettled
                                  : styles.pillTextPending,
                              ]}
                            >
                              {person.status === 'settled' ? t('statusSettled') : t('statusPending')}
                            </Text>
                          </View>
                        </View>
                      </AnimatedPressable>
                    );
                  })
                )}
              </View>
            </>
          )}
          </Animated.View>
        )}
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
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  eyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 26,
    color: Colors.ink,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryNum: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
  },
  summaryLbl: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 3,
  },
  list: {
    gap: 9,
  },
  personItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 15,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  personLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  personDetails: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: Fonts.serifMedium,
    fontSize: 16,
    color: Colors.moss,
  },
  name: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  meta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  personRight: {
    alignItems: 'flex-end',
    gap: 3,
    flexShrink: 0,
  },
  amount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 15,
  },
  amountOwed: {
    color: Colors.moss,
  },
  amountOwe: {
    color: Colors.brick,
  },
  amountSettled: {
    color: Colors.inkSoft,
  },
  pill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  pillPending: {
    backgroundColor: Colors.amberLight,
  },
  pillSettled: {
    backgroundColor: Colors.mossLight,
  },
  pillText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillTextPending: {
    color: Colors.amber,
  },
  pillTextSettled: {
    color: Colors.moss,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.inkSoft,
  },
  segmentTextActive: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.ink,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 16,
    color: Colors.ink,
  },
  emptySub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 18,
  },
});

