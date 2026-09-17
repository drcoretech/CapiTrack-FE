import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/translations';

export const PersonDetailModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const selectedPersonId = useAppStore((state) => state.selectedPersonId);
  const contacts = useAppStore((state) => state.contacts);
  const closeModal = useAppStore((state) => state.closeModal);
  const openModal = useAppStore((state) => state.openModal);
  const settlePerson = useAppStore((state) => state.settlePerson);
  const { t } = useTranslation();

  const isVisible = activeModal === 'person_detail';
  const person = contacts.find((c) => c.id === selectedPersonId);

  if (!person) return null;

  const isOwed = person.netBalance > 0;
  const isSettled = person.netBalance === 0;

  const handleSettle = () => {
    settlePerson(person.id);
  };

  const handleAddTxn = () => {
    openModal('add_ledger', person.id);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={closeModal} style={styles.closeBtn}>
            <X size={20} color={Colors.inkSoft} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Person Hero */}
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{person.initial}</Text>
            </View>
            <Text style={styles.personName}>{person.name}</Text>
            <Text
              style={[
                styles.balanceText,
                isOwed ? styles.balanceOwed : styles.balanceOwe,
                isSettled && styles.balanceSettled,
              ]}
            >
              {isOwed
                ? `${t('owesYouText')} ₹${person.netBalance.toLocaleString()}`
                : isSettled
                ? t('allSettledUp')
                : `${t('youOweText')} ₹${Math.abs(person.netBalance).toLocaleString()}`}
            </Text>
          </View>

          {/* Transactions list */}
          <View style={styles.txnSection}>
            <Text style={styles.sectionHeader}>{t('transactionHistory')}</Text>
            {person.transactions.length === 0 ? (
              <Text style={styles.emptyText}>{t('noEntriesYet')}</Text>
            ) : (
              person.transactions.map((txn) => (
                <View key={txn.id} style={styles.txnRow}>
                  <View>
                    <Text style={styles.txnNote}>{txn.note}</Text>
                    <Text style={styles.txnDate}>{txn.date === 'Today' ? t('dayToday') : txn.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.txnAmount,
                      txn.direction === 'LENT'
                        ? { color: Colors.moss }
                        : txn.direction === 'BORROWED'
                        ? { color: Colors.brick }
                        : { color: Colors.inkSoft },
                    ]}
                  >
                    {txn.direction === 'LENT'
                      ? `+₹${txn.amount}`
                      : txn.direction === 'BORROWED'
                      ? `-₹${txn.amount}`
                      : `₹${txn.amount} (${t('statusSettled')})`}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.btnRow}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleAddTxn} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>{t('addTxn')}</Text>
            </TouchableOpacity>

            {!isSettled && (
              <TouchableOpacity activeOpacity={0.88} onPress={handleSettle} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>{t('markSettled')}</Text>
              </TouchableOpacity>
            )}
          </View>
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
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 28,
    color: Colors.moss,
  },
  personName: {
    fontFamily: Fonts.serifMedium,
    fontSize: 22,
    color: Colors.ink,
    marginTop: 4,
  },
  balanceText: {
    fontFamily: Fonts.serifMedium,
    fontSize: 20,
  },
  balanceOwed: {
    color: Colors.moss,
  },
  balanceOwe: {
    color: Colors.brick,
  },
  balanceSettled: {
    color: Colors.inkSoft,
  },
  txnSection: {
    marginTop: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    fontFamily: Fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    color: Colors.inkSoft,
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 12,
    color: Colors.inkSoft,
    textAlign: 'center',
    paddingVertical: 12,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  txnNote: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  txnDate: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10,
    color: Colors.inkSoft,
    marginTop: 2,
  },
  txnAmount: {
    fontFamily: Fonts.monoMedium,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    paddingTop: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  secondaryBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: Colors.inkSoft,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.moss,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
});
