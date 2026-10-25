import React from 'react';
import { View, Text } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { styles } from '../SplitList.styles';

interface SplitSummaryRowProps {
  totalOwedToYou: number;
  totalYouOwe: number;
}

export const SplitSummaryRow: React.FC<SplitSummaryRowProps> = ({
  totalOwedToYou,
  totalYouOwe,
}) => {
  return (
    <View style={styles.summaryRow}>
      {/* Card: Owed to You */}
      <View style={[styles.summaryCard, styles.summaryCardGreen]}>
        <View style={styles.summaryIconBadgeGreen}>
          <ArrowDownLeft size={16} color={Colors.moss} />
        </View>
        <Text style={styles.summaryLabel}>You are Owed</Text>
        <Text style={[styles.summaryAmount, { color: Colors.moss }]}>
          ₹{totalOwedToYou.toLocaleString()}
        </Text>
        <Text style={styles.summarySubtext}>From split members</Text>
      </View>

      {/* Card: You Owe */}
      <View style={[styles.summaryCard, styles.summaryCardRed]}>
        <View style={styles.summaryIconBadgeRed}>
          <ArrowUpRight size={16} color={Colors.brick} />
        </View>
        <Text style={styles.summaryLabel}>You Owe</Text>
        <Text style={[styles.summaryAmount, { color: Colors.brick }]}>
          ₹{totalYouOwe.toLocaleString()}
        </Text>
        <Text style={styles.summarySubtext}>Your pending share</Text>
      </View>
    </View>
  );
};
