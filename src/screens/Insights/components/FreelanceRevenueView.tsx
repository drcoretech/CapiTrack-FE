import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './FreelanceRevenueView.styles';
import { FreelanceContractCard } from './FreelanceContractCard';
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
          projects.map((proj) => (
            <FreelanceContractCard
              key={proj.id}
              project={proj}
              currencySymbol={currencySymbol}
              onOpenProject={onOpenProject}
            />
          ))
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
