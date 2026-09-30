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
import {
  Settings,
  Pencil,
  Plus,
  Users,
  Briefcase,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCheck,
  Trash2,
} from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { haptics } from '../../services/haptics';

export const LedgerListScreen: React.FC = () => {
  const contacts = useAppStore((state) => state.contacts);
  const clientProjects = useAppStore((state) => state.clientProjects);
  const businessTrackingEnabled = useAppStore((state) => state.businessTrackingEnabled);
  const ledgerSubTab = useAppStore((state) => state.ledgerSubTab);
  const setLedgerSubTab = useAppStore((state) => state.setLedgerSubTab);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const refreshDashboard = useAppStore((state) => state.refreshDashboard);
  const openModal = useAppStore((state) => state.openModal);
  const setEditingLedgerTxn = useAppStore((state) => state.setEditingLedgerTxn);
  const settlePerson = useAppStore((state) => state.settlePerson);
  const deletePerson = useAppStore((state) => state.deletePerson);
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
            {/* Header with Settings Badge */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>
                  {ledgerSubTab === 'projects' ? 'BUSINESS & FREELANCE' : t('udhaarKhata')}
                </Text>
                <Text style={styles.title}>
                  {ledgerSubTab === 'projects' ? 'Client Projects & Dues' : t('ledgerTitle')}
                </Text>
              </View>
              <AnimatedPressable
                scaleTo={0.9}
                onPress={() => openModal('profile_details')}
                style={styles.settingsBadge}
              >
                <Settings size={18} color={Colors.ink} />
              </AnimatedPressable>
            </View>

            {/* Segmented Sub-Tab Switcher (Friends Khata vs Client Projects) */}
            {showBusinessTab && (
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptics.selection();
                    setLedgerSubTab('personal');
                  }}
                  style={[
                    styles.segmentBtn,
                    ledgerSubTab === 'personal' && styles.segmentBtnActive,
                  ]}
                >
                  <Users
                    size={14}
                    color={ledgerSubTab === 'personal' ? '#FFFFFF' : Colors.inkSoft}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      ledgerSubTab === 'personal' && styles.segmentTextActive,
                    ]}
                  >
                    Friends Khata ({contacts.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptics.selection();
                    setLedgerSubTab('projects');
                  }}
                  style={[
                    styles.segmentBtn,
                    ledgerSubTab === 'projects' && styles.segmentBtnActive,
                  ]}
                >
                  <Briefcase
                    size={14}
                    color={ledgerSubTab === 'projects' ? '#FFFFFF' : Colors.inkSoft}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      ledgerSubTab === 'projects' && styles.segmentTextActive,
                    ]}
                  >
                    Client Projects ({clientProjects.length})
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
                    <View style={styles.summaryCardHeader}>
                      <View style={[styles.arrowBadge, { backgroundColor: Colors.mossLight }]}>
                        <ArrowDownLeft size={13} color={Colors.moss} strokeWidth={2.6} />
                      </View>
                      <Text style={styles.summaryLbl}>{t('youWillReceive')}</Text>
                    </View>
                    <Text style={[styles.summaryNum, { color: Colors.moss }]}>
                      ₹{receiveTotal.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryCardHeader}>
                      <View style={[styles.arrowBadge, { backgroundColor: '#FEE2E2' }]}>
                        <ArrowUpRight size={13} color={Colors.brick} strokeWidth={2.6} />
                      </View>
                      <Text style={styles.summaryLbl}>{t('youOweKhata')}</Text>
                    </View>
                    <Text style={[styles.summaryNum, { color: Colors.brick }]}>
                      ₹{oweTotal.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Person Items */}
                <View style={styles.list}>
                  {contacts.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <View style={styles.emptyIconCircle}>
                        <Users size={28} color={Colors.moss} strokeWidth={1.8} />
                      </View>
                      <Text style={styles.emptyTitle}>No Khata Records</Text>
                      <Text style={styles.emptySub}>
                        Track money you lent to friends or borrowed without awkwardness.
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => openModal('add_ledger')}
                        style={styles.emptyAddBtn}
                      >
                        <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
                        <Text style={styles.emptyAddBtnText}>Add First Record</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    contacts.map((person) => {
                      const isOwed = person.netBalance > 0;
                      const isSettled = person.netBalance === 0;
                      const dateStr = person.lastDate === 'Today' ? t('dayToday') : person.lastDate;

                      const renderPersonRightActions = () => (
                        <View style={styles.swipeActionsRow}>
                          {!isSettled && (
                            <TouchableOpacity
                              activeOpacity={0.85}
                              onPress={() => {
                                haptics.success();
                                settlePerson(person.id);
                              }}
                              style={styles.swipeSettleAction}
                            >
                              <CheckCheck size={18} color="#FFFFFF" strokeWidth={2.2} />
                              <Text style={styles.swipeActionText}>Settle</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => {
                              haptics.medium();
                              deletePerson(person.id, person.name);
                            }}
                            style={styles.swipeDeleteAction}
                          >
                            <Trash2 size={18} color="#FFFFFF" strokeWidth={2.2} />
                            <Text style={styles.swipeActionText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      );

                      return (
                        <Swipeable
                          key={person.id}
                          renderRightActions={renderPersonRightActions}
                          friction={2}
                          rightThreshold={30}
                          containerStyle={styles.swipeableContainer}
                        >
                          <AnimatedPressable
                            scaleTo={0.97}
                            onPress={() => {
                              haptics.light();
                              openModal('person_detail', person.id);
                            }}
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
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
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
                                {person.transactions.length > 0 && (
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    onPress={() => {
                                      haptics.selection();
                                      setEditingLedgerTxn({ personId: person.id, txn: person.transactions[0] });
                                    }}
                                    style={styles.editPill}
                                  >
                                    <Pencil size={11} color={Colors.inkSoft} />
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                          </AnimatedPressable>
                        </Swipeable>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.moss,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  settingsBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: Colors.moss,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  segmentTextActive: {
    fontFamily: Fonts.sansSemiBold,
    color: '#FFFFFF',
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
    padding: 14,
    gap: 8,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryNum: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 22,
  },
  summaryLbl: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    color: Colors.inkSoft,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
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
    width: 42,
    height: 42,
    borderRadius: 14,
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
    fontSize: 15.5,
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
  editPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.line,
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
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
    maxWidth: 240,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.moss,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  emptyAddBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  swipeableContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  swipeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 6,
  },
  swipeSettleAction: {
    backgroundColor: Colors.moss,
    justifyContent: 'center',
    alignItems: 'center',
    width: 66,
    height: '100%',
    borderRadius: 16,
  },
  swipeDeleteAction: {
    backgroundColor: Colors.brick,
    justifyContent: 'center',
    alignItems: 'center',
    width: 66,
    height: '100%',
    borderRadius: 16,
  },
  swipeActionText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 3,
  },
});
