import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Users, Sparkles, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { AnimatedPressable } from '../../components/AnimatedPressable';

export const JoinGroupModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const joinGroupByCode = useAppStore((state) => state.joinGroupByCode);

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isVisible = activeModal === 'join_group';

  if (!isVisible) return null;

  const handleJoin = async () => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a 6-character Group Code');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await joinGroupByCode(cleanCode);
      if (res.success) {
        closeModal();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error joining group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={closeModal} style={styles.iconBtn}>
            <X size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join Split Group</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconHero}>
            <Users size={32} color={Colors.moss} />
          </View>

          <Text style={styles.title}>Enter Group Code</Text>
          <Text style={styles.subtitle}>
            Ask your friend for their 6-digit CapiTrack group code (e.g. CAP-402) to join their group and sync bills automatically.
          </Text>

          <TextInput
            style={styles.codeInput}
            placeholder="e.g. CAP-402"
            placeholderTextColor={Colors.inkSoft}
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase());
              if (errorMsg) setErrorMsg('');
            }}
            autoCapitalize="characters"
            maxLength={10}
            autoFocus
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.infoNoticeBox}>
            <Sparkles size={14} color={Colors.mossDark} style={{ marginRight: 8 }} />
            <Text style={styles.infoNoticeText}>
              All group expenses and settlements are shared in real-time between group members.
            </Text>
          </View>

          <AnimatedPressable
            scaleTo={0.97}
            onPress={handleJoin}
            disabled={!code.trim() || isSubmitting}
            style={[styles.joinBtn, (!code.trim() || isSubmitting) && { opacity: 0.6 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.joinBtnText}>Join Group</Text>
                <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </>
            )}
          </AnimatedPressable>
        </View>
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
  headerTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 17,
    color: Colors.ink,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  iconHero: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  title: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13.5,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.moss,
    paddingVertical: 14,
    fontFamily: Fonts.monoMedium,
    fontSize: 20,
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 10,
  },
  errorText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12.5,
    color: Colors.brick,
    textAlign: 'center',
  },
  infoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 14,
    padding: 12,
    width: '100%',
  },
  infoNoticeText: {
    flex: 1,
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.mossDark,
    lineHeight: 16.5,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.moss,
    borderRadius: 16,
    width: '100%',
    paddingVertical: 15,
    marginTop: 8,
  },
  joinBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
