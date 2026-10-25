import { StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Fonts } from "../theme/typography";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 19,
    color: Colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  presetChipActive: {
    backgroundColor: Colors.mossLight,
    borderColor: Colors.moss,
  },
  presetText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  presetTextActive: {
    color: Colors.moss,
    fontFamily: Fonts.sansSemiBold,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 16,
    color: Colors.ink,
  },
  navArrow: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowDisabled: {
    opacity: 0.35,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 40,
    textAlign: 'center',
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  dayCellEmpty: {
    width: 40,
    height: 38,
  },
  dayCell: {
    width: 40,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.moss,
  },
  dayCellSelected: {
    backgroundColor: Colors.moss,
  },
  dayCellFuture: {
    opacity: 0.25,
  },
  dayText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  dayTextToday: {
    color: Colors.moss,
    fontFamily: Fonts.sansBold,
  },
  dayTextSelected: {
    color: '#ffffff',
    fontFamily: Fonts.sansBold,
  },
  dayTextFuture: {
    color: Colors.inkSoft,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  selectedLabel: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  selectedDateHighlight: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.ink,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.moss,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  confirmBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: '#ffffff',
  },
});
