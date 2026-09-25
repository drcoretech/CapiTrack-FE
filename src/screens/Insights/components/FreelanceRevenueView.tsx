import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
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
  onSelectMonthYear?: (month: number, year: number) => void;
}

const parseDateSafe = (dateInput?: any): Date => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) return dateInput;
  const d = new Date(dateInput);
  if (!isNaN(d.getTime())) return d;
  if (typeof dateInput === 'string') {
    const monthNames: Record<string, number> = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, september: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11,
    };
    const cleaned = dateInput.toLowerCase().replace(/,/g, '').trim();
    for (const [name, m] of Object.entries(monthNames)) {
      if (cleaned.includes(name)) {
        const yearMatch = cleaned.match(/\b(20\d\d)\b/);
        const y = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        const dayMatch = cleaned.match(/\b([1-9]|[12]\d|3[01])\b/);
        const day = dayMatch ? parseInt(dayMatch[1], 10) : 15;
        return new Date(y, m, day);
      }
    }
  }
  return new Date();
};

export const FreelanceRevenueView: React.FC<FreelanceRevenueViewProps> = ({
  projects,
  selectedMonth,
  selectedYear,
  currencySymbol,
  totalPersonalSpent,
  onOpenProject,
  onNavigateToLedger,
  onSelectMonthYear,
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
        const rawDate = p.date || proj.createdAt;
        const d = parseDateSafe(rawDate);
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

  // Contracts booked/signed in selected month & year
  const monthContracts = useMemo(() => {
    return projects.filter((proj) => {
      const d = parseDateSafe(proj.createdAt);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [projects, selectedMonth, selectedYear]);

  const contractsValueSignedMonth = useMemo(() => {
    return monthContracts.reduce((sum, p) => sum + p.totalValue, 0);
  }, [monthContracts]);

  // Total collected in selected month (falls back to contract deal value if cash receipts are 0)
  const totalCollectedMonth = useMemo(() => {
    const cashRec = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    if (cashRec > 0) return cashRec;
    return contractsValueSignedMonth;
  }, [monthPayments, contractsValueSignedMonth]);

  // Previous month collected for comparison
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

  const prevMonthCollected = useMemo(() => {
    let sum = 0;
    projects.forEach((proj) => {
      (proj.payments || []).forEach((p) => {
        const rawDate = p.date || proj.createdAt;
        const d = parseDateSafe(rawDate);
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

  // Year-wise 6-Month Trend Controls
  const [trendYear, setTrendYear] = useState(selectedYear);
  const [trendHalf, setTrendHalf] = useState<'H1' | 'H2'>(selectedMonth <= 6 ? 'H1' : 'H2');

  useEffect(() => {
    setTrendYear(selectedYear);
    setTrendHalf(selectedMonth <= 6 ? 'H1' : 'H2');
  }, [selectedMonth, selectedYear]);

  // 6-Month Revenue Trend computed for the chosen year and half
  const sixMonthsTrend = useMemo(() => {
    const monthsList: { month: number; year: number }[] = [];
    const startMonth = trendHalf === 'H1' ? 1 : 7;
    for (let m = startMonth; m < startMonth + 6; m++) {
      monthsList.push({
        month: m,
        year: trendYear,
      });
    }

    const data = monthsList.map((m) => {
      let monthSum = 0;
      projects.forEach((proj) => {
        const projDate = parseDateSafe(proj.createdAt);
        const projCreatedInThisMonth =
          projDate.getMonth() + 1 === m.month && projDate.getFullYear() === m.year;

        const payments = proj.payments || [];
        let projectMonthPayments = 0;
        if (payments.length > 0) {
          payments.forEach((p) => {
            const rawDate = p.date || proj.createdAt;
            const d = parseDateSafe(rawDate);
            if (d.getMonth() + 1 === m.month && d.getFullYear() === m.year) {
              projectMonthPayments += p.amount;
            }
          });
        }

        if (projectMonthPayments > 0) {
          monthSum += projectMonthPayments;
        } else if (projCreatedInThisMonth) {
          // If no payment milestone has been collected yet, count the contracted deal value
          monthSum += proj.totalValue;
        }
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
    const periodTotal = data.reduce((sum, d) => sum + d.total, 0);

    return {
      periodTotal,
      bars: data.map((d) => ({
        ...d,
        percentage: Math.max(12, Math.round((d.total / maxVal) * 100)),
        isPeak: d.total === maxVal && d.total > 0,
      })),
    };
  }, [projects, selectedMonth, selectedYear, currencySymbol, trendYear, trendHalf]);

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

        {/* Alert when contracts are signed in selected month */}
        {monthContracts.length > 0 && (
          <View style={styles.contractAlertCard}>
            <View style={styles.contractAlertTop}>
              <View style={styles.contractAlertIcon}>
                <Briefcase size={16} color={Colors.moss} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contractAlertTitle}>
                  {monthContracts.length} Project Contract{monthContracts.length > 1 ? 's' : ''} Signed in {getMonth(selectedMonth)} {selectedYear}
                </Text>
                <Text style={styles.contractAlertSub} numberOfLines={2}>
                  {monthContracts.map((p) => `${p.clientName} (₹${p.totalValue.toLocaleString()})`).join(' • ')}
                </Text>
              </View>
            </View>
            <Text style={styles.contractAlertHint}>
              {totalCollectedMonth > 0
                ? `Total contract deal value booked: ₹${contractsValueSignedMonth.toLocaleString()}.`
                : `₹${contractsValueSignedMonth.toLocaleString()} new contract value booked for this month! Tap project below to record or edit milestone payments.`}
            </Text>
          </View>
        )}
      </View>

      {/* 2. Client Contracts & Projects Overview */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.sectionHeaderTitle}>Client Contracts & Projects</Text>
            <Text style={styles.sectionSubtitle} numberOfLines={1}>
              {projects.length} {projects.length === 1 ? 'Contract' : 'Contracts'} · {currencySymbol}{portfolioStats.totalInvoiced.toLocaleString()} Total Portfolio
            </Text>
          </View>
          {onNavigateToLedger && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateToLedger}
              style={styles.addContractHeaderBtn}
            >
              <Text style={styles.addContractHeaderText}>+ New Contract</Text>
            </TouchableOpacity>
          )}
        </View>

        {projects.length === 0 ? (
          <View style={styles.emptyContractBox}>
            <Briefcase size={28} color={Colors.inkSoft} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyContractTitle}>No Client Projects Added</Text>
            <Text style={styles.emptyContractSub}>
              Add client contracts in Ledger to track contract values, milestones, and freelance earnings.
            </Text>
          </View>
        ) : (
          projects.map((proj) => {
            const rec = (proj.payments || []).reduce((s, p) => s + p.amount, 0);
            const due = Math.max(0, proj.totalValue - rec);
            const pct =
              proj.totalValue > 0
                ? Math.min(100, Math.round((rec / proj.totalValue) * 100))
                : 100;
            const isCompleted = due === 0;

            return (
              <TouchableOpacity
                key={proj.id}
                activeOpacity={0.7}
                onPress={() => onOpenProject?.(proj.id)}
                style={styles.contractItemCard}
              >
                <View style={styles.contractCardTop}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.contractClientName} numberOfLines={1}>
                      {proj.clientName}
                    </Text>
                    <Text style={styles.contractProjectTitle} numberOfLines={1}>
                      {proj.projectTitle}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.contractTotalAmount}>
                      {currencySymbol}{proj.totalValue.toLocaleString()}
                    </Text>
                    <View
                      style={[
                        styles.contractStatusPill,
                        isCompleted
                          ? styles.pillCompleted
                          : rec > 0
                          ? styles.pillPending
                          : styles.pillInProgress,
                      ]}
                    >
                      <Text
                        style={[
                          styles.contractStatusText,
                          isCompleted
                            ? styles.statusTextCompleted
                            : rec > 0
                            ? styles.statusTextPending
                            : styles.statusTextInProgress,
                        ]}
                      >
                        {isCompleted ? 'Settled' : rec > 0 ? 'Partially Paid' : 'In Progress'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.contractBarTrack}>
                  <View
                    style={[
                      styles.contractBarFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: isCompleted ? Colors.moss : rec > 0 ? Colors.amber : '#CBD5E1',
                      },
                    ]}
                  />
                </View>

                <View style={styles.contractCardBottom}>
                  <Text style={styles.contractCollectedText}>
                    Collected: {currencySymbol}{rec.toLocaleString()} ({pct}%)
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text
                      style={[
                        styles.contractDueText,
                        due === 0 && { color: Colors.moss },
                      ]}
                    >
                      {due > 0 ? `Due: ${currencySymbol}${due.toLocaleString()}` : 'Fully Paid ✅'}
                    </Text>
                    <View style={styles.contractEditBadge}>
                      <Pencil size={11} color={Colors.inkSoft} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* 3. Year-Wise 6-Month Freelance Revenue Trend Bar Chart */}
      <View style={styles.card}>
        <View style={styles.trendHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{t('revenueTrend6Months')}</Text>
            <Text style={styles.trendPeriodSub}>
              {trendYear} • {trendHalf === 'H1' ? 'Jan – Jun (H1)' : 'Jul – Dec (H2)'} (Total: {currencySymbol}{sixMonthsTrend.periodTotal.toLocaleString()})
            </Text>
          </View>

          <View style={styles.trendYearSwitcher}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setTrendYear((y) => y - 1)}
              style={styles.yearArrowBtn}
            >
              <ChevronLeft size={16} color={Colors.ink} />
            </TouchableOpacity>
            <Text style={styles.trendYearLabel}>{trendYear}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setTrendYear((y) => y + 1)}
              style={styles.yearArrowBtn}
            >
              <ChevronRight size={16} color={Colors.ink} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Half Year Segmented Tabs */}
        <View style={styles.halfYearTabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTrendHalf('H1')}
            style={[styles.halfYearTab, trendHalf === 'H1' && styles.halfYearTabActive]}
          >
            <Text style={[styles.halfYearTabText, trendHalf === 'H1' && styles.halfYearTabTextActive]}>
              Jan – Jun (H1)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTrendHalf('H2')}
            style={[styles.halfYearTab, trendHalf === 'H2' && styles.halfYearTabActive]}
          >
            <Text style={[styles.halfYearTabText, trendHalf === 'H2' && styles.halfYearTabTextActive]}>
              Jul – Dec (H2)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trendBarsRow}>
          {sixMonthsTrend.bars.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => onSelectMonthYear?.(item.month, item.year)}
              style={styles.barCol}
            >
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
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4. Milestone Receipts Activity Log */}
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
                    {parseDateSafe(p.date).toLocaleDateString(undefined, {
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
    backgroundColor: '#F7FAF7',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.moss,
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
    gap: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 6,
  },
  sectionHeaderTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 2,
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
  sectionSubtitle: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  addContractHeaderBtn: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.mossLight,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addContractHeaderText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11.5,
    color: Colors.moss,
  },
  emptyContractBox: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyContractTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 4,
  },
  emptyContractSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 17,
  },
  contractItemCard: {
    backgroundColor: Colors.mist,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  contractCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  contractClientName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  contractProjectTitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  contractTotalAmount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 15,
    color: Colors.ink,
    textAlign: 'right',
  },
  contractStatusPill: {
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  pillCompleted: {
    backgroundColor: Colors.mossLight,
  },
  pillPending: {
    backgroundColor: Colors.amberLight,
  },
  pillInProgress: {
    backgroundColor: '#E2E8F0',
  },
  contractStatusText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    letterSpacing: 0.3,
  },
  statusTextCompleted: {
    color: Colors.moss,
  },
  statusTextPending: {
    color: Colors.amber,
  },
  statusTextInProgress: {
    color: Colors.inkSoft,
  },
  contractBarTrack: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  contractBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  contractCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contractCollectedText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  contractDueText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.amber,
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
  contractAlertCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
  },
  contractAlertTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contractAlertIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractAlertTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12.5,
    color: Colors.moss,
  },
  contractAlertSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  contractAlertHint: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.moss,
    lineHeight: 15,
    marginTop: 4,
  },
  contractEditBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  trendPeriodSub: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  trendYearSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mist,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  yearArrowBtn: {
    padding: 4,
  },
  trendYearLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  halfYearTabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.mist,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  halfYearTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  halfYearTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  halfYearTabText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
  },
  halfYearTabTextActive: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.ink,
  },
});
