import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { AnimatedPressable } from '../../components/AnimatedPressable';

export const LedgerListScreen: React.FC = () => {
  const contacts = useAppStore((state) => state.contacts);
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
        <Animated.View
          style={{
            gap: 16,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>{t('udhaarKhata')}</Text>
            <Text style={styles.title}>{t('ledgerTitle')}</Text>
          </View>

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
            {contacts.map((person) => {
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
                  <View>
                    <Text style={styles.name}>{person.name}</Text>
                    <Text style={styles.meta}>
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
                    {isOwed ? `+₹${person.netBalance.toLocaleString()}` : isSettled ? '₹0' : `-₹${Math.abs(person.netBalance).toLocaleString()}`}
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
          })}
        </View>
        </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
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
});
