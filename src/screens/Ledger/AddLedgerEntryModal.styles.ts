import { StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/typography";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  avoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
  },
  eyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 24,
    color: Colors.ink,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    gap: 16,
  },
  fieldContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fieldLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9,
    color: Colors.inkSoft,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  textInput: {
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLentSelected: {
    backgroundColor: Colors.moss,
  },
  toggleBorrowedSelected: {
    backgroundColor: Colors.brick,
  },
  toggleBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  toggleBtnTextSelected: {
    color: '#FFFFFF',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  curLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 12,
    color: Colors.inkSoft,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  currencySymbol: {
    fontFamily: Fonts.serifMedium,
    fontSize: 32,
    color: Colors.inkSoft,
    marginRight: 4,
  },
  amountInput: {
    fontFamily: Fonts.serifMedium,
    fontSize: 48,
    color: Colors.ink,
    textAlign: 'center',
    minWidth: 140,
    marginTop: 2,
  },
  quickAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  quickAmountChip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickAmountText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.ink,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
