import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { MonthSelectorBar } from './components/MonthSelectorBar';
import { MonthHeroCard } from './components/MonthHeroCard';
import { SpendChartsCard } from './components/SpendChartsCard';
import { CategoryBreakdownCard } from './components/CategoryBreakdownCard';
import { MonthActivityLog } from './components/MonthActivityLog';
import { InsightsSkeleton } from './components/InsightsSkeleton';
import { FreelanceRevenueView } from './components/FreelanceRevenueView';

export const InsightsScreen: React.FC = () => {
  const { t } = useTranslation();
  const expenses = useAppStore((state) => state.expenses);
  const clientProjects = useAppStore((state) => state.clientProjects);
  const businessTrackingEnabled = useAppStore((state) => state.businessTrackingEnabled);
  const insightsSubTab = useAppStore((state) => state.insightsSubTab);
  const setInsightsSubTab = useAppStore((state) => state.setInsightsSubTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const refreshDashboard = useAppStore((state) => state.refreshDashboard);
  const currencySymbol = useAppStore((state) => state.currencySymbol) || '₹';
  const openModal = useAppStore((state) => state.openModal);

  // Active Month & Year (defaults to current calendar month & year)
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [chartMode, setChartMode] = useState<'trend' | 'weekly'>('trend');

  const isCurrentMonth = selectedMonth === (now.getMonth() + 1) && selectedYear === now.getFullYear();

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Filter expenses for selected month using transaction date (e.date || e.createdAt)
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date || e.createdAt);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  // Check if there is a manual lump-sum monthly total expense recorded for this month
  const monthlyTotalExpense = useMemo(() => {
    return monthExpenses.find((e) => e.note?.includes('[Monthly Total]'));
  }, [monthExpenses]);

  // Total spent in selected month
  const totalSpent = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

  // Previous month total for comparison
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

  const prevMonthTotal = useMemo(() => {
    const pExpenses = expenses.filter((e) => {
      const d = new Date(e.date || e.createdAt);
      return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
    });
    return pExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, prevMonth, prevYear]);

  // Month-over-month comparison delta
  const momDelta = useMemo(() => {
    if (prevMonthTotal === 0) return null;
    const diff = totalSpent - prevMonthTotal;
    const pct = Math.round((diff / prevMonthTotal) * 100);
    return {
      pct: Math.abs(pct),
      isIncrease: pct > 0,
      isDecrease: pct < 0,
      isZero: pct === 0,
    };
  }, [totalSpent, prevMonthTotal]);

  // Daily average spend
  const dailyAverage = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    // For ongoing month, divide by elapsed days
    const elapsedDays = now.getDate();
    const effectiveDays = isCurrentMonth ? Math.max(1, elapsedDays) : daysInMonth;
    return Math.round(totalSpent / Math.max(1, effectiveDays));
  }, [totalSpent, selectedMonth, selectedYear, isCurrentMonth]);

  // Category breakdown for active month
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; count: number; icon: string }>();

    monthExpenses.forEach((e) => {
      const cat = e.category;
      const existing = map.get(cat) || { total: 0, count: 0, icon: e.icon || '🏷️' };
      existing.total += e.amount;
      existing.count += 1;
      map.set(cat, existing);
    });

    const list = Array.from(map.entries()).map(([category, data]) => ({
      category,
      icon: data.icon,
      amount: data.total,
      count: data.count,
      percentage: totalSpent > 0 ? Math.round((data.total / totalSpent) * 100) : 0,
    }));

    list.sort((a, b) => b.amount - a.amount);
    return list;
  }, [monthExpenses, totalSpent]);

  const topCategory = categoryBreakdown[0] || null;

  // 6-Month Trend Data
  const sixMonthsTrend = useMemo(() => {
    const monthsList: { month: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsList.push({
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
      });
    }

    const monthData = monthsList.map((m) => {
      const mExpenses = expenses.filter((e) => {
        const d = new Date(e.date || e.createdAt);
        return d.getMonth() + 1 === m.month && d.getFullYear() === m.year;
      });
      const total = mExpenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        month: m.month,
        year: m.year,
        total,
        label: total >= 1000 ? `${currencySymbol}${(total / 1000).toFixed(1)}k` : `${currencySymbol}${total}`,
        isSelected: m.month === selectedMonth && m.year === selectedYear,
      };
    });

    const maxTotal = Math.max(...monthData.map((m) => m.total), 1);
    return monthData.map((m) => ({
      ...m,
      percentage: Math.max(14, Math.round((m.total / maxTotal) * 100)),
      isPeak: m.total === maxTotal && m.total > 0,
    }));
  }, [expenses, selectedMonth, selectedYear, currencySymbol]);

  // Weekly flow for selected month
  const weeklyFlowData = useMemo(() => {
    const weeks = [
      { weekNum: 1, range: '1 to 7', total: 0 },
      { weekNum: 2, range: '8 to 14', total: 0 },
      { weekNum: 3, range: '15 to 21', total: 0 },
      { weekNum: 4, range: '22 to 28', total: 0 },
      { weekNum: 5, range: '29 to 31', total: 0 },
    ];

    monthExpenses.forEach((e) => {
      if (e.note?.includes('[Monthly Total]')) {
        // Distribute lump sum evenly so it doesn't create a false week-5 spike
        const weekPortion = e.amount / 5;
        weeks.forEach((w) => {
          w.total += weekPortion;
        });
      } else {
        const day = new Date(e.date || e.createdAt).getDate();
        if (day <= 7) weeks[0].total += e.amount;
        else if (day <= 14) weeks[1].total += e.amount;
        else if (day <= 21) weeks[2].total += e.amount;
        else if (day <= 28) weeks[3].total += e.amount;
        else weeks[4].total += e.amount;
      }
    });

    const maxWeek = Math.max(...weeks.map((w) => w.total), 1);
    return weeks.map((w) => ({
      ...w,
      percentage: w.total > 0 ? Math.max(12, Math.round((w.total / maxWeek) * 100)) : 6,
      label: w.total >= 1000 ? `${currencySymbol}${(w.total / 1000).toFixed(1)}k` : `${currencySymbol}${Math.round(w.total)}`,
    }));
  }, [monthExpenses, currencySymbol]);

  const getCategoryColor = (index: number) => {
    if (index === 0) return Colors.amber;
    if (index === 1) return Colors.moss;
    if (index === 2) return Colors.brick;
    if (index === 3) return Colors.inkSoft;
    if (index === 4) return '#586E75';
    return '#8A9A86';
  };

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
          <InsightsSkeleton />
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.eyebrow}>{t('monthlyTracker')}</Text>
              <Text style={styles.title}>{t('insightsTitle')}</Text>
            </View>

            {/* Segmented Sub-Tab Switcher (Personal Spends vs Freelance Revenue) */}
            {businessTrackingEnabled && (
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setInsightsSubTab('personal')}
                  style={[
                    styles.segmentBtn,
                    insightsSubTab === 'personal' && styles.segmentBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      insightsSubTab === 'personal' && styles.segmentTextActive,
                    ]}
                  >
                    {t('insightsTabPersonal')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setInsightsSubTab('revenue')}
                  style={[
                    styles.segmentBtn,
                    insightsSubTab === 'revenue' && styles.segmentBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      insightsSubTab === 'revenue' && styles.segmentTextActive,
                    ]}
                  >
                    {t('insightsTabRevenue')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Month Selector Bar */}
            <MonthSelectorBar
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              isCurrentMonth={isCurrentMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelectMonth={(m, y) => {
                setSelectedMonth(m);
                setSelectedYear(y);
              }}
            />

            {/* Sub-Tab Content */}
            {businessTrackingEnabled && insightsSubTab === 'revenue' ? (
              <FreelanceRevenueView
                projects={clientProjects}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                currencySymbol={currencySymbol}
                totalPersonalSpent={totalSpent}
                onOpenProject={(id) => openModal('project_detail', id)}
                onNavigateToLedger={() => {
                  useAppStore.setState({ ledgerSubTab: 'projects' });
                  setActiveTab('ledger');
                }}
              />
            ) : (
              <>
                {/* Lump-Sum Monthly Total Banner (if present for this month) */}
                {monthlyTotalExpense && (
                  <View style={styles.lumpSumBanner}>
                    <View style={styles.lumpSumIconCircle}>
                      <Text style={{ fontSize: 18 }}>📅</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.lumpSumTitleRow}>
                        <Text style={styles.lumpSumTitle}>Full Month Lump Sum Recorded</Text>
                        <View style={styles.lumpSumTag}>
                          <Text style={styles.lumpSumTagText}>Manual Total</Text>
                        </View>
                      </View>
                      <Text style={styles.lumpSumSub}>
                        Includes {currencySymbol}{monthlyTotalExpense.amount.toLocaleString()} logged as your full month total from notes ({monthlyTotalExpense.note?.replace(/\[Monthly Total\]\s*/g, '').trim() || 'Manual Record'}).
                      </Text>
                    </View>
                  </View>
                )}

                {/* Monthly Summary Hero Card */}
                <MonthHeroCard
                  totalSpent={totalSpent}
                  currencySymbol={currencySymbol}
                  momDelta={momDelta}
                  dailyAverage={dailyAverage}
                  topCategory={topCategory}
                  transactionCount={monthExpenses.length}
                />

                {/* Visual Analytics Charts Card */}
                <SpendChartsCard
                  chartMode={chartMode}
                  onChangeChartMode={setChartMode}
                  sixMonthsTrend={sixMonthsTrend}
                  weeklyFlowData={weeklyFlowData}
                  onSelectTrendMonth={(m, y) => {
                    setSelectedMonth(m);
                    setSelectedYear(y);
                  }}
                />

                {/* Dynamic Category Breakdown Card */}
                <CategoryBreakdownCard
                  categoryBreakdown={categoryBreakdown}
                  currencySymbol={currencySymbol}
                  getCategoryColor={getCategoryColor}
                />

                {/* Month's Expense Activity Log */}
                <MonthActivityLog
                  monthExpenses={monthExpenses}
                  currencySymbol={currencySymbol}
                  onPressAddExpense={() => openModal('add_expense')}
                />
              </>
            )}
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
    paddingBottom: 130, // Space for floating bottom nav
    gap: 16,
  },
  header: {
    marginBottom: 2,
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
  lumpSumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.amber,
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  lumpSumIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lumpSumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  lumpSumTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  lumpSumTag: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lumpSumTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.amber,
    textTransform: 'uppercase',
  },
  lumpSumSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    lineHeight: 16,
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
});
