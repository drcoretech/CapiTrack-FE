import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';

export const ExpenseHistoryScreen: React.FC = () => {
  const expenses = useAppStore((state) => state.expenses);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const refreshDashboard = useAppStore((state) => state.refreshDashboard);
  const openModal = useAppStore((state) => state.openModal);
  const setEditingExpense = useAppStore((state) => state.setEditingExpense);
  const { t, getCategoryName } = useTranslation();

  const getLocalizedDayGroup = (group: string) => {
    if (group === 'Today') return t('dayToday');
    if (group === 'Yesterday') return t('dayYesterday');
    if (group === 'Earlier') return t('dayEarlier');
    return group;
  };

  // Group expenses by dayGroup
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const group = expense.dayGroup || 'Earlier';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(expense);
    return acc;
  }, {} as Record<string, typeof expenses>);

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
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t('thisMonth')}</Text>
          <Text style={styles.title}>{t('expensesTitle')}</Text>
        </View>

        {Object.entries(groupedExpenses).map(([dayGroup, items]) => {
          const groupTotal = items.reduce((sum, item) => sum + item.amount, 0);

          return (
            <View key={dayGroup} style={styles.groupContainer}>
              <View style={styles.groupHeader}>
                <Text style={styles.dayLabel}>
                  {getLocalizedDayGroup(dayGroup)} · ₹{groupTotal}
                </Text>
              </View>

              <View style={styles.list}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.75}
                    onPress={() => setEditingExpense(item)}
                    style={styles.expItem}
                  >
                    <View style={styles.left}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>{item.icon}</Text>
                      </View>
                      <View style={styles.details}>
                        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                          {item.note}
                        </Text>
                        <Text style={styles.meta} numberOfLines={1} ellipsizeMode="tail">
                          {getCategoryName(item.category)} · {item.time}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
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
  iconText: {
    fontSize: 18,
  },
  name: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
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
