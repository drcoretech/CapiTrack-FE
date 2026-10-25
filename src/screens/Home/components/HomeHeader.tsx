import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Settings } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { useTranslation, getGreetingKey } from '../../../i18n/translations';
import { AnimatedPressable } from '../../../components/AnimatedPressable';

interface HomeHeaderProps {
  userName: string;
  profilePicture?: string;
  onPressProfile: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ userName, profilePicture, onPressProfile }) => {
  const { t } = useTranslation();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPressProfile}
        style={styles.profileInfoWrapper}
      >
        <Text style={styles.eyebrow}>{t(getGreetingKey())}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
            {userName}
          </Text>
        </View>
        <Text style={styles.date}>{todayFormatted}</Text>
      </TouchableOpacity>

      <AnimatedPressable
        scaleTo={0.9}
        onPress={onPressProfile}
        style={[styles.settingsBadge, !!profilePicture && styles.settingsBadgeWithAvatar]}
      >
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.headerAvatarImg} />
        ) : (
          <Settings size={20} color={Colors.ink} />
        )}
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  profileInfoWrapper: {
    flex: 1,
    marginRight: 14,
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
    flexShrink: 1,
  },
  userName: {
    fontFamily: Fonts.serifMedium,
    fontSize: 24,
    color: Colors.ink,
    marginTop: 2,
    flexShrink: 1,
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
    flexShrink: 0,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  settingsBadgeWithAvatar: {
    padding: 2,
    borderColor: Colors.moss,
    overflow: 'hidden',
  },
  headerAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
});
