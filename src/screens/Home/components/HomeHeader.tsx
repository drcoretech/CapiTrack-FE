import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation, getGreetingKey } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';

interface HomeHeaderProps {
  userName: string;
  onPressProfile: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ userName, onPressProfile }) => {
  const { t } = useTranslation();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPressProfile}>
        <Text style={styles.eyebrow}>{t(getGreetingKey())}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <Text style={styles.date}>{todayFormatted}</Text>
      </TouchableOpacity>

      <AnimatedPressable
        scaleTo={0.9}
        onPress={onPressProfile}
        style={styles.settingsBadge}
      >
        <Settings size={20} color={Colors.ink} />
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
  settingsBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
});
