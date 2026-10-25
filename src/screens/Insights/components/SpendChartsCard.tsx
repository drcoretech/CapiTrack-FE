import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { styles } from './SpendChartsCard.styles';

interface TrendItem {
  month: number;
  year: number;
  total: number;
  label: string;
  isSelected: boolean;
  percentage: number;
  isPeak: boolean;
}

interface WeeklyItem {
  weekNum: number;
  range: string;
  total: number;
  percentage: number;
  label: string;
}

interface SpendChartsCardProps {
  chartMode: 'trend' | 'weekly';
  onChangeChartMode: (mode: 'trend' | 'weekly') => void;
  sixMonthsTrend: TrendItem[];
  weeklyFlowData: WeeklyItem[];
  onSelectTrendMonth: (month: number, year: number) => void;
  trendYear?: number;
  trendHalf?: 'H1' | 'H2';
  onPrevTrendYear?: () => void;
  onNextTrendYear?: () => void;
  onSelectTrendHalf?: (half: 'H1' | 'H2') => void;
  periodTotal?: number;
  currencySymbol?: string;
}

export const SpendChartsCard: React.FC<SpendChartsCardProps> = ({
  chartMode,
  onChangeChartMode,
  sixMonthsTrend,
  weeklyFlowData,
  onSelectTrendMonth,
  trendYear,
  trendHalf,
  onPrevTrendYear,
  onNextTrendYear,
  onSelectTrendHalf,
  periodTotal = 0,
  currencySymbol = '₹',
}) => {
  const { t, getMonth } = useTranslation();

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.chartSectionTitle}>
          {chartMode === 'trend' ? t('trend6Months') : t('weeklyFlow')}
        </Text>

        {/* Toggle Pills */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              chartMode === 'trend' && styles.segmentBtnActive,
            ]}
            onPress={() => onChangeChartMode('trend')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentBtnText,
                chartMode === 'trend' && styles.segmentBtnTextActive,
              ]}
            >
              {t('trend6Months')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              chartMode === 'weekly' && styles.segmentBtnActive,
            ]}
            onPress={() => onChangeChartMode('weekly')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentBtnText,
                chartMode === 'weekly' && styles.segmentBtnTextActive,
              ]}
            >
              {t('weeklyFlow')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 6-Month Trend Bar Chart */}
      {chartMode === 'trend' && (
        <>
          {trendYear !== undefined && onPrevTrendYear && onNextTrendYear && (
            <View style={styles.trendControlsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.trendPeriodSub}>
                  {trendYear} • {trendHalf === 'H1' ? 'Jan – Jun' : 'Jul – Dec'} (Total: {currencySymbol}{periodTotal.toLocaleString()})
                </Text>
              </View>
              <View style={styles.trendYearSwitcher}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onPrevTrendYear}
                  style={styles.yearArrowBtn}
                >
                  <ChevronLeft size={16} color={Colors.ink} />
                </TouchableOpacity>
                <Text style={styles.trendYearLabel}>{trendYear}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onNextTrendYear}
                  style={styles.yearArrowBtn}
                >
                  <ChevronRight size={16} color={Colors.ink} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {trendHalf && onSelectTrendHalf && (
            <View style={styles.halfYearTabContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSelectTrendHalf('H1')}
                style={[styles.halfYearTab, trendHalf === 'H1' && styles.halfYearTabActive]}
              >
                <Text style={[styles.halfYearTabText, trendHalf === 'H1' && styles.halfYearTabTextActive]}>
                  Jan – Jun (H1)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSelectTrendHalf('H2')}
                style={[styles.halfYearTab, trendHalf === 'H2' && styles.halfYearTabActive]}
              >
                <Text style={[styles.halfYearTabText, trendHalf === 'H2' && styles.halfYearTabTextActive]}>
                  Jul – Dec (H2)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.barChart}>
            {sixMonthsTrend.map((item) => (
              <TouchableOpacity
                key={`${item.year}-${item.month}`}
                style={styles.barColumn}
                onPress={() => onSelectTrendMonth(item.month, item.year)}
                activeOpacity={0.7}
              >
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${item.percentage}%` },
                      item.isPeak ? styles.barFillAmber : styles.barFillStandard,
                      item.isSelected && styles.barFillSelected,
                    ]}
                  >
                    <Text style={styles.barValueText}>{item.label}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    item.isSelected && styles.barLabelSelected,
                  ]}
                >
                  {getMonth(item.month, 'short')}
                </Text>
                {item.isSelected && <View style={styles.activeDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Weekly Flow Bar Chart */}
      {chartMode === 'weekly' && (
        <View style={styles.barChart}>
          {weeklyFlowData.map((item) => (
            <View key={item.weekNum} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${item.percentage}%` },
                    item.total > 0
                      ? styles.barFillStandard
                      : styles.barFillEmpty,
                  ]}
                >
                  {item.total > 0 && (
                    <Text style={styles.barValueText}>{item.label}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.barLabel}>W{item.weekNum}</Text>
              <Text style={styles.weekRangeSubText}>{item.range}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

