import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { styles } from '../ExpenseHistory.styles';
import { AppCategory, Expense } from '../../../types';

interface ExpenseFilterStripProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  activeCategories: AppCategory[];
  totalExpensesCount: number;
  expenses: Expense[];
}

export const ExpenseFilterStrip: React.FC<ExpenseFilterStripProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  activeCategories,
  totalExpensesCount,
  expenses,
}) => {
  return (
    <>
      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Search size={16} color={Colors.inkSoft} strokeWidth={2} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search note, category, amount..."
          placeholderTextColor={Colors.inkSoft}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={15} color={Colors.inkSoft} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips Horizontal Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterStrip}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectCategory('ALL')}
          style={[
            styles.filterChip,
            selectedCategory === 'ALL' && styles.filterChipActive,
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedCategory === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            All ({totalExpensesCount})
          </Text>
        </TouchableOpacity>

        {activeCategories.map((cat) => {
          const count = expenses.filter((e) => e.category === cat.name).length;
          const isSelected = selectedCategory === cat.name;

          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(isSelected ? 'ALL' : cat.name)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {cat.icon} {cat.name} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
};
