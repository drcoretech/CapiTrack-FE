import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { X, QrCode } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { useAppStore } from '../../store/useAppStore';
import { getUPIQRCodeUrl } from '../../services/upiPayment';

export const UPIQRModal: React.FC = () => {
  const activeModal = useAppStore((state) => state.activeModal);
  const qrModalData = useAppStore((state) => state.qrModalData);
  const closeModal = useAppStore((state) => state.closeModal);

  const isVisible = activeModal === 'upi_qr' && qrModalData !== null;

  if (!isVisible || !qrModalData) return null;

  const { upiId, name, amount, note } = qrModalData;
  const qrUrl = getUPIQRCodeUrl({ upiId, name, amount, note }, 240);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Close Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={closeModal}
                style={styles.closeBtn}
              >
                <X size={18} color={Colors.inkSoft} />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.iconCircle}>
                <QrCode size={24} color={Colors.moss} />
              </View>

              <Text style={styles.title}>Scan to Pay via UPI</Text>
              <Text style={styles.amount}>₹{amount.toLocaleString()}</Text>
              <Text style={styles.subtitle}>Paying {name}</Text>

              {/* QR Image Container */}
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>

              {/* UPI ID Pill */}
              <View style={styles.upiPill}>
                <Text style={styles.upiPillLabel}>UPI ID:</Text>
                <Text style={styles.upiPillValue} numberOfLines={1}>
                  {upiId}
                </Text>
              </View>

              {/* App badges footer */}
              <Text style={styles.footerAppsText}>
                Works with Google Pay • PhonePe • Paytm • CRED
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={closeModal}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.mossLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 18,
    color: Colors.ink,
    marginBottom: 4,
  },
  amount: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 28,
    color: Colors.moss,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Fonts.sansRegular,
    fontSize: 13,
    color: Colors.inkSoft,
    marginBottom: 16,
  },
  qrContainer: {
    width: 220,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  upiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mist,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 14,
  },
  upiPillLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: Colors.inkSoft,
    marginRight: 6,
  },
  upiPillValue: {
    fontFamily: Fonts.monoMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  footerAppsText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.inkSoft,
    textAlign: 'center',
    marginBottom: 16,
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
