import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
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
      {/* Owed To You Card */}
      <AnimatedPressable
        scaleTo={0.96}
        onPress={onPressCard}
        style={[styles.statCard, styles.statCardOwedToYou]}
      >
        <View style={styles.badgeRow}>
          <View style={[styles.arrowBadge, { backgroundColor: Colors.mossLight }]}>
            <ArrowUpRight size={12} color={Colors.moss} strokeWidth={2.6} />
          </View>
          <Text style={[styles.badgeText, { color: Colors.moss }]}>RECEIVABLE</Text>
        </View>
        <Text style={[styles.statRowAmount, { color: Colors.moss }]}>
          +₹{owedToYou.toLocaleString()}
        </Text>
        <Text style={styles.statRowLabel}>{t('owedToYou')}</Text>
      </AnimatedPressable>

      {/* You Owe Card */}
      <AnimatedPressable
        scaleTo={0.96}
        onPress={onPressCard}
        style={[styles.statCard, styles.statCardYouOwe]}
      >
        <View style={styles.badgeRow}>
          <View style={[styles.arrowBadge, { backgroundColor: Colors.brickLight }]}>
            <ArrowDownLeft size={12} color={Colors.brick} strokeWidth={2.6} />
          </View>
          <Text style={[styles.badgeText, { color: Colors.brick }]}>PAYABLE</Text>
        </View>
        <Text style={[styles.statRowAmount, { color: Colors.brick }]}>
          {youOwe > 0 ? `−₹${youOwe.toLocaleString()}` : `₹0`}
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
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardOwedToYou: {
    backgroundColor: '#F8FAF8',
    borderColor: 'rgba(62, 107, 92, 0.35)',
  },
  statCardYouOwe: {
    backgroundColor: '#FAF8F8',
    borderColor: 'rgba(180, 91, 69, 0.25)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  arrowBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  statRowAmount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 22,
    letterSpacing: -0.01,
  },
  statRowLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
});
