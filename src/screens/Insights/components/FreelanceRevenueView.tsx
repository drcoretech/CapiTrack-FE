import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { ClientProject } from '../../../types';
import { useTranslation } from '../../../i18n/translations';

interface FreelanceRevenueViewProps {
  projects: ClientProject[];
  selectedMonth: number;
  selectedYear: number;
  currencySymbol: string;
  totalPersonalSpent: number;
  onOpenProject?: (id: string) => void;
  onNavigateToLedger?: () => void;
}

export const FreelanceRevenueView: React.FC<FreelanceRevenueViewProps> = ({
  projects,
  selectedMonth,
  selectedYear,
  currencySymbol,
  totalPersonalSpent,
  onOpenProject,
  onNavigateToLedger,
}) => {
  const { t, getMonth } = useTranslation();

  // 1. Filter milestone payments for selected month & year
  const monthPayments = useMemo(() => {
    const list: {
      paymentId: string;
      projectId: string;
      clientName: string;
      projectTitle: string;
      amount: number;
      date: string;
      method?: string;
      note?: string;
      recordedAsIncome?: boolean;
    }[] = [];

    projects.forEach((proj) => {
      (proj.payments || []).forEach((p) => {
        const d = new Date(p.date || Date.now());
        if (d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear) {
          list.push({
            paymentId: p.id,
            projectId: proj.id,
            clientName: proj.clientName,
            projectTitle: proj.projectTitle,
            amount: p.amount,
            date: p.date,
            method: p.method || 'Payment',
            note: p.note,
            recordedAsIncome: p.recordedAsIncome,
          });
        }
      });
    });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [projects, selectedMonth, selectedYear]);

  // Total collected in selected month
  const totalCollectedMonth = useMemo(() => {
    return monthPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [monthPayments]);

  // Previous month collected for comparison
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

  const prevMonthCollected = useMemo(() => {
    let sum = 0;
    projects.forEach((proj) => {
      (proj.payments || []).forEach((p) => {
        const d = new Date(p.date || Date.now());
        if (d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear) {
          sum += p.amount;
        }
      });
    });
    return sum;
  }, [projects, prevMonth, prevYear]);

  // Month-over-month delta
  const momDelta = useMemo(() => {
    if (prevMonthCollected === 0) return null;
    const diff = totalCollectedMonth - prevMonthCollected;
    const pct = Math.round((diff / prevMonthCollected) * 100);
    return {
      pct: Math.abs(pct),
      isIncrease: pct > 0,
      isDecrease: pct < 0,
      isZero: pct === 0,
    };
  }, [totalCollectedMonth, prevMonthCollected]);

  // Total contract portfolio & pending dues
  const portfolioStats = useMemo(() => {
    let totalInvoiced = 0;
    let totalReceivedEver = 0;
    projects.forEach((p) => {
      totalInvoiced += p.totalValue;
      const rec = (p.payments || []).reduce((s, pay) => s + pay.amount, 0);
      totalReceivedEver += rec;
    });
    const pendingDue = Math.max(0, totalInvoiced - totalReceivedEver);
    return { totalInvoiced, totalReceivedEver, pendingDue };
  }, [projects]);

  // Cashflow & Savings Bridge (Revenue - Personal Expenses)
  const cashflow = useMemo(() => {
    const net = totalCollectedMonth - totalPersonalSpent;
    const isSurplus = net >= 0;
    const savingsRate =
      totalCollectedMonth > 0 ? Math.max(0, Math.round((net / totalCollectedMonth) * 100)) : 0;
    return {
      net,
      isSurplus,
      savingsRate,
    };
  }, [totalCollectedMonth, totalPersonalSpent]);

  // 6-Month Revenue Trend
  const sixMonthsTrend = useMemo(() => {
    const monthsList: { month: number; year: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsList.push({
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
      });
    }

    const data = monthsList.map((m) => {
      let monthSum = 0;
      projects.forEach((proj) => {
        (proj.payments || []).forEach((p) => {
          const d = new Date(p.date || Date.now());
          if (d.getMonth() + 1 === m.month && d.getFullYear() === m.year) {
            monthSum += p.amount;
          }
        });
      });

      return {
        month: m.month,
        year: m.year,
        total: monthSum,
        label:
          monthSum >= 1000
            ? `${currencySymbol}${(monthSum / 1000).toFixed(1)}k`
            : `${currencySymbol}${monthSum}`,
        isSelected: m.month === selectedMonth && m.year === selectedYear,
      };
    });

    const maxVal = Math.max(...data.map((d) => d.total), 1);
    return data.map((d) => ({
      ...d,
      percentage: Math.max(12, Math.round((d.total / maxVal) * 100)),
      isPeak: d.total === maxVal && d.total > 0,
    }));
  }, [projects, selectedMonth, selectedYear, currencySymbol]);

  // Client-wise Revenue Contribution for selected month
  const clientBreakdown = useMemo(() => {
    const map = new Map<string, { clientName: string; projectTitle: string; amount: number; count: number }>();
    monthPayments.forEach((p) => {
      const key = p.clientName;
      const existing = map.get(key) || {
        clientName: p.clientName,
        projectTitle: p.projectTitle,
        amount: 0,
        count: 0,
      };
      existing.amount += p.amount;
      existing.count += 1;
      map.set(key, existing);
    });

    const list = Array.from(map.values());
    list.sort((a, b) => b.amount - a.amount);
    return list.map((item) => ({
      ...item,
      percentage: totalCollectedMonth > 0 ? Math.round((item.amount / totalCollectedMonth) * 100) : 0,
    }));
  }, [monthPayments, totalCollectedMonth]);

  // Projects with outstanding balances
  const activeDuesProjects = useMemo(() => {
    return projects
      .map((proj) => {
        const rec = (proj.payments || []).reduce((s, p) => s + p.amount, 0);
        const due = Math.max(0, proj.totalValue - rec);
        return {
          id: proj.id,
          clientName: proj.clientName,
          projectTitle: proj.projectTitle,
          totalValue: proj.totalValue,
          received: rec,
          due,
        };
      })
      .filter((p) => p.due > 0);
  }, [projects]);

  return (
    <View style={styles.container}>
      {/* 1. Monthly Revenue Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroEyebrow}>{t('revenueCollected')}</Text>
            <Text style={styles.heroAmount}>
              {currencySymbol}
              {totalCollectedMonth.toLocaleString()}
            </Text>
          </View>

          {momDelta && (
            <View
              style={[
                styles.deltaBadge,
                momDelta.isIncrease ? styles.deltaBadgePositive : styles.deltaBadgeNegative,
              ]}
            >
              {momDelta.isIncrease ? (
                <TrendingUp size={14} color={Colors.moss} />
              ) : (
                <TrendingDown size={14} color={Colors.brick} />
              )}
              <Text
                style={[
                  styles.deltaText,
                  { color: momDelta.isIncrease ? Colors.moss : Colors.brick },
                ]}
              >
                {momDelta.pct}% {t('vsPrevMonth')}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>{t('milestonesReceived')}</Text>
            <Text style={styles.heroStatValue}>{monthPayments.length}</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>Total Invoiced</Text>
            <Text style={styles.heroStatValue}>
              {currencySymbol}
              {portfolioStats.totalInvoiced.toLocaleString()}
            </Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>Pending Due</Text>
            <Text style={[styles.heroStatValue, { color: Colors.amber }]}>
              {currencySymbol}
              {portfolioStats.pendingDue.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Cashflow & Income Bridge Card */}
      <View style={styles.cashflowCard}>
        <View style={styles.cashflowHeader}>
          <View style={styles.cashflowTitleRow}>
            <Sparkles size={16} color={Colors.moss} style={{ marginRight: 6 }} />
            <Text style={styles.cashflowTitle}>{t('netCashflowTitle')}</Text>
          </View>
          <View
            style={[
              styles.cashflowBadge,
              cashflow.isSurplus ? styles.cashflowBadgePositive : styles.cashflowBadgeNegative,
            ]}
          >
            <Text
              style={[
                styles.cashflowBadgeText,
                { color: cashflow.isSurplus ? Colors.moss : Colors.brick },
              ]}
            >
              {cashflow.isSurplus ? t('netSurplus') : t('netDeficit')}
            </Text>
          </View>
        </View>

        {/* Inflow vs Outflow Equation */}
        <View style={styles.equationRow}>
          <View style={styles.equationBox}>
            <Text style={styles.equationLabel}>{t('freelanceIncome')}</Text>
            <Text style={[styles.equationAmount, { color: Colors.moss }]}>
              +{currencySymbol}
              {totalCollectedMonth.toLocaleString()}
            </Text>
          </View>

          <Text style={styles.equationOperator}>-</Text>

          <View style={styles.equationBox}>
            <Text style={styles.equationLabel}>{t('personalOutflow')}</Text>
            <Text style={[styles.equationAmount, { color: Colors.brick }]}>
              {currencySymbol}
              {totalPersonalSpent.toLocaleString()}
            </Text>
          </View>

          <Text style={styles.equationOperator}>=</Text>

          <View style={styles.equationBox}>
            <Text style={styles.equationLabel}>Net Retained</Text>
            <Text
              style={[
                styles.equationAmount,
                { color: cashflow.isSurplus ? Colors.moss : Colors.brick },
              ]}
            >
              {cashflow.isSurplus ? '+' : ''}
              {currencySymbol}
              {cashflow.net.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Savings Rate Note */}
        {totalCollectedMonth > 0 && (
          <View style={styles.savingsRateRow}>
            <View style={styles.savingsBarTrack}>
              <View
                style={[
                  styles.savingsBarFill,
                  {
                    width: `${Math.min(100, Math.max(5, cashflow.savingsRate))}%`,
                    backgroundColor: cashflow.isSurplus ? Colors.moss : Colors.amber,
                  },
                ]}
              />
            </View>
            <Text style={styles.savingsRateText}>
              {cashflow.isSurplus
                ? `${cashflow.savingsRate}% ${t('savingsRatePct')} from freelance revenue`
                : `Personal spending exceeded freelance income by ${currencySymbol}${Math.abs(cashflow.net).toLocaleString()}`}
            </Text>
          </View>
        )}
      </View>

      {/* 3. 6-Month Freelance Revenue Trend Bar Chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('revenueTrend6Months')}</Text>
        <View style={styles.trendBarsRow}>
          {sixMonthsTrend.map((item, idx) => (
            <View key={idx} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${item.percentage}%`,
                      backgroundColor: item.isSelected
                        ? Colors.moss
                        : item.isPeak
                        ? Colors.amber
                        : '#C4D6C0',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barAmountLabel}>{item.total > 0 ? item.label : '-'}</Text>
              <Text
                style={[
                  styles.barMonthLabel,
                  item.isSelected && { color: Colors.moss, fontFamily: Fonts.sansSemiBold },
                ]}
              >
                {getMonth(item.month).substring(0, 3)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Client Revenue Contribution Breakdown */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('clientShareTitle')}</Text>
        {clientBreakdown.length === 0 ? (
          <Text style={styles.emptyNote}>{t('noMilestonesThisMonth')}</Text>
        ) : (
          clientBreakdown.map((item, index) => (
            <View key={index} style={styles.clientRow}>
              <View style={styles.clientTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clientName}>{item.clientName}</Text>
                  <Text style={styles.clientProj}>{item.projectTitle}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.clientAmount}>
                    {currencySymbol}
                    {item.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.clientPercent}>{item.percentage}% share</Text>
                </View>
              </View>
              <View style={styles.clientBarTrack}>
                <View
                  style={[
                    styles.clientBarFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: index === 0 ? Colors.moss : Colors.amber,
                    },
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </View>

      {/* 5. Outstanding Receivables Pipeline */}
      {activeDuesProjects.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>{t('pipelineTitle')}</Text>
            <Text style={styles.pipelineTotalDue}>
              Total Due: {currencySymbol}
              {portfolioStats.pendingDue.toLocaleString()}
            </Text>
          </View>

          {activeDuesProjects.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => onOpenProject?.(item.id)}
              style={styles.pipelineCard}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.pipelineClient}>{item.clientName}</Text>
                <Text style={styles.pipelineProject}>{item.projectTitle}</Text>
                <Text style={styles.pipelineCollected}>
                  Collected: {currencySymbol}
                  {item.received.toLocaleString()} of {currencySymbol}
                  {item.totalValue.toLocaleString()}
                </Text>
              </View>
              <View style={styles.pipelineRight}>
                <Text style={styles.pipelineDueLabel}>Pending Due</Text>
                <Text style={styles.pipelineDueAmount}>
                  {currencySymbol}
                  {item.due.toLocaleString()}
                </Text>
                <ArrowUpRight size={14} color={Colors.moss} style={{ alignSelf: 'flex-end', marginTop: 4 }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 6. Milestone Receipts Activity Log */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('milestonesReceived')}</Text>
        {monthPayments.length === 0 ? (
          <View style={styles.emptyLogBox}>
            <Briefcase size={28} color={Colors.inkSoft} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyLogTitle}>{t('noMilestonesThisMonth')}</Text>
            {onNavigateToLedger && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onNavigateToLedger}
                style={styles.recordActionBtn}
              >
                <Text style={styles.recordActionText}>+ Record Payment in Ledger</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          monthPayments.map((p) => (
            <View key={p.paymentId} style={styles.paymentItem}>
              <View style={styles.paymentIconBox}>
                <CheckCircle2 size={18} color={Colors.moss} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentClient}>{p.clientName}</Text>
                <Text style={styles.paymentProject}>{p.projectTitle}</Text>
                <View style={styles.paymentMetaRow}>
                  <Clock size={11} color={Colors.inkSoft} style={{ marginRight: 3 }} />
                  <Text style={styles.paymentMeta}>
                    {new Date(p.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    • {p.method}
                  </Text>
                  {p.recordedAsIncome && (
                    <View style={styles.incomeBadge}>
                      <Text style={styles.incomeBadgeText}>Bridged to Income</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.paymentAmount}>
                +{currencySymbol}
                {p.amount.toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroEyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    color: Colors.inkSoft,
    letterSpacing: 0.8,
  },
  heroAmount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 32,
    color: Colors.moss,
    marginTop: 4,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  deltaBadgePositive: {
    backgroundColor: Colors.mossLight,
  },
  deltaBadgeNegative: {
    backgroundColor: Colors.brickLight,
  },
  deltaText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatLabel: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  heroStatValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.line,
    marginHorizontal: 8,
  },
  cashflowCard: {
    backgroundColor: '#F7FAF7',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.moss,
  },
  cashflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cashflowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashflowTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  cashflowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cashflowBadgePositive: {
    backgroundColor: Colors.mossLight,
  },
  cashflowBadgeNegative: {
    backgroundColor: Colors.brickLight,
  },
  cashflowBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  equationBox: {
    alignItems: 'center',
    flex: 1,
  },
  equationLabel: {
    fontFamily: Fonts.sansRegular,
    fontSize: 10,
    color: Colors.inkSoft,
    marginBottom: 2,
  },
  equationAmount: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
  },
  equationOperator: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.inkSoft,
    marginHorizontal: 4,
  },
  savingsRateRow: {
    marginTop: 12,
    gap: 6,
  },
  savingsBarTrack: {
    height: 5,
    backgroundColor: Colors.line,
    borderRadius: 3,
    overflow: 'hidden',
  },
  savingsBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  savingsRateText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 14,
  },
  pipelineTotalDue: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.amber,
  },
  trendBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 22,
    height: 90,
    backgroundColor: Colors.mist,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barAmountLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9,
    color: Colors.inkSoft,
    marginTop: 4,
  },
  barMonthLabel: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  clientRow: {
    marginBottom: 14,
  },
  clientTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  clientName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  clientProj: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  clientAmount: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.moss,
  },
  clientPercent: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    color: Colors.inkSoft,
  },
  clientBarTrack: {
    height: 5,
    backgroundColor: Colors.mist,
    borderRadius: 3,
    overflow: 'hidden',
  },
  clientBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  pipelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.mist,
    borderRadius: 12,
    marginBottom: 8,
  },
  pipelineClient: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  pipelineProject: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  pipelineCollected: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    color: Colors.inkSoft,
    marginTop: 4,
  },
  pipelineRight: {
    alignItems: 'flex-end',
  },
  pipelineDueLabel: {
    fontFamily: Fonts.sansRegular,
    fontSize: 10,
    color: Colors.inkSoft,
  },
  pipelineDueAmount: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.brick,
    marginTop: 2,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 12,
  },
  paymentIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentClient: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  paymentProject: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  paymentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  paymentMeta: {
    fontFamily: Fonts.sansRegular,
    fontSize: 10,
    color: Colors.inkSoft,
  },
  incomeBadge: {
    backgroundColor: Colors.mossLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 4,
  },
  incomeBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 8.5,
    color: Colors.moss,
  },
  paymentAmount: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.moss,
  },
  emptyNote: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  emptyLogBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyLogTitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    textAlign: 'center',
    marginBottom: 12,
  },
  recordActionBtn: {
    backgroundColor: Colors.moss,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  recordActionText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
