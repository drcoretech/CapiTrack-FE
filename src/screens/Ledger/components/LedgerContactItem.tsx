import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { CheckCheck, Trash2, Pencil } from 'lucide-react-native';
import { Person, LedgerTransaction } from '../../../types';
import { Colors } from '../../../theme/colors';
import { AnimatedPressable } from '../../../components/AnimatedPressable';
import { haptics } from '../../../services/haptics';
import { styles } from '../LedgerList.styles';

interface LedgerContactItemProps {
  person: Person;
  dateStr: string;
  statusSettledText: string;
  statusPendingText: string;
  lastPrefixText: string;
  onOpenDetail: (personId: string) => void;
  onSettle: (personId: string) => void;
  onDelete: (personId: string, name: string) => void;
  onEditTxn: (personId: string, txn: LedgerTransaction) => void;
}

export const LedgerContactItem: React.FC<LedgerContactItemProps> = ({
  person,
  dateStr,
  statusSettledText,
  statusPendingText,
  lastPrefixText,
  onOpenDetail,
  onSettle,
  onDelete,
  onEditTxn,
}) => {
  const isOwed = person.netBalance > 0;
  const isSettled = person.netBalance === 0;

  const renderPersonRightActions = () => (
    <View style={styles.swipeActionsRow}>
      {!isSettled && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            haptics.success();
            onSettle(person.id);
          }}
          style={styles.swipeSettleAction}
        >
          <CheckCheck size={18} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.swipeActionText}>Settle</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          haptics.medium();
          onDelete(person.id, person.name);
        }}
        style={styles.swipeDeleteAction}
      >
        <Trash2 size={18} color="#FFFFFF" strokeWidth={2.2} />
        <Text style={styles.swipeActionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable
      key={person.id}
      renderRightActions={renderPersonRightActions}
      friction={2}
      rightThreshold={30}
      containerStyle={styles.swipeableContainer}
    >
      <AnimatedPressable
        scaleTo={0.97}
        onPress={() => {
          haptics.light();
          onOpenDetail(person.id);
        }}
        style={styles.personItem}
      >
        <View style={styles.personLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{person.initial}</Text>
          </View>
          <View style={styles.personDetails}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {person.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1} ellipsizeMode="tail">
              {lastPrefixText} {dateStr}
            </Text>
          </View>
        </View>

        <View style={styles.personRight}>
          <Text
            style={[
              styles.amount,
              isOwed ? styles.amountOwed : styles.amountOwe,
              isSettled && styles.amountSettled,
            ]}
          >
            {isOwed
              ? `+₹${person.netBalance.toLocaleString()}`
              : isSettled
              ? '₹0'
              : `-₹${Math.abs(person.netBalance).toLocaleString()}`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View
              style={[
                styles.pill,
                person.status === 'settled' ? styles.pillSettled : styles.pillPending,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  person.status === 'settled'
                    ? styles.pillTextSettled
                    : styles.pillTextPending,
                ]}
              >
                {person.status === 'settled' ? statusSettledText : statusPendingText}
              </Text>
            </View>
            {person.transactions.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => {
                  haptics.selection();
                  onEditTxn(person.id, person.transactions[0]);
                }}
                style={styles.editPill}
              >
                <Pencil size={11} color={Colors.inkSoft} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </AnimatedPressable>
    </Swipeable>
  );
};
