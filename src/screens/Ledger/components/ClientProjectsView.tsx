import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { ClientProject } from '../../../types';
import { AnimatedPressable } from '../../../components/AnimatedPressable';
import { Plus, ChevronRight, Briefcase } from 'lucide-react-native';

interface ClientProjectsViewProps {
  projects: ClientProject[];
  onOpenProject: (projectId: string) => void;
  onAddPayment: (projectId: string) => void;
  onNewProject: () => void;
}

export const ClientProjectsView: React.FC<ClientProjectsViewProps> = ({
  projects,
  onOpenProject,
  onAddPayment,
  onNewProject,
}) => {
  const totalInvoiced = projects.reduce((sum, p) => sum + p.totalValue, 0);
  const totalReceived = projects.reduce((sum, p) => {
    const paid = p.payments.reduce((pSum, pay) => pSum + pay.amount, 0);
    return sum + paid;
  }, 0);
  const totalPending = Math.max(0, totalInvoiced - totalReceived);

  return (
    <View style={styles.container}>
      {/* Summary Metrics Row */}
      <View style={styles.summaryGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNum}>₹{totalInvoiced.toLocaleString()}</Text>
          <Text style={styles.metricLbl}>TOTAL INVOICED</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricNum, { color: Colors.moss }]}>₹{totalReceived.toLocaleString()}</Text>
          <Text style={styles.metricLbl}>RECEIVED</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricNum, { color: totalPending > 0 ? Colors.brick : Colors.moss }]}>
            ₹{totalPending.toLocaleString()}
          </Text>
          <Text style={styles.metricLbl}>PENDING DUE</Text>
        </View>
      </View>

      {/* Projects List Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>ACTIVE CONTRACTS ({projects.length})</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onNewProject} style={styles.newProjectBtn}>
          <Plus size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.newProjectBtnText}>New Project</Text>
        </TouchableOpacity>
      </View>

      {/* Project Cards */}
      {projects.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Briefcase size={28} color={Colors.moss} />
          </View>
          <Text style={styles.emptyTitle}>No Client Projects Yet</Text>
          <Text style={styles.emptySub}>
            Track website development contracts, deal totals, milestone payments, and pending dues.
          </Text>
          <TouchableOpacity activeOpacity={0.8} onPress={onNewProject} style={styles.emptyActionBtn}>
            <Text style={styles.emptyActionBtnText}>+ Add First Client Project</Text>
          </TouchableOpacity>
        </View>
      ) : (
        projects.map((project) => {
          const paidAmount = project.payments.reduce((sum, p) => sum + p.amount, 0);
          const pendingAmount = Math.max(0, project.totalValue - paidAmount);
          const pctPaid = project.totalValue > 0 ? Math.min(100, Math.round((paidAmount / project.totalValue) * 100)) : 100;
          const isCompleted = pendingAmount === 0;

          return (
            <AnimatedPressable
              key={project.id}
              scaleTo={0.97}
              onPress={() => onOpenProject(project.id)}
              style={styles.projectCard}
            >
              {/* Top Row: Client & Status */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.clientName}>{project.clientName}</Text>
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {project.projectTitle}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isCompleted ? styles.statusBadgeCompleted : styles.statusBadgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isCompleted ? styles.statusTextCompleted : styles.statusTextPending,
                    ]}
                  >
                    {isCompleted ? 'Fully Paid ✅' : `₹${pendingAmount.toLocaleString()} Due ⏳`}
                  </Text>
                </View>
              </View>

              {/* Deal Numbers Bar */}
              <View style={styles.dealRow}>
                <View>
                  <Text style={styles.dealLabel}>DEAL VALUE</Text>
                  <Text style={styles.dealValue}>₹{project.totalValue.toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.dealLabel}>RECEIVED</Text>
                  <Text style={[styles.dealValue, { color: Colors.moss }]}>₹{paidAmount.toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.dealLabel}>PENDING</Text>
                  <Text style={[styles.dealValue, { color: isCompleted ? Colors.moss : Colors.brick }]}>
                    ₹{pendingAmount.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${pctPaid}%`,
                      backgroundColor: isCompleted ? Colors.moss : Colors.amber,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressInfoRow}>
                <Text style={styles.progressInfoText}>{pctPaid}% Collected</Text>
                <Text style={styles.progressInfoText}>{project.payments.length} Payment(s)</Text>
              </View>

              {/* Card Actions */}
              <View style={styles.actionRow}>
                {!isCompleted ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onAddPayment(project.id)}
                    style={styles.addPaymentBtn}
                  >
                    <Plus size={13} color={Colors.moss} style={{ marginRight: 4 }} />
                    <Text style={styles.addPaymentBtnText}>Record Milestone Payment</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.settledRow}>
                    <Text style={styles.settledText}>Project Completed & Settled ✅</Text>
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onOpenProject(project.id)}
                  style={styles.detailsBtn}
                >
                  <ChevronRight size={16} color={Colors.inkSoft} />
                </TouchableOpacity>
              </View>
            </AnimatedPressable>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
  },
  metricNum: {
    fontFamily: Fonts.monoMedium,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 4,
  },
  metricLbl: {
    fontFamily: Fonts.monoMedium,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  newProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.moss,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  newProjectBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: Fonts.serifMedium,
    fontSize: 18,
    color: Colors.ink,
  },
  emptySub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    lineHeight: 18,
    color: Colors.inkSoft,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  emptyActionBtn: {
    backgroundColor: Colors.moss,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  emptyActionBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  projectCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  clientName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  phoneTag: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10,
    color: Colors.inkSoft,
  },
  projectTitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12.5,
    color: Colors.inkSoft,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeCompleted: {
    backgroundColor: Colors.mossLight,
  },
  statusBadgePending: {
    backgroundColor: Colors.amberLight,
  },
  statusBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
  },
  statusTextCompleted: {
    color: Colors.mossDark,
  },
  statusTextPending: {
    color: Colors.amber,
  },
  dealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.mist,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dealLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 8,
    letterSpacing: 0.6,
    color: Colors.inkSoft,
    marginBottom: 2,
  },
  dealValue: {
    fontFamily: Fonts.monoMedium,
    fontSize: 12.5,
    color: Colors.ink,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.line,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
  },
  progressInfoText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10,
    color: Colors.inkSoft,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  addPaymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.mossLight,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addPaymentBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    color: Colors.mossDark,
  },
  settledRow: {
    flex: 1,
  },
  settledText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: Colors.moss,
  },
  detailsBtn: {
    padding: 4,
    marginLeft: 'auto',
  },
});
