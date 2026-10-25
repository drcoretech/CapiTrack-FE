import React, { useState } from 'react';
import {
  View,
  Text,
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
import { styles } from './ManageCategoriesModal.styles';

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

