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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  iconButton: {
    padding: 6,
  },
  topBarTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: Colors.inkSoft,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleLentSelected: {
    backgroundColor: Colors.moss,
  },
  toggleBorrowedSelected: {
    backgroundColor: Colors.brick,
  },
  toggleBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  toggleBtnTextSelected: {
    fontFamily: Fonts.sansSemiBold,
    color: '#FFFFFF',
  },
  amountContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  curLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  amountInput: {
    fontFamily: Fonts.serifMedium,
    fontSize: 32,
    color: Colors.ink,
    marginTop: 4,
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    gap: 12,
    backgroundColor: Colors.mist,
  },
  deleteBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#FADBD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
