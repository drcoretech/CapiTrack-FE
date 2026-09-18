import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import RNAndroidNotificationListener from 'react-native-android-notification-listener';
import { parseNotification, isDuplicateTransaction, isBlockedNonPaymentApp } from './notificationParser';
import { useAppStore } from '../store/useAppStore';

export const PENDING_NUDGE_STORAGE_KEY = '@capitrack_pending_nudge';
export const PENDING_NUDGES_QUEUE_KEY = '@capitrack_pending_nudges';

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Safely lazy-load expo-notifications only in standalone/dev builds, NEVER in Expo Go sandbox
let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch (err) {
    console.warn('[CapiTrack] expo-notifications native module not available:', err);
  }
}

// Configure foreground notification presentation (standalone/dev build only)
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority?.MAX,
      }),
    });
  } catch {
    // Ignored in environments where push notifications are restricted
  }
}

/**
 * Post a high-priority local status-bar Heads-Up Notification on Android.
 * Pops down from the top of the screen immediately when PhonePe/GPay completes.
 */
export async function postLocalPaymentAlert(amount: number, merchant: string, sourceApp: string) {
  if (!Notifications || Platform.OS !== 'android') return;

  try {
    // Check notification permission
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      if (req.status !== 'granted') return;
    }

    // Set high-importance channel for Android heads-up popup
    await Notifications.setNotificationChannelAsync('payment_alerts', {
      name: 'Payment Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2C5E3B',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    await Notifications.scheduleNotificationAsync({
      identifier: 'capitrack_payment_alert',
      content: {
        title: `💸 ₹${amount.toLocaleString()} Paid to ${merchant || sourceApp}`,
        body: `Tap to categorize (Food, Grocery, Travel...) in CapiTrack`,
        data: { amount, merchant, sourceApp },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: { channelId: 'payment_alerts' },
    });
  } catch (err) {
    console.warn('[CapiTrack] Failed to schedule local payment alert:', err);
  }
}

class NotificationListenerService {
  private isListening = false;
  private responseSubscription: any = null;

  /**
   * Initialize listener and rehydrate any pending nudges from AsyncStorage.
   */
  public async init() {
    if (Platform.OS !== 'android') {
      return;
    }

    this.start();

    // 1. Request POST_NOTIFICATIONS permission for local alerts
    if (Notifications) {
      try {
        await Notifications.requestPermissionsAsync();
      } catch {}

      // 2. Listen to notification click events to bring up the categorization nudge
      if (!this.responseSubscription && typeof Notifications.addNotificationResponseReceivedListener === 'function') {
        try {
          this.responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
            const data = response?.notification?.request?.content?.data;
            if (data && data.amount) {
              const state = useAppStore.getState();
              if (state.autoCaptureEnabled) {
                state.triggerNudge({
                  amount: Number(data.amount),
                  sourceApp: String(data.sourceApp || 'UPI'),
                  merchant: String(data.merchant || 'Merchant'),
                  suggestedCategory: 'Food',
                  timestamp: 'Just now',
                });
              }
            }
          });
        } catch {
          // Ignored in restricted environments
        }
      }
    }

    // 3. Rehydrate queue of unconfirmed payments recorded while app was closed
    try {
      const queueStr = await AsyncStorage.getItem(PENDING_NUDGES_QUEUE_KEY);
      const queue = queueStr ? JSON.parse(queueStr) : [];
      if (Array.isArray(queue) && queue.length > 0) {
        const state = useAppStore.getState();
        if (state.autoCaptureEnabled) {
          useAppStore.setState({
            pendingNudges: queue,
            pendingNudge: queue[0],
          });
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
    const pkg = (payload.package_name || '').toLowerCase();
    if (isBlockedNonPaymentApp(pkg)) {
      return;
    }

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

    if (isDuplicateTransaction(parsed.amount, parsed.merchant, payload.package_name || '')) {
      return;
    }

    const nudgeData = {
      amount: parsed.amount,
      sourceApp: parsed.sourceApp,
      merchant: parsed.merchant,
      suggestedCategory: parsed.suggestedCategory,
      timestamp: 'Just now',
    };

    // 1. Add to store queue (never overwrites previous payment)
    state.triggerNudge(nudgeData);

    // 2. Post immediate local heads-up alert on the phone
    await postLocalPaymentAlert(parsed.amount, parsed.merchant, parsed.sourceApp);
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
