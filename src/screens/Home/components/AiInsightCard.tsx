import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, ArrowRight } from 'lucide-react-native';
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
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Sparkles size={11} color="#C4DDD2" style={{ marginRight: 4 }} />
          <Text style={styles.insightEyebrow}>{t('insightEyebrow')}</Text>
        </View>
      </View>

      <Text style={styles.insightText}>{insightText}</Text>

      <AnimatedPressable
        scaleTo={0.95}
        onPress={onSeeBreakdown}
        style={styles.insightBtn}
      >
        <Text style={styles.insightBtnText}>{t('seeBreakdown')}</Text>
        <ArrowRight size={12} color={Colors.moss} strokeWidth={2.4} style={{ marginLeft: 4 }} />
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  insightCard: {
    backgroundColor: Colors.moss,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  insightEyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    letterSpacing: 1.1,
    color: '#D5E9E0',
    textTransform: 'uppercase',
  },
  insightText: {
    fontFamily: Fonts.serifMedium,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginVertical: 6,
    letterSpacing: -0.01,
  },
  insightBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  insightBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11.5,
    color: Colors.moss,
  },
});
