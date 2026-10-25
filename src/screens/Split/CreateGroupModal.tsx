import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Users,
  Plus,
  Trash2,
  Sparkles,
  Plane,
  Home,
  Utensils,
  Briefcase,
  Search,
  CheckCircle2,
  Gift,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { styles } from './CreateGroupModal.styles';
import { useAppStore } from '../../store/useAppStore';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { api } from '../../services/api';

const GROUP_CATEGORIES = [
  { id: 'trip', label: 'Trip', icon: Plane },
  { id: 'home', label: 'Flat / Home', icon: Home },
  { id: 'food', label: 'Food / Outing', icon: Utensils },
  { id: 'project', label: 'Work', icon: Briefcase },
  { id: 'other', label: 'Other', icon: Users },
];

export const CreateGroupModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const createGroup = useAppStore((state) => state.createGroup);
  const contacts = useAppStore((state) => state.contacts);
  const userName = useAppStore((state) => state.userName);

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('trip');
  const [members, setMembers] = useState<Array<{ name: string; phone?: string; capitrackId?: string; isAppUser?: boolean }>>([]);
  const [memberInput, setMemberInput] = useState('');
  const [isSearchingMember, setIsSearchingMember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isVisible = activeModal === 'create_group';

  if (!isVisible) return null;

  const handleSearchAndAdd = async () => {
    const trimmed = memberInput.trim();
    if (!trimmed) return;

    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase() || (m.capitrackId && m.capitrackId.toLowerCase() === trimmed.replace(/^@/, '').toLowerCase()))) {
      setErrorMsg('Member already added');
      return;
    }

    setErrorMsg('');
    setIsSearchingMember(true);

    try {
      const res = await api.checkMember(trimmed);
      if (res?.success && res.exists && res.user) {
        setMembers((prev) => [
          ...prev,
          {
            name: res.user!.name,
            phone: res.user!.phone,
            capitrackId: res.user!.capitrackId,
            isAppUser: true,
          },
        ]);
      } else {
        // Add as offline / guest member
        setMembers((prev) => [
          ...prev,
          {
            name: trimmed.replace(/^@/, ''),
            isAppUser: false,
          },
        ]);
      }
      setMemberInput('');
    } catch {
      setMembers((prev) => [
        ...prev,
        {
          name: trimmed.replace(/^@/, ''),
          isAppUser: false,
        },
      ]);
      setMemberInput('');
    } finally {
      setIsSearchingMember(false);
    }
  };

  const handleAddKhataContact = (contactName: string) => {
    if (members.some((m) => m.name.toLowerCase() === contactName.toLowerCase())) return;
    setMembers((prev) => [...prev, { name: contactName, isAppUser: false }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a group name');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await createGroup(name.trim(), selectedCategory, members);
      closeModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={closeModal} style={styles.iconBtn}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Create Split Group</Text>
              <Text style={styles.headerSubtitle}>Google Pay Style Group Splits</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {/* Group Name Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>GROUP NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Goa Trip 2026, Flat 402, Office Lunch"
                placeholderTextColor={Colors.inkSoft}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
              />
            </View>

            {/* Category Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                {GROUP_CATEGORIES.map((cat) => {
                  const IconComponent = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedCategory(cat.id)}
                      style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                    >
                      <IconComponent size={14} color={isSelected ? '#FFFFFF' : Colors.inkSoft} />
                      <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Add Members by Phone or CapiTrack ID */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>ADD MEMBERS</Text>
                <Text style={styles.labelHelper}>CapiTrack ID or Phone</Text>
              </View>

              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="e.g. @suresh or 9876543210"
                  placeholderTextColor={Colors.inkSoft}
                  value={memberInput}
                  onChangeText={setMemberInput}
                  onSubmitEditing={handleSearchAndAdd}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSearchAndAdd}
                  disabled={!memberInput.trim() || isSearchingMember}
                  style={[styles.addBtn, !memberInput.trim() && { opacity: 0.5 }]}
                >
                  {isSearchingMember ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.addBtnText}>Add</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Add from Credit Ledger Contacts */}
            {contacts.length > 0 && (
              <View style={styles.khataQuickAddSection}>
                <Text style={styles.subLabel}>OR ADD FROM CREDIT LEDGER:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {contacts.slice(0, 10).map((c) => {
                    const alreadyAdded = members.some((m) => m.name.toLowerCase() === c.name.toLowerCase());
                    return (
                      <TouchableOpacity
                        key={c.id}
                        activeOpacity={0.7}
                        onPress={() => handleAddKhataContact(c.name)}
                        disabled={alreadyAdded}
                        style={[styles.contactChip, alreadyAdded && styles.contactChipDisabled]}
                      >
                        <Text style={[styles.contactChipText, alreadyAdded && { color: Colors.inkSoft }]}>
                          {c.name} {alreadyAdded ? '✓' : '+'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Members List */}
            <View style={styles.membersSection}>
              <Text style={styles.label}>MEMBERS ({members.length + 1})</Text>

              {/* Creator Card */}
              <View style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{(userName || 'Y')[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{userName || 'You'} (You)</Text>
                  <Text style={styles.memberRoleText}>Group Admin</Text>
                </View>
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              </View>

              {/* Added Members */}
              {members.map((m, idx) => (
                <View key={idx} style={styles.memberCard}>
                  <View style={[styles.memberAvatar, m.isAppUser && { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.memberAvatarText, m.isAppUser && { color: Colors.mossDark }]}>
                      {m.name[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      {m.isAppUser && (
                        <View style={styles.cTrackBadge}>
                          <CheckCircle2 size={11} color={Colors.mossDark} style={{ marginRight: 3 }} />
                          <Text style={styles.cTrackBadgeText}>CapiTrack</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberSub}>
                      {m.capitrackId ? `@${m.capitrackId}` : m.phone || 'Guest Friend'}
                    </Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => handleRemoveMember(idx)} style={styles.removeBtn}>
                    <Trash2 size={16} color={Colors.brick} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Info Notice Box */}
            <View style={styles.infoNoticeBox}>
              <Sparkles size={14} color={Colors.amber} style={{ marginRight: 8 }} />
              <Text style={styles.infoNoticeText}>
                A 6-digit Group Code will be generated. You can invite other friends to join this group anytime via WhatsApp!
              </Text>
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </ScrollView>

          {/* Footer Submit */}
          <View style={styles.footer}>
            <AnimatedPressable
              scaleTo={0.97}
              onPress={handleSubmit}
              disabled={isSubmitting || !name.trim()}
              style={[styles.submitBtn, (!name.trim() || isSubmitting) && { opacity: 0.6 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Users size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Create Group</Text>
                </>
              )}
            </AnimatedPressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

