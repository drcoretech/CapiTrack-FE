import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';
import { parseNotification, isDuplicateTransaction } from './src/services/notificationParser';
import { useAppStore } from './src/store/useAppStore';
import { PENDING_NUDGE_STORAGE_KEY, PENDING_NUDGES_QUEUE_KEY, postLocalPaymentAlert } from './src/services/notificationListener';
import App from './App';

/**
 * Headless JS task that runs in the background when Android posts a notification,
 * even if the CapiTrack app is minimized or closed.
 */
const headlessNotificationListener = async ({ notification }: { notification?: string }) => {
  if (!notification) return;

  try {
    const raw = typeof notification === 'string' ? JSON.parse(notification) : notification;
    const title = raw.title || raw.titleBig || '';
    const text = raw.text || raw.bigText || raw.subText || '';
    const packageName = (raw.app || raw.package_name || '').toLowerCase();

    // HARD STOP: Never process notifications posted by CapiTrack itself
    if (packageName.includes('capitrack') || packageName.includes('capitech')) {
      return;
    }

    // Verify autoCaptureEnabled from persistent storage or active store
    const storedAutoCapture = await AsyncStorage.getItem('@capitrack_auto_capture_enabled');
    const storeState = useAppStore.getState();
    const isEnabled = storeState.autoCaptureEnabled || storedAutoCapture === 'true';

    if (!isEnabled) {
      return;
    }

    const parsed = parseNotification(title, text, packageName);
    if (parsed && parsed.isPayment && parsed.amount > 0) {
      if (isDuplicateTransaction(parsed.amount, parsed.merchant, packageName)) {
        return;
      }
      const nudgeData = {
        id: 'nudge_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        amount: parsed.amount,
        sourceApp: parsed.sourceApp,
        merchant: parsed.merchant,
        suggestedCategory: parsed.suggestedCategory,
        timestamp: 'Just now',
        createdAt: Date.now(),
      };

      // 1. Append to pending nudges FIFO queue in AsyncStorage
      try {
        const queueStr = await AsyncStorage.getItem(PENDING_NUDGES_QUEUE_KEY);
        const queue = queueStr ? JSON.parse(queueStr) : [];
        const existingIdx = Array.isArray(queue)
          ? queue.findIndex(
              (n: any) =>
                Math.abs(n.amount - nudgeData.amount) < 0.01 &&
                Date.now() - (n.createdAt || 0) < 15000
            )
          : -1;

        if (existingIdx >= 0) {
          if (queue[existingIdx].sourceApp === 'Bank SMS' && nudgeData.sourceApp !== 'Bank SMS') {
            queue[existingIdx].merchant = nudgeData.merchant;
            queue[existingIdx].sourceApp = nudgeData.sourceApp;
            queue[existingIdx].suggestedCategory = nudgeData.suggestedCategory;
            await AsyncStorage.setItem(PENDING_NUDGES_QUEUE_KEY, JSON.stringify(queue));
            await AsyncStorage.setItem(PENDING_NUDGE_STORAGE_KEY, JSON.stringify(queue[0]));
          }
        } else {
          queue.push(nudgeData);
          await AsyncStorage.setItem(PENDING_NUDGES_QUEUE_KEY, JSON.stringify(queue));
          await AsyncStorage.setItem(PENDING_NUDGE_STORAGE_KEY, JSON.stringify(queue[0]));
        }
      } catch (qErr) {
        console.warn('[CapiTrack Headless] Queue save error:', qErr);
      }

      // 2. Trigger active store if JS engine is alive
      storeState.triggerNudge(nudgeData);

      // 3. Post immediate Android Heads-Up notification over PhonePe/GPay
      await postLocalPaymentAlert(parsed.amount, parsed.merchant, parsed.sourceApp);
    }
  } catch (err) {
    console.warn('[CapiTrack Headless] Notification processing error:', err);
  }
};

if (Platform.OS === 'android') {
  AppRegistry.registerHeadlessTask(
    RNAndroidNotificationListenerHeadlessJsName || 'RNAndroidNotificationListenerHeadlessJs',
    () => headlessNotificationListener
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
