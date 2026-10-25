import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { Expense } from '../../types';
import { ExpenseSkeleton } from './components/ExpenseSkeleton';
import { ExpenseSummaryBanner } from './components/ExpenseSummaryBanner';
import { ExpenseFilterStrip } from './components/ExpenseFilterStrip';
import { ExpenseListItem } from './components/ExpenseListItem';
import {
  Plus,
  Settings,
  Calendar,
} from 'lucide-react-native';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { haptics } from '../../services/haptics';
import { styles } from './ExpenseHistory.styles';

export const ExpenseHistoryScreen: React.FC = () => {
  const expenses = useAppStore((state) => state.expenses);
  const categories = useAppStore((state) => state.categories);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const refreshDashboard = useAppStore((state) => state.refreshDashboard);
  const setEditingExpense = useAppStore((state) => state.setEditingExpense);
  const deleteExpense = useAppStore((state) => state.deleteExpense);
  const openModal = useAppStore((state) => state.openModal);
  const { t, getCategoryName } = useTranslation();

  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  const getLocalizedDayGroup = (group: string) => {
    if (group === 'Today') return t('dayToday');
    if (group === 'Yesterday') return t('dayYesterday');
    if (group === 'Earlier') return t('dayEarlier');
    return group;
  };

  // Filtered & sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // 1. Category filter
      if (selectedCategoryFilter !== 'ALL' && item.category !== selectedCategoryFilter) {
        return false;
      }
      // 2. Search query filter (matches note or category name)
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const noteMatch = (item.note || '').toLowerCase().includes(query);
        const catMatch = item.category.toLowerCase().includes(query);
        const amountMatch = String(item.amount).includes(query);
        if (!noteMatch && !catMatch && !amountMatch) {
          return false;
        }
      }
      return true;
    });
  }, [expenses, selectedCategoryFilter, searchQuery]);

  // Overall total for currently displayed expenses
  const displayedTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  // 1. Sort all expenses chronologically descending by date
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      const timeA = new Date(a.date || a.createdAt).getTime() || 0;
      const timeB = new Date(b.date || b.createdAt).getTime() || 0;
      return timeB - timeA;
    });
  }, [filteredExpenses]);

  // 2. Group expenses while tracking each group's latest timestamp
  interface ExpenseGroup {
    groupName: string;
    maxTimestamp: number;
    items: Expense[];
  }

  const orderedGroups = useMemo(() => {
    const groupMap = new Map<string, ExpenseGroup>();

    for (const exp of sortedExpenses) {
      const isMonthlyTotal = exp.note?.includes('[Monthly Total]');
      let group = exp.dayGroup || 'Today';
      const itemTime = new Date(exp.date || exp.createdAt).getTime() || 0;

      if (isMonthlyTotal) {
        const d = new Date(exp.date || exp.createdAt);
        if (!isNaN(d.getTime())) {
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
          ];
          group = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        }
      }

      if (!groupMap.has(group)) {
        groupMap.set(group, {
          groupName: group,
          maxTimestamp: itemTime,
          items: [],
        });
      }
      const g = groupMap.get(group)!;
      g.items.push(exp);
      if (itemTime > g.maxTimestamp) {
        g.maxTimestamp = itemTime;
      }
    }

    return Array.from(groupMap.values()).sort((a, b) => {
      if (a.groupName === 'Today') return -1;
      if (b.groupName === 'Today') return 1;
      if (a.groupName === 'Yesterday') return -1;
      if (b.groupName === 'Yesterday') return 1;
      return b.maxTimestamp - a.maxTimestamp;
    });
  }, [sortedExpenses]);

  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.enabled);
  }, [categories]);

  const isInitialLoading = isSyncing && expenses.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={refreshDashboard}
            tintColor={Colors.moss}
          />
        }
      >
        {isInitialLoading ? (
          <ExpenseSkeleton />
        ) : (
          <>
            {/* Top Bar */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>{t('thisMonth')}</Text>
                <Text style={styles.title}>{t('expensesTitle')}</Text>
              </View>
              <AnimatedPressable
                scaleTo={0.9}
                onPress={() => openModal('profile_details')}
                style={styles.settingsBadge}
              >
                <Settings size={18} color={Colors.ink} />
              </AnimatedPressable>
            </View>

            {/* Total Spent Editorial Banner */}
            <ExpenseSummaryBanner
              displayedTotal={displayedTotal}
              count={filteredExpenses.length}
              isFiltered={selectedCategoryFilter !== 'ALL' || searchQuery.trim().length > 0}
            />

            {/* Search Input Bar & Category Filter Chips */}
            <ExpenseFilterStrip
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={(cat) => setSelectedCategoryFilter(cat)}
              activeCategories={activeCategories}
              totalExpensesCount={expenses.length}
              expenses={expenses}
            />

            {/* Empty State */}
            {orderedGroups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Calendar size={28} color={Colors.moss} strokeWidth={1.8} />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery.trim().length > 0 || selectedCategoryFilter !== 'ALL'
                    ? 'No matching expenses'
                    : 'No expenses recorded yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery.trim().length > 0 || selectedCategoryFilter !== 'ALL'
                    ? 'Try clearing the search query or category filter'
                    : 'Tap the + button below or log your first spend'}
                </Text>
                {!(searchQuery.trim().length > 0 || selectedCategoryFilter !== 'ALL') ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openModal('add_expense')}
                    style={styles.emptyActionBtn}
                  >
                    <Plus size={14} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 6 }} />
                    <Text style={styles.emptyActionBtnText}>Log First Spend</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategoryFilter('ALL');
                    }}
                    style={styles.clearFilterBtn}
                  >
                    <Text style={styles.clearFilterText}>Reset Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              orderedGroups.map(({ groupName: dayGroup, items }) => {
                const groupTotal = items.reduce((sum, item) => sum + item.amount, 0);

                return (
                  <View key={dayGroup} style={styles.groupContainer}>
                    <View style={styles.groupHeader}>
                      <Text style={styles.dayLabel}>
                        {getLocalizedDayGroup(dayGroup)}
                      </Text>
                      <View style={styles.groupSubtotalBadge}>
                        <Text style={styles.groupSubtotalText}>₹{groupTotal.toLocaleString()}</Text>
                      </View>
                    </View>

                    <View style={styles.list}>
                      {items.map((item) => (
                        <ExpenseListItem
                          key={item.id}
                          item={item}
                          categoryName={getCategoryName(item.category)}
                          onEdit={(exp) => setEditingExpense(exp)}
                          onDelete={(exp) => setExpenseToDelete(exp)}
                        />
                      ))}
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        visible={expenseToDelete !== null}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        itemBadge={
          expenseToDelete
            ? `₹${expenseToDelete.amount.toLocaleString()} · ${(expenseToDelete.note || '').replace(/\[Monthly Total\]\s*/g, '').trim() || expenseToDelete.category}`
            : undefined
        }
        confirmLabel="Delete Expense"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpense(expenseToDelete.id || (expenseToDelete as any)._id);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />
    </SafeAreaView>
  );
};
