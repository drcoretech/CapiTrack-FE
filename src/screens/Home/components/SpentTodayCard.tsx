import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';

interface SpentTodayCardProps {
  spentToday: number;
  deltaText: string;
}

export const SpentTodayCard: React.FC<SpentTodayCardProps> = ({ spentToday, deltaText }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.bigStatContainer}>
      <Text style={styles.statLabel}>{t('spentToday')}</Text>
      <Text style={styles.statNum}>₹{spentToday.toLocaleString()}</Text>
      <Text style={styles.statDelta}>{deltaText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bigStatContainer: {
    marginTop: 4,
  },
  statLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  statNum: {
    fontFamily: Fonts.serifMedium,
    fontSize: 42,
    color: Colors.ink,
    lineHeight: 48,
    marginTop: 2,
  },
  statDelta: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11.5,
    color: Colors.brick,
    marginTop: 2,
  },
});
