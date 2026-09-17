import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';

interface LedgerSummaryCardsProps {
  owedToYou: number;
  youOwe: number;
  onPressCard: () => void;
}

export const LedgerSummaryCards: React.FC<LedgerSummaryCardsProps> = ({
  owedToYou,
  youOwe,
  onPressCard,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.statRow}>
      <AnimatedPressable
        scaleTo={0.95}
        onPress={onPressCard}
        style={styles.statCard}
      >
        <Text style={[styles.statRowAmount, { color: Colors.moss }]}>
          ₹{owedToYou.toLocaleString()}
        </Text>
        <Text style={styles.statRowLabel}>{t('owedToYou')}</Text>
      </AnimatedPressable>

      <AnimatedPressable
        scaleTo={0.95}
        onPress={onPressCard}
        style={styles.statCard}
      >
        <Text style={[styles.statRowAmount, { color: Colors.brick }]}>
          ₹{youOwe.toLocaleString()}
        </Text>
        <Text style={styles.statRowLabel}>{t('youOwe')}</Text>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  statRowAmount: {
    fontFamily: Fonts.serifMedium,
    fontSize: 20,
  },
  statRowLabel: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 4,
  },
});
