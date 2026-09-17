import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';

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
}

export const SpendChartsCard: React.FC<SpendChartsCardProps> = ({
  chartMode,
  onChangeChartMode,
  sixMonthsTrend,
  weeklyFlowData,
  onSelectTrendMonth,
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

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartSectionTitle: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.mist,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  segmentBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  segmentBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  segmentBtnTextActive: {
    color: Colors.ink,
    fontFamily: Fonts.sansSemiBold,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 36,
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  barFillStandard: {
    backgroundColor: Colors.moss,
  },
  barFillAmber: {
    backgroundColor: Colors.amber,
  },
  barFillSelected: {
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  barFillEmpty: {
    backgroundColor: Colors.line,
  },
  barValueText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 8.5,
    color: '#FFFFFF',
  },
  barLabel: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 8,
  },
  barLabelSelected: {
    fontFamily: Fonts.monoMedium,
    color: Colors.ink,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.moss,
    marginTop: 3,
  },
  weekRangeSubText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 8.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
});
