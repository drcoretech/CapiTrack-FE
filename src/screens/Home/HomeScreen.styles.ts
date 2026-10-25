import { StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120, // Space for floating bottom nav
    gap: 16,
  },
  quickActionStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -4,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 8,
    gap: 6,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11.5,
    color: Colors.ink,
  },
});
