import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react-native';
import { SplitBill } from '../../../types';
import { Colors } from '../../../theme/colors';
import { styles } from '../SplitList.styles';

interface SplitBillCardProps {
  bill: SplitBill;
  onPress: (id: string) => void;
}

export const SplitBillCard: React.FC<SplitBillCardProps> = ({ bill, onPress }) => {
  const paidCount = bill.participants.filter((p) => p.isPaid).length;
  const totalCount = bill.participants.length;
  const progressPct = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
  const isSettled = bill.status === 'SETTLED';
  const userPaid = bill.paidBy.isCurrentUser;
  const myParticipant = bill.participants.find((p) => p.isCurrentUser);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(bill.id)}
      style={styles.billCard}
    >
      {/* Top Row: Title + Total */}
      <View style={styles.billCardHeader}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={styles.titleRow}>
            <Text style={styles.billTitle} numberOfLines={1}>
              {bill.title}
            </Text>
            {bill.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{bill.category}</Text>
              </View>
            )}
          </View>
          <Text style={styles.billDate}>{bill.date}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.billTotalAmount}>
            ₹{bill.totalAmount.toLocaleString()}
          </Text>
          <Text style={styles.billTotalLabel}>Total Bill</Text>
        </View>
      </View>

      {/* Middle Row: Payer badge & Progress */}
      <View style={styles.billCardMiddle}>
        <View style={styles.payerBadge}>
          <Text style={styles.payerBadgeText}>
            Paid by{' '}
            <Text style={{ fontWeight: '700' }}>
              {userPaid ? 'You' : bill.paidBy.name}
            </Text>
          </Text>
        </View>

        <View style={styles.statusBadge}>
          {isSettled ? (
            <View style={[styles.statusPill, { backgroundColor: '#DCFCE7' }]}>
              <CheckCircle2 size={12} color="#15803D" />
              <Text style={[styles.statusPillText, { color: '#15803D' }]}>
                Settled
              </Text>
            </View>
          ) : (
            <View style={[styles.statusPill, { backgroundColor: '#FEF3C7' }]}>
              <Clock size={12} color="#B45309" />
              <Text style={[styles.statusPillText, { color: '#B45309' }]}>
                {paidCount}/{totalCount} Paid
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progressPct}%`,
              backgroundColor: isSettled ? Colors.moss : Colors.amber,
            },
          ]}
        />
      </View>

      {/* Bottom Row: Your Share & Action */}
      <View style={styles.billCardFooter}>
        {userPaid ? (
          <Text style={styles.footerShareText}>
            You lent{' '}
            <Text style={{ color: Colors.moss, fontWeight: '700' }}>
              ₹{(bill.totalAmount - (myParticipant?.amount || 0)).toLocaleString()}
            </Text>{' '}
            to {totalCount - 1} friends
          </Text>
        ) : (
          <Text style={styles.footerShareText}>
            Your share:{' '}
            <Text style={{ color: Colors.brick, fontWeight: '700' }}>
              ₹{myParticipant ? myParticipant.amount.toLocaleString() : '0'}
            </Text>
          </Text>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={styles.viewDetailsText}>View Split</Text>
          <ChevronRight size={14} color={Colors.moss} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
