import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { ClientProject } from '../../../types';
import { styles } from './FreelanceRevenueView.styles';

export interface FreelanceContractCardProps {
  project: ClientProject;
  currencySymbol: string;
  onOpenProject?: (projectId: string) => void;
}

export const FreelanceContractCard: React.FC<FreelanceContractCardProps> = ({
  project,
  currencySymbol,
  onOpenProject,
}) => {
  const rec = project.payments.reduce((acc, p) => acc + p.amount, 0);
  const due = Math.max(0, project.totalValue - rec);
  const pct = project.totalValue > 0 ? Math.min(100, Math.round((rec / project.totalValue) * 100)) : 0;
  const isCompleted = due === 0 && project.totalValue > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onOpenProject?.(project.id)}
      style={styles.contractItemCard}
    >
      <View style={styles.contractCardTop}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.contractClientName} numberOfLines={1}>
            {project.clientName}
          </Text>
          <Text style={styles.contractProjectTitle} numberOfLines={1}>
            {project.projectTitle}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.contractTotalAmount}>
            {currencySymbol}{project.totalValue.toLocaleString()}
          </Text>
          <View
            style={[
              styles.contractStatusPill,
              isCompleted
                ? styles.pillCompleted
                : rec > 0
                ? styles.pillPending
                : styles.pillInProgress,
            ]}
          >
            <Text
              style={[
                styles.contractStatusText,
                isCompleted
                  ? styles.statusTextCompleted
                  : rec > 0
                  ? styles.statusTextPending
                  : styles.statusTextInProgress,
              ]}
            >
              {isCompleted ? 'Settled' : rec > 0 ? 'Partially Paid' : 'In Progress'}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.contractBarTrack}>
        <View
          style={[
            styles.contractBarFill,
            {
              width: `${pct}%`,
              backgroundColor: isCompleted ? Colors.moss : rec > 0 ? Colors.amber : '#CBD5E1',
            },
          ]}
        />
      </View>

      <View style={styles.contractCardBottom}>
        <Text style={styles.contractCollectedText}>
          Collected: {currencySymbol}{rec.toLocaleString()} ({pct}%)
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            style={[
              styles.contractDueText,
              due === 0 && { color: Colors.moss },
            ]}
          >
            {due > 0 ? `Due: ${currencySymbol}${due.toLocaleString()}` : 'Fully Paid ✅'}
          </Text>
          <View style={styles.contractEditBadge}>
            <Pencil size={11} color={Colors.inkSoft} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
