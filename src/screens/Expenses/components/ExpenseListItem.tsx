import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Trash2 } from 'lucide-react-native';
import { Expense } from '../../../types';
import { Colors } from '../../../theme/colors';
import { CategoryIcon } from '../../../components/CategoryIcon';
import { haptics } from '../../../services/haptics';
import { styles } from '../ExpenseHistory.styles';

interface ExpenseListItemProps {
  item: Expense;
  categoryName: string;
  onEdit: (item: Expense) => void;
  onDelete: (item: Expense) => void;
}

export const ExpenseListItem: React.FC<ExpenseListItemProps> = ({
  item,
  categoryName,
  onEdit,
  onDelete,
}) => {
  const isMonthlyTotal = item.note?.includes('[Monthly Total]');
  const cleanNote = isMonthlyTotal
    ? item.note.replace(/\[Monthly Total\]\s*/g, '').trim() || 'Full Month Total'
    : item.note;

  const renderRightActions = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        haptics.medium();
        onDelete(item);
      }}
      style={styles.swipeDeleteAction}
    >
      <Trash2 size={18} color="#FFFFFF" strokeWidth={2.2} />
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      key={item.id}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={30}
      containerStyle={styles.swipeableContainer}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          haptics.light();
          onEdit(item);
        }}
        style={[styles.expItem, isMonthlyTotal && styles.expItemMonthlyTotal]}
      >
        <View style={styles.left}>
          <View
            style={[
              styles.iconContainer,
              isMonthlyTotal && styles.iconContainerMonthlyTotal,
            ]}
          >
            <CategoryIcon
              category={isMonthlyTotal ? 'monthly' : item.category}
              icon={item.icon}
              size={18}
              color={isMonthlyTotal ? Colors.amber : Colors.moss}
            />
          </View>
          <View style={styles.details}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                {cleanNote}
              </Text>
              {isMonthlyTotal && (
                <View style={styles.lumpSumPill}>
                  <Text style={styles.lumpSumPillText}>Lump Sum</Text>
                </View>
              )}
            </View>
            <Text style={styles.meta} numberOfLines={1} ellipsizeMode="tail">
              {isMonthlyTotal
                ? `Full Month Total · ${categoryName}`
                : `${categoryName}${item.time ? ` · ${item.time}` : ''}`}
            </Text>
          </View>
        </View>
        <View style={styles.rightActions}>
          <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              haptics.medium();
              onDelete(item);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deletePill}
          >
            <Trash2 size={12} color={Colors.brick} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};
