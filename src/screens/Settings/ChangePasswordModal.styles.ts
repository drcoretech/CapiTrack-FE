import { StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/typography";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 20,
    color: Colors.ink,
  },
  subTitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.mossLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.moss,
  },
  successText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.mossDark,
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.brickLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.brick,
  },
  errorText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.brick,
    flex: 1,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    color: Colors.ink,
    height: '100%',
  },
  submitBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
