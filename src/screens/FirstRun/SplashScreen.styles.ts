import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/typography";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0E1411', // Deep Obsidian Emerald
  },
  touchArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientAura: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_WIDTH * 0.95,
    borderRadius: (SCREEN_WIDTH * 0.95) / 2,
    backgroundColor: 'rgba(62, 107, 92, 0.22)',
    top: SCREEN_HEIGHT * 0.22,
  },
  content: {
    alignItems: 'center',
    gap: 20,
    zIndex: 2,
  },
  markWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  outerHalo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 42,
    backgroundColor: 'rgba(62, 107, 92, 0.22)',
  },
  innerGlassRing: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  markImage: {
    width: 92,
    height: 92,
    borderRadius: 26,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    fontFamily: Fonts.serifSemiBold,
    color: '#FFFFFF',
    fontSize: 34,
    letterSpacing: -0.02,
  },
  taglineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  taglineLine: {
    width: 16,
    height: 1,
    backgroundColor: 'rgba(143, 168, 156, 0.35)',
  },
  tag: {
    fontFamily: Fonts.monoMedium,
    color: '#8FA89C',
    fontSize: 10,
    letterSpacing: 2.2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 100,
    marginTop: 8,
  },
  trustBadgeIcon: {
    fontSize: 11,
  },
  trustBadgeText: {
    fontFamily: Fonts.monoRegular,
    color: '#B6CBC2',
    fontSize: 10.5,
    letterSpacing: 0.4,
  },
  promptContainer: {
    position: 'absolute',
    bottom: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tapPrompt: {
    fontFamily: Fonts.sansRegular,
    color: '#7D958A',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  promptChevron: {
    fontFamily: Fonts.monoMedium,
    color: '#7D958A',
    fontSize: 14,
  },
});
