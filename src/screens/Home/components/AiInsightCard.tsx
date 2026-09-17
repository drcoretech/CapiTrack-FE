import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';

interface AiInsightCardProps {
  insightText: string;
  onSeeBreakdown: () => void;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({ insightText, onSeeBreakdown }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightEyebrow}>{t('insightEyebrow')}</Text>
      <Text style={styles.insightText}>{insightText}</Text>
      <AnimatedPressable
        scaleTo={0.94}
        onPress={onSeeBreakdown}
        style={styles.insightBtn}
      >
        <Text style={styles.insightBtnText}>{t('seeBreakdown')}</Text>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  insightCard: {
    backgroundColor: Colors.moss,
    borderRadius: 18,
    padding: 16,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  insightEyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#B9CFC6',
    textTransform: 'uppercase',
  },
  insightText: {
    fontFamily: Fonts.serifMedium,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 21,
    marginVertical: 8,
  },
  insightBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: 100,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  insightBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11.5,
    color: Colors.moss,
  },
});
