import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { ClientProject } from '../../../types';
import { styles } from './ProjectDetailModal.styles';

export interface ProjectOverviewCardProps {
  project: ClientProject;
  totalReceived: number;
  pendingDue: number;
  pctPaid: number;
  isCompleted: boolean;
  showPaymentForm: boolean;
  onTogglePaymentForm: () => void;
}

export const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({
  project,
  totalReceived,
  pendingDue,
  pctPaid,
  isCompleted,
  showPaymentForm,
  onTogglePaymentForm,
}) => {
  return (
    <>
      <View style={styles.overviewCard}>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>DEAL VALUE</Text>
            <Text style={styles.metricValue}>₹{project.totalValue.toLocaleString()}</Text>
          </View>
          <View style={[styles.metricItem, styles.metricBorder]}>
            <Text style={styles.metricLabel}>RECEIVED</Text>
            <Text style={[styles.metricValue, { color: Colors.moss }]}>
              ₹{totalReceived.toLocaleString()}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>PENDING</Text>
            <Text
              style={[
                styles.metricValue,
                { color: isCompleted ? Colors.moss : Colors.brick },
              ]}
            >
              ₹{pendingDue.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
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
          <Text style={styles.progressLabel}>{pctPaid}% Collected</Text>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onTogglePaymentForm}
          style={[
            styles.recordPaymentBtn,
            pendingDue === 0 && { backgroundColor: Colors.card, borderColor: Colors.line },
          ]}
        >
          <Plus size={16} color={pendingDue === 0 ? Colors.ink : '#FFFFFF'} style={{ marginRight: 6 }} />
          <Text
            style={[
              styles.recordPaymentBtnText,
              pendingDue === 0 && { color: Colors.ink },
            ]}
          >
            {showPaymentForm ? 'Hide Payment Form' : 'Record Milestone Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
