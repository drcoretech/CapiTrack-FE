import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { styles } from './LedgerList.styles';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { LedgerSkeleton } from './components/LedgerSkeleton';
import { ClientProjectsView } from './components/ClientProjectsView';
import { LedgerSummaryRow } from './components/LedgerSummaryRow';
import { LedgerContactItem } from './components/LedgerContactItem';
import {
  Settings,
  Plus,
  Users,
  Briefcase,
} from 'lucide-react-native';
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
                    Credit Ledger ({contacts.length})
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
                <LedgerSummaryRow
                  receiveTotal={receiveTotal}
                  oweTotal={oweTotal}
                  youWillGetLabel={t('youWillReceive')}
                  youOweLabel={t('youOweKhata')}
                />

                {/* Person Items */}
                <View style={styles.list}>
                  {contacts.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <View style={styles.emptyIconCircle}>
                        <Users size={28} color={Colors.moss} strokeWidth={1.8} />
                      </View>
                      <Text style={styles.emptyTitle}>No Credit Ledger Records</Text>
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
                    contacts.map((person) => (
                      <LedgerContactItem
                        key={person.id}
                        person={person}
                        dateStr={person.lastDate === 'Today' ? t('dayToday') : person.lastDate}
                        statusSettledText={t('statusSettled')}
                        statusPendingText={t('statusPending')}
                        lastPrefixText={t('lastPrefix')}
                        onOpenDetail={(id) => openModal('person_detail', id)}
                        onSettle={(id) => settlePerson(id)}
                        onDelete={(id, name) => deletePerson(id, name)}
                        onEditTxn={(pId, txn) => setEditingLedgerTxn({ personId: pId, txn })}
                      />
                    ))
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


