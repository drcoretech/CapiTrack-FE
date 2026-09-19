import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { Expense } from '../../types';
import { ExpenseSkeleton } from './components/ExpenseSkeleton';
import { CategoryIcon } from '../../components/CategoryIcon';

export const ExpenseHistoryScreen: React.FC = () => {
  const expenses = useAppStore((state) => state.expenses);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const refreshDashboard = useAppStore((state) => state.refreshDashboard);
  const setEditingExpense = useAppStore((state) => state.setEditingExpense);
  const { t, getCategoryName } = useTranslation();

  const getLocalizedDayGroup = (group: string) => {
    if (group === 'Today') return t('dayToday');
    if (group === 'Yesterday') return t('dayYesterday');
    if (group === 'Earlier') return t('dayEarlier');
    return group;
  };

  // 1. Sort all expenses chronologically descending by date
  const sortedExpenses = [...expenses].sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt).getTime() || 0;
    const timeB = new Date(b.date || b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  // 2. Group expenses while tracking each group's latest timestamp
  interface ExpenseGroup {
    groupName: string;
    maxTimestamp: number;
    items: Expense[];
  }

  const groupMap = new Map<string, ExpenseGroup>();

  for (const exp of sortedExpenses) {
    const isMonthlyTotal = exp.note?.includes('[Monthly Total]');
    let group = exp.dayGroup || 'Today';
    const itemTime = new Date(exp.date || exp.createdAt).getTime() || 0;

    if (isMonthlyTotal) {
      const d = new Date(exp.date || exp.createdAt);
      if (!isNaN(d.getTime())) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        group = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      }
    }

    if (!groupMap.has(group)) {
      groupMap.set(group, {
        groupName: group,
        maxTimestamp: itemTime,
        items: [],
      });
    }
    const g = groupMap.get(group)!;
    g.items.push(exp);
    if (itemTime > g.maxTimestamp) {
      g.maxTimestamp = itemTime;
    }
  }

  // 3. Sort groups chronologically descending (latest date at top, e.g. July before June)
  const orderedGroups = Array.from(groupMap.values()).sort((a, b) => {
    if (a.groupName === 'Today') return -1;
    if (b.groupName === 'Today') return 1;
    if (a.groupName === 'Yesterday') return -1;
    if (b.groupName === 'Yesterday') return 1;
    return b.maxTimestamp - a.maxTimestamp;
  });

  const isInitialLoading = isSyncing && expenses.length === 0;

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
          <ExpenseSkeleton />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>{t('thisMonth')}</Text>
              <Text style={styles.title}>{t('expensesTitle')}</Text>
            </View>

            {orderedGroups.map(({ groupName: dayGroup, items }) => {
              const groupTotal = items.reduce((sum, item) => sum + item.amount, 0);

              return (
                <View key={dayGroup} style={styles.groupContainer}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.dayLabel}>
                      {getLocalizedDayGroup(dayGroup)} · ₹{groupTotal.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.list}>
                    {items.map((item) => {
                      const isMonthlyTotal = item.note?.includes('[Monthly Total]');
                      const cleanNote = isMonthlyTotal
                        ? item.note.replace(/\[Monthly Total\]\s*/g, '').trim() || 'Full Month Total'
                        : item.note;

                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.75}
                          onPress={() => setEditingExpense(item)}
                          style={[styles.expItem, isMonthlyTotal && styles.expItemMonthlyTotal]}
                        >
                          <View style={styles.left}>
                            <View
                              style={[
                                styles.iconContainer,
                                isMonthlyTotal && styles.iconContainerMonthlyTotal,
                              ]}
                            >
                              <CategoryIcon
                                category={isMonthlyTotal ? 'monthly' : item.category}
                                icon={item.icon}
                                size={18}
                                color={isMonthlyTotal ? Colors.amber : Colors.moss}
                              />
                            </View>
                            <View style={styles.details}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                                  {cleanNote}
                                </Text>
                                {isMonthlyTotal && (
                                  <View style={styles.lumpSumPill}>
                                    <Text style={styles.lumpSumPillText}>Lump Sum</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.meta} numberOfLines={1} ellipsizeMode="tail">
                                {isMonthlyTotal
                                  ? `Full Month Total · ${getCategoryName(item.category)}`
                                  : `${getCategoryName(item.category)} · ${item.time}`}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </>
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
    paddingBottom: 120, // space for floating navbar
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
  groupContainer: {
    gap: 8,
  },
  groupHeader: {
    paddingHorizontal: 2,
  },
  dayLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: {
    gap: 8,
  },
  expItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  expItemMonthlyTotal: {
    borderColor: Colors.amber,
    backgroundColor: '#FCFAF4',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconContainerMonthlyTotal: {
    backgroundColor: Colors.amberLight,
  },
  iconText: {
    fontSize: 18,
  },
  name: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
    flexShrink: 1,
  },
  lumpSumPill: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  lumpSumPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.amber,
    textTransform: 'uppercase',
  },
  meta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  amount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 16,
    color: Colors.ink,
    flexShrink: 0,
    textAlign: 'right',
  },
});
