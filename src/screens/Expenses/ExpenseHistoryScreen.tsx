import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { Expense } from '../../types';
import { ExpenseSkeleton } from './components/ExpenseSkeleton';
import { CategoryIcon } from '../../components/CategoryIcon';
import {
  Search,
  X,
  Plus,
  Settings,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react-native';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

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
            <View style={styles.summaryBanner}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryLabel}>
                  {selectedCategoryFilter === 'ALL' && !searchQuery.trim()
                    ? 'TOTAL TRACKED'
                    : 'FILTERED TOTAL'}
                </Text>
                <Text style={styles.summaryAmount}>₹{displayedTotal.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRight}>
                <View style={styles.summaryCountPill}>
                  <Layers size={12} color={Colors.moss} />
                  <Text style={styles.summaryCountText}>{filteredExpenses.length} entries</Text>
                </View>
              </View>
            </View>

            {/* Search Input Bar */}
            <View style={styles.searchBarContainer}>
              <Search size={16} color={Colors.inkSoft} strokeWidth={2} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search note, category, amount..."
                placeholderTextColor={Colors.inkSoft}
                style={styles.searchInput}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
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
                onPress={() => setSelectedCategoryFilter('ALL')}
                style={[
                  styles.filterChip,
                  selectedCategoryFilter === 'ALL' && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategoryFilter === 'ALL' && styles.filterChipTextActive,
                  ]}
                >
                  All ({expenses.length})
                </Text>
              </TouchableOpacity>

              {activeCategories.map((cat) => {
                const count = expenses.filter((e) => e.category === cat.name).length;
                const isSelected = selectedCategoryFilter === cat.name;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedCategoryFilter(isSelected ? 'ALL' : cat.name)}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextActive,
                      ]}
                    >
                      {getCategoryName(cat.name)} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

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
                      {items.map((item) => {
                        const isMonthlyTotal = item.note?.includes('[Monthly Total]');
                        const cleanNote = isMonthlyTotal
                          ? item.note.replace(/\[Monthly Total\]\s*/g, '').trim() || 'Full Month Total'
                          : item.note;

                        return (
                          <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.75}
                            onPress={() => setEditingExpense(item)}
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
                                    ? `Full Month Total · ${getCategoryName(item.category)}`
                                    : `${getCategoryName(item.category)}${item.time ? ` · ${item.time}` : ''}`}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.rightActions}>
                              <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  setExpenseToDelete(item);
                                }}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={styles.deletePill}
                              >
                                <Trash2 size={12} color={Colors.brick} />
                              </TouchableOpacity>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120, // space for floating navbar
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.moss,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  settingsBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 26,
    color: Colors.ink,
    marginTop: 2,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryLeft: {
    gap: 2,
  },
  summaryLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  summaryAmount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 26,
    color: Colors.ink,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mossLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  summaryCountText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.moss,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sansRegular,
    fontSize: 13.5,
    color: Colors.ink,
    padding: 0,
  },
  filterStrip: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  filterChipActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
  },
  filterChipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.line,
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  emptySubtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
    textAlign: 'center',
    maxWidth: 240,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: Colors.moss,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyActionBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  clearFilterBtn: {
    marginTop: 8,
    backgroundColor: Colors.mist,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  clearFilterText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.moss,
  },
  groupContainer: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  dayLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  groupSubtotalBadge: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  groupSubtotalText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  list: {
    gap: 8,
  },
  expItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  expItemMonthlyTotal: {
    borderColor: Colors.amber,
    backgroundColor: '#FCFAF4',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 10,
  },
  details: {
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconContainerMonthlyTotal: {
    backgroundColor: Colors.amberLight,
  },
  name: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.ink,
    flexShrink: 1,
  },
  lumpSumPill: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  lumpSumPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.amber,
    textTransform: 'uppercase',
  },
  meta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 16,
    color: Colors.ink,
    flexShrink: 0,
    textAlign: 'right',
  },
  deletePill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
