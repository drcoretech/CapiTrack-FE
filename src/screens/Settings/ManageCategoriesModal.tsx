import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';
import { CategoryIcon } from '../../components/CategoryIcon';

const EMOJI_PRESETS = ['🛍️', '💡', '⛽', '🏠', '📚', '☕', '🎮', '✈️', '🐾', '🎁'];

export const ManageCategoriesModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const categories = useAppStore((state) => state.categories);
  const toggleCategory = useAppStore((state) => state.toggleCategory);
  const addCategory = useAppStore((state) => state.addCategory);
  const { t, getCategoryName } = useTranslation();

  const [newCatName, setNewCatName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_PRESETS[0]);
  const [isAdding, setIsAdding] = useState(false);

  const isVisible = activeModal === 'manage_categories';

  const handleAdd = () => {
    if (newCatName.trim()) {
      addCategory(newCatName.trim(), selectedEmoji);
      setNewCatName('');
      setIsAdding(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoidingView}
        >
          {/* Header */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.eyebrow}>{t('settingsTitle')}</Text>
              <Text style={styles.title}>{t('manageCatTitle')}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
              <X size={20} color={Colors.inkSoft} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>{t('manageCatDesc')}</Text>

            {/* Categories List */}
            <View style={styles.categoryList}>
              {categories.map((cat) => {
                const displayName = getCategoryName(cat.name);
                return (
                  <View key={cat.id} style={styles.catItem}>
                    <View style={styles.catLeft}>
                      <View style={styles.iconCircle}>
                        <CategoryIcon category={cat.name} icon={cat.icon} size={18} color={Colors.moss} />
                      </View>
                      <View>
                        <Text style={styles.catName}>{displayName}</Text>
                        <Text style={styles.catStatus}>
                          {cat.enabled ? t('activeTag') : t('inactiveTag')}
                        </Text>
                      </View>
                    </View>

                    <Switch
                      value={cat.enabled}
                      onValueChange={() => toggleCategory(cat.id)}
                      trackColor={{ false: Colors.line, true: Colors.moss }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                );
              })}
            </View>

            {/* Add Custom Category Form */}
            {isAdding ? (
              <View style={styles.addCard}>
                <Text style={styles.addCardTitle}>{t('addNewCategory')}</Text>

                <TextInput
                  value={newCatName}
                  onChangeText={setNewCatName}
                  placeholder={t('catNamePlaceholder')}
                  placeholderTextColor={Colors.inkSoft}
                  style={styles.input}
                  autoFocus
                />

                <Text style={styles.emojiLabel}>Choose Icon</Text>
                <View style={styles.emojiRow}>
                  {EMOJI_PRESETS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      activeOpacity={0.7}
                      onPress={() => setSelectedEmoji(emoji)}
                      style={[
                        styles.emojiBtn,
                        selectedEmoji === emoji && styles.emojiBtnSelected,
                      ]}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.addActions}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsAdding(false)}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleAdd}
                    style={styles.submitBtn}
                  >
                    <Text style={styles.submitBtnText}>{t('addBtn')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsAdding(true)}
                style={styles.addTriggerBtn}
              >
                <Plus size={18} color={Colors.moss} />
                <Text style={styles.addTriggerText}>{t('addNewCategory')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Done Footer */}
          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.85} onPress={closeModal} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>{t('doneBtn')}</Text>
            </TouchableOpacity>
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
  avoidingView: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
  },
  eyebrow: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.inkSoft,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    color: Colors.ink,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  description: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    lineHeight: 18,
  },
  categoryList: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  catName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  catStatus: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10.5,
    color: Colors.inkSoft,
    marginTop: 1,
  },
  addTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.moss,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
  },
  addTriggerText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: Colors.moss,
  },
  addCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  addCardTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 16,
    color: Colors.ink,
  },
  input: {
    backgroundColor: Colors.mist,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  emojiLabel: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10.5,
    color: Colors.inkSoft,
    textTransform: 'uppercase',
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.mist,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnSelected: {
    borderColor: Colors.moss,
    backgroundColor: Colors.mossLight,
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 18,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkSoft,
  },
  submitBtn: {
    backgroundColor: Colors.moss,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  submitBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: Colors.mist,
  },
  doneBtn: {
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
