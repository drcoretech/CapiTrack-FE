import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation, getGreetingKey } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';

interface HomeHeaderProps {
  userName: string;
  onPressEditName: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ userName, onPressEditName }) => {
  const { t } = useTranslation();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPressEditName}>
        <Text style={styles.eyebrow}>{t(getGreetingKey())}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <Text style={styles.date}>{todayFormatted}</Text>
      </TouchableOpacity>

      <AnimatedPressable
        scaleTo={0.9}
        onPress={onPressEditName}
        style={styles.avatarBadge}
      >
        <Text style={styles.avatarText}>{userName ? userName[0].toUpperCase() : 'U'}</Text>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 4,
  },
  eyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontFamily: Fonts.serifMedium,
    fontSize: 24,
    color: Colors.ink,
    marginTop: 2,
  },
  date: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  avatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.serifMedium,
    fontSize: 16,
    color: Colors.card,
  },
});
