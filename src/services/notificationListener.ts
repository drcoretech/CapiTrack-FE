import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNAndroidNotificationListener from 'react-native-android-notification-listener';
import { parseNotification } from './notificationParser';
import { useAppStore } from '../store/useAppStore';

export const PENDING_NUDGE_STORAGE_KEY = '@capitrack_pending_nudge';

class NotificationListenerService {
  private isListening = false;

  /**
   * Initialize listener and rehydrate any pending nudge from AsyncStorage.
   */
  public async init() {
    if (Platform.OS !== 'android') {
      return;
    }

    this.start();

    // Check if background headless task recorded a pending nudge while app was closed
    try {
      const cached = await AsyncStorage.getItem(PENDING_NUDGE_STORAGE_KEY);
      if (cached) {
        const nudge = JSON.parse(cached);
        const state = useAppStore.getState();
        if (state.autoCaptureEnabled && !state.pendingNudge) {
          state.triggerNudge(nudge);
        }
      }
    } catch {}
  }

  public start() {
    this.isListening = true;
  }

  public stop() {
    this.isListening = false;
  }

  /**
   * Check if user has granted Notification Listener Permission.
   */
  public async checkPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      if (RNAndroidNotificationListener && typeof RNAndroidNotificationListener.getPermissionStatus === 'function') {
        const status = await RNAndroidNotificationListener.getPermissionStatus();
        return status === 'authorized';
      }
    } catch (e) {
      console.warn('Error checking notification permission:', e);
    }
    return false;
  }

  /**
   * Directly opens the Android "Device & app notifications" / Notification Listener settings
   * screen where CapiTrack is listed with a toggle to grant reading permission.
   */
  public async openSettings(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Android Only',
        'Notification reading is an Android-only feature due to operating system privacy controls.'
      );
      return false;
    }

    try {
      if (RNAndroidNotificationListener && typeof RNAndroidNotificationListener.requestPermission === 'function') {
        RNAndroidNotificationListener.requestPermission();
        return true;
      }
    } catch (e) {
      console.warn('Could not request permission via native module:', e);
    }

    // Fallbacks
    try {
      await Linking.sendIntent('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
      return true;
    } catch {
      try {
        await Linking.openSettings();
        return true;
      } catch (err) {
        console.warn('Could not open notification settings:', err);
        return false;
      }
    }
  }

  /**
   * Process an incoming notification event (foreground or headless).
   * STRICT SETTINGS GATING: Exits immediately if autoCaptureEnabled is false.
   */
  public async handleRawNotification(payload: { title: string; text: string; package_name?: string }) {
    const state = useAppStore.getState();
    const storedAutoCapture = await AsyncStorage.getItem('@capitrack_auto_capture_enabled');
    const isEnabled = state.autoCaptureEnabled || storedAutoCapture === 'true';

    if (!isEnabled) {
      return;
    }

    const parsed = parseNotification(
      payload.title || '',
      payload.text || '',
      payload.package_name || ''
    );

    if (!parsed || !parsed.isPayment || parsed.amount <= 0) {
      return;
    }

    const nudgeData = {
      amount: parsed.amount,
      sourceApp: parsed.sourceApp,
      merchant: parsed.merchant,
      suggestedCategory: parsed.suggestedCategory,
      timestamp: 'Just now',
    };

    // Cache to AsyncStorage so app displays it when opened
    try {
      await AsyncStorage.setItem(PENDING_NUDGE_STORAGE_KEY, JSON.stringify(nudgeData));
    } catch {}

    // Trigger the auto-capture nudge bottom sheet
    state.triggerNudge(nudgeData);
  }

  /**
   * Helper to simulate a payment notification for preview and testing.
   */
  public simulatePayment(type: 'phonepe' | 'gpay' | 'paytm' | 'custom', customAmount?: number, customMerchant?: string) {
    const state = useAppStore.getState();
    if (!state.autoCaptureEnabled) {
      Alert.alert(
        'Auto-Capture is Disabled',
        'Turn on Auto-capture in Settings to enable payment notification reading and nudges.'
      );
      return;
    }

    let title = '';
    let text = '';
    let packageName = '';

    if (type === 'phonepe') {
      title = 'PhonePe';
      text = `Paid ₹${customAmount || 1} to ${customMerchant || 'Self Account'} using UPI.`;
      packageName = 'com.phonepe.app';
    } else if (type === 'gpay') {
      title = 'Google Pay';
      text = `You paid ₹${customAmount || 240} to ${customMerchant || 'Uber India'}.`;
      packageName = 'com.google.android.apps.nbu.paisa.user';
    } else if (type === 'paytm') {
      title = 'Paytm UPI';
      text = `Paid ₹${customAmount || 380} at ${customMerchant || 'Blinkit Instant Mart'}.`;
      packageName = 'net.one97.paytm';
    } else {
      title = 'UPI Payment';
      text = `Payment of ₹${customAmount || 150} to ${customMerchant || 'Swiggy'} successful.`;
      packageName = 'in.org.npci.upiapp';
    }

    this.handleRawNotification({ title, text, package_name: packageName });
  }
}

export const notificationListener = new NotificationListenerService();
