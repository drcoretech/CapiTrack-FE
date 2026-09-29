import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

            {/* Quick Add from Khata Contacts */}
            {contacts.length > 0 && (
              <View style={styles.khataQuickAddSection}>
                <Text style={styles.subLabel}>OR ADD FROM KHATA CONTACTS:</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mist,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 17,
    color: Colors.ink,
  },
  headerSubtitle: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    color: Colors.inkSoft,
    letterSpacing: 0.4,
  },
  content: {
    padding: 18,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  labelHelper: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.mossDark,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Colors.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: Colors.moss,
    borderColor: Colors.moss,
  },
  categoryText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.moss,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  addBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  khataQuickAddSection: {
    gap: 6,
  },
  subLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: Colors.inkSoft,
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  contactChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  contactChipDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  contactChipText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  membersSection: {
    gap: 8,
    marginTop: 4,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: Colors.line,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 16,
    color: Colors.ink,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  cTrackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  cTrackBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9.5,
    color: Colors.mossDark,
    fontWeight: '700',
  },
  memberSub: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  memberRoleText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11.5,
    color: Colors.moss,
  },
  adminBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontFamily: Fonts.monoMedium,
    fontSize: 9,
    color: Colors.mossDark,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 6,
  },
  infoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
  },
  infoNoticeText: {
    flex: 1,
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: '#B45309',
    lineHeight: 16.5,
  },
  errorText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.brick,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 14,
  },
  submitBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
