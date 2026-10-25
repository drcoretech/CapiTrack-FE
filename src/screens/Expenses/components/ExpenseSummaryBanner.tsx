import React from 'react';
import { View, Text } from 'react-native';
import { Layers } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { styles } from '../ExpenseHistory.styles';

interface ExpenseSummaryBannerProps {
  displayedTotal: number;
  count: number;
  isFiltered: boolean;
}

export const ExpenseSummaryBanner: React.FC<ExpenseSummaryBannerProps> = ({
  displayedTotal,
  count,
  isFiltered,
}) => {
  return (
    <View style={styles.summaryBanner}>
      <View style={styles.summaryLeft}>
        <Text style={styles.summaryLabel}>
          {isFiltered ? 'FILTERED TOTAL' : 'TOTAL TRACKED'}
        </Text>
        <Text style={styles.summaryAmount}>₹{displayedTotal.toLocaleString()}</Text>
      </View>
      <View style={styles.summaryRight}>
        <View style={styles.summaryCountPill}>
          <Layers size={12} color={Colors.moss} />
          <Text style={styles.summaryCountText}>{count} entries</Text>
        </View>
      </View>
    </View>
  );
};
