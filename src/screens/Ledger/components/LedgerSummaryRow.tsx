import React from 'react';
import { View, Text } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { styles } from '../LedgerList.styles';

interface LedgerSummaryRowProps {
  receiveTotal: number;
  oweTotal: number;
  youWillGetLabel: string;
  youOweLabel: string;
}

export const LedgerSummaryRow: React.FC<LedgerSummaryRowProps> = ({
  receiveTotal,
  oweTotal,
  youWillGetLabel,
  youOweLabel,
}) => {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryCardHeader}>
          <View style={[styles.arrowBadge, { backgroundColor: Colors.mossLight }]}>
            <ArrowDownLeft size={13} color={Colors.moss} strokeWidth={2.6} />
          </View>
          <Text style={styles.summaryLbl}>{youWillGetLabel}</Text>
        </View>
        <Text style={[styles.summaryNum, { color: Colors.moss }]}>
          ₹{receiveTotal.toLocaleString()}
        </Text>
      </View>
      <View style={styles.summaryCard}>
        <View style={styles.summaryCardHeader}>
          <View style={[styles.arrowBadge, { backgroundColor: '#FEE2E2' }]}>
            <ArrowUpRight size={13} color={Colors.brick} strokeWidth={2.6} />
          </View>
          <Text style={styles.summaryLbl}>{youOweLabel}</Text>
        </View>
        <Text style={[styles.summaryNum, { color: Colors.brick }]}>
          ₹{oweTotal.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};
