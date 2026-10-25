import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Fonts } from '../../../theme/typography';
import { ClientProject } from '../../../types';
import { AnimatedPressable } from '../../../components/AnimatedPressable';
import { Plus, ChevronRight, Briefcase, Check, Clock } from 'lucide-react-native';
import { styles } from './ClientProjectsView.styles';

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
                  {isCompleted ? (
                    <Check size={11} color={Colors.moss} strokeWidth={2.8} style={{ marginRight: 4 }} />
                  ) : (
                    <Clock size={11} color={Colors.amber} strokeWidth={2.4} style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isCompleted ? styles.statusTextCompleted : styles.statusTextPending,
                    ]}
                  >
                    {isCompleted ? 'Fully Settled' : `₹${pendingAmount.toLocaleString()} Due`}
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
                    <Check size={13} color={Colors.moss} strokeWidth={2.6} style={{ marginRight: 5 }} />
                    <Text style={styles.settledText}>Contract Fully Paid & Settled</Text>
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

