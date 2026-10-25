import { StyleSheet } from "react-native";
import { Colors } from "../../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  shimmerBox: {
    backgroundColor: Colors.line,
    borderRadius: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  projectCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
    gap: 12,
  },
  projectCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dealBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.mist,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.line,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  shimmerBtn: {
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.line,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 9,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 15,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  personLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.line,
  },
  personDetails: {
    gap: 4,
  },
  personRight: {
    alignItems: 'flex-end',
  },
});
