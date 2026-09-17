import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { ExpenseCategory } from '../types';
import { useTranslation } from '../i18n/translations';
import { AnimatedPressable } from './AnimatedPressable';

export const AutoCaptureNudge: React.FC = () => {
  const pendingNudge = useAppStore((state) => state.pendingNudge);
  const pendingNudges = useAppStore((state) => state.pendingNudges || []);
  const categories = useAppStore((state) => state.categories);
  const saveNudgeExpense = useAppStore((state) => state.saveNudgeExpense);
  const dismissNudge = useAppStore((state) => state.dismissNudge);
  const { getCategoryName } = useTranslation();

  const activeCategories = categories.filter((c) => c.enabled);
  const queueCount = pendingNudges.length;

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('Food');

  // When a new nudge is triggered, pre-select its inferred category
  useEffect(() => {
    if (pendingNudge) {
      setSelectedCategory(pendingNudge.suggestedCategory || activeCategories[0]?.name || 'Food');
    }
  }, [pendingNudge]);

  if (!pendingNudge) {
    return null;
  }

  const handleSave = () => {
    saveNudgeExpense(selectedCategory);
  };

  // Badge icon initials for UPI source
  const getSourceBadge = () => {
    const src = pendingNudge.sourceApp.toLowerCase();
    if (src.includes('phonepe')) return 'Pe';
    if (src.includes('google') || src.includes('gpay')) return 'G';
    if (src.includes('paytm')) return 'Py';
    if (src.includes('cred')) return 'Cr';
    return '₹';
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={dismissNudge}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Top Source Header */}
          <View style={styles.sourceRow}>
            <View style={styles.sourceBadgeIcon}>
              <Text style={styles.sourceBadgeText}>{getSourceBadge()}</Text>
            </View>
            <Text style={styles.sourceText}>
              {pendingNudge.sourceApp.toUpperCase()} · {pendingNudge.timestamp.toUpperCase()}
              {queueCount > 1 ? ` · (1 OF ${queueCount})` : ''}
            </Text>
          </View>

          {/* Title & Payee */}
          <Text style={styles.title}>
            ₹{pendingNudge.amount.toLocaleString()} paid, what was this for?
          </Text>

          {pendingNudge.merchant ? (
            <Text style={styles.merchantSubtext} numberOfLines={1}>
              Payee: {pendingNudge.merchant}
            </Text>
          ) : null}

          {/* Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {activeCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <AnimatedPressable
                  key={cat.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Text style={styles.chipIcon}>{cat.icon}</Text>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {getCategoryName(cat.name)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </ScrollView>

          {/* Primary Amber Action Button */}
          {/* Primary Action Button */}
          <AnimatedPressable
            style={styles.primaryBtn}
            onPress={handleSave}
          >
            <Text style={styles.primaryBtnText}>
              {queueCount > 1
                ? `Save as ${getCategoryName(selectedCategory)} & Next (${queueCount - 1} more)`
                : `Save as ${getCategoryName(selectedCategory)}`}
            </Text>
          </AnimatedPressable>

          {/* Skip Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={dismissNudge}
            style={styles.ghostBtn}
          >
            <Text style={styles.ghostBtnText}>
              {queueCount > 1 ? `Skip (${queueCount - 1} more waiting)` : 'Skip this one'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 42, 36, 0.55)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  sheet: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 24,
    padding: 22,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceBadgeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: Colors.amber,
  },
  sourceText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    letterSpacing: 0.6,
    color: Colors.inkSoft,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 21,
    color: Colors.ink,
    lineHeight: 27,
  },
  merchantSubtext: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
    marginTop: -6,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: {
    backgroundColor: Colors.amber,
    borderColor: Colors.amber,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.inkSoft,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansSemiBold,
  },
  primaryBtn: {
    backgroundColor: Colors.amber,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 2,
  },
  primaryBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  ghostBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.inkSoft,
  },
});
