import { StyleSheet } from "react-native";
import { Colors } from "../../../theme/colors";
import { Fonts } from "../../../theme/typography";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    color: Colors.ink,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  numInput: {
    fontFamily: Fonts.monoMedium,
    fontSize: 16,
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  subHint: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  monthSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  monthSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthSelectorText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  changeText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.moss,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
  },
  checkboxTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: Colors.ink,
  },
  checkboxSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    lineHeight: 16,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.card,
  },
  saveBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
