import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';
import { parseNotification } from './src/services/notificationParser';
import { useAppStore } from './src/store/useAppStore';
import { PENDING_NUDGE_STORAGE_KEY } from './src/services/notificationListener';
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
    const packageName = raw.app || '';

    // Verify autoCaptureEnabled from persistent storage or active store
    const storedAutoCapture = await AsyncStorage.getItem('@capitrack_auto_capture_enabled');
    const storeState = useAppStore.getState();
    const isEnabled = storeState.autoCaptureEnabled || storedAutoCapture === 'true';

    if (!isEnabled) {
      return;
    }

    const parsed = parseNotification(title, text, packageName);
    if (parsed && parsed.isPayment && parsed.amount > 0) {
      const nudgeData = {
        amount: parsed.amount,
        sourceApp: parsed.sourceApp,
        merchant: parsed.merchant,
        suggestedCategory: parsed.suggestedCategory,
        timestamp: 'Just now',
      };

      // Persist to AsyncStorage so when user opens CapiTrack, it immediately presents the nudge
      await AsyncStorage.setItem(PENDING_NUDGE_STORAGE_KEY, JSON.stringify(nudgeData));

      // Trigger directly if JS engine is running
      storeState.triggerNudge(nudgeData);
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
