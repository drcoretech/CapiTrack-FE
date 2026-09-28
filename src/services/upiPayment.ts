import { Linking, Alert, Platform } from 'react-native';

export interface UPIPaymentParams {
  upiId: string;
  name: string;
  amount: number;
  note?: string;
}

/**
 * Builds standard NPCI UPI Intent URI supported by Google Pay, PhonePe, Paytm, BHIM, CRED
 */
export const buildUPIUrl = ({ upiId, name, amount, note }: UPIPaymentParams): string => {
  const cleanUpi = (upiId || '').trim();
  const cleanName = (name || 'Friend').trim();
  const cleanAmount = Number(amount || 0).toFixed(2);
  const cleanNote = (note || 'Split Bill via CapiTrack').trim();

  return `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(cleanName)}&am=${encodeURIComponent(cleanAmount)}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;
};

/**
 * Launches the native UPI Payment Drawer on Android / iOS
 */
export const payViaUPI = async (params: UPIPaymentParams): Promise<boolean> => {
  const { upiId, name, amount } = params;

  if (!upiId || !upiId.includes('@')) {
    Alert.alert(
      'Missing UPI ID',
      `Please provide a valid UPI ID (e.g. mobile@okhdfcbank or ${name.toLowerCase()}@upi) to make direct UPI payments.`
    );
    return false;
  }

  const upiUrl = buildUPIUrl(params);

  try {
    const supported = await Linking.canOpenURL(upiUrl);
    if (supported) {
      await Linking.openURL(upiUrl);
      return true;
    } else {
      // Fallback for Android intent / direct app open
      if (Platform.OS === 'android') {
        try {
          await Linking.openURL(upiUrl);
          return true;
        } catch {}
      }
      Alert.alert(
        'No UPI App Found',
        'Could not find a supported UPI app (Google Pay, PhonePe, Paytm) installed on this device.'
      );
      return false;
    }
  } catch (error: any) {
    console.warn('Failed to open UPI url:', error);
    Alert.alert(
      'Payment Error',
      'Could not launch UPI application. Please verify the UPI ID is correct.'
    );
    return false;
  }
};

/**
 * Share payment reminder via WhatsApp with 1-click UPI pay link
 */
export const shareWhatsAppReminder = async ({
  phone,
  friendName,
  amount,
  billTitle,
  upiId,
  receiverName,
}: {
  phone?: string;
  friendName: string;
  amount: number;
  billTitle: string;
  upiId?: string;
  receiverName: string;
}): Promise<void> => {
  const upiUrl = upiId
    ? buildUPIUrl({
        upiId,
        name: receiverName,
        amount,
        note: `Split: ${billTitle}`,
      })
    : '';

  let message = `Hey ${friendName}! 👋\n\nYour share for *${billTitle}* is *₹${amount.toLocaleString()}*.\n`;
  if (upiId) {
    message += `\nYou can tap here to pay directly via GPay / PhonePe / UPI:\n${upiUrl}\n\nOr send to UPI ID: *${upiId}*`;
  }
  message += `\n\n— Sent via CapiTrack`;

  const phoneQuery = phone ? `phone=${phone.replace(/[^0-9]/g, '')}&` : '';
  const waUrl = `whatsapp://send?${phoneQuery}text=${encodeURIComponent(message)}`;

  try {
    const supported = await Linking.canOpenURL(waUrl);
    if (supported) {
      await Linking.openURL(waUrl);
    } else {
      // Web WhatsApp fallback
      const webUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.warn('WhatsApp share error:', error);
    Alert.alert('Notice', 'WhatsApp could not be opened.');
  }
};

/**
 * Generates dynamic QR code URL for instant on-screen scanning
 */
export const getUPIQRCodeUrl = (params: UPIPaymentParams, size: number = 240): string => {
  const upiUrl = buildUPIUrl(params);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiUrl)}&margin=10`;
};
