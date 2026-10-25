import { StyleSheet } from "react-native";
import { Colors } from "../../../theme/colors";
import { Fonts } from "../../../theme/typography";

export const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartSectionTitle: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.mist,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  segmentBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  segmentBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10.5,
    color: Colors.inkSoft,
  },
  segmentBtnTextActive: {
    color: Colors.ink,
    fontFamily: Fonts.sansSemiBold,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 36,
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  barFillStandard: {
    backgroundColor: Colors.moss,
  },
  barFillAmber: {
    backgroundColor: Colors.amber,
  },
  barFillSelected: {
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  barFillEmpty: {
    backgroundColor: Colors.line,
  },
  barValueText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 8.5,
    color: '#FFFFFF',
  },
  barLabel: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 8,
  },
  barLabelSelected: {
    fontFamily: Fonts.monoMedium,
    color: Colors.ink,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.moss,
    marginTop: 3,
  },
  weekRangeSubText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 8.5,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  trendControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  trendPeriodSub: {
    fontFamily: Fonts.monoRegular,
    fontSize: 11,
    color: Colors.inkSoft,
  },
  trendYearSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mist,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  yearArrowBtn: {
    padding: 4,
  },
  trendYearLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  halfYearTabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.mist,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  halfYearTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  halfYearTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  halfYearTabText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
  },
  halfYearTabTextActive: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.ink,
  },
});
