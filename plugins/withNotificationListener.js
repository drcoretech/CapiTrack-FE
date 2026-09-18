const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withNotificationListener(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Ensure uses-permission array
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const permissions = [
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.WAKE_LOCK',
      'android.permission.FOREGROUND_SERVICE',
    ];

    // Strip out BIND_NOTIFICATION_LISTENER_SERVICE and READ_PHONE_STATE from uses-permission
    // (BIND_NOTIFICATION_LISTENER_SERVICE belongs strictly on the <service> tag, NOT <uses-permission>)
    // (READ_PHONE_STATE is an unused sensitive permission that triggers Google Play Protect fraud blocks)
    androidManifest['uses-permission'] = androidManifest['uses-permission'].filter((p) => {
      const name = p.$ && p.$['android:name'];
      return (
        name !== 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE' &&
        name !== 'android.permission.READ_PHONE_STATE'
      );
    });

    permissions.forEach((perm) => {
      const exists = androidManifest['uses-permission'].some(
        (p) => p.$ && p.$['android:name'] === perm
      );
      if (!exists) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': perm },
        });
      }
    });

    // Ensure xmlns:tools exists
    if (!androidManifest.$) {
      androidManifest.$ = {};
    }
    if (!androidManifest.$['xmlns:tools']) {
      androidManifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Ensure application element
    if (!androidManifest.application || !androidManifest.application[0]) {
      return config;
    }

    const app = androidManifest.application[0];
    if (!app.$) {
      app.$ = {};
    }

    // Add tools:replace to resolve any third-party manifest merger conflicts with allowBackup
    const currentReplace = app.$['tools:replace'] || '';
    const replaceList = currentReplace
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!replaceList.includes('android:allowBackup')) {
      replaceList.push('android:allowBackup');
    }
    app.$['tools:replace'] = replaceList.join(',');

    if (!app.service) {
      app.service = [];
    }

    // 1. RNAndroidNotificationListener Service
    const listenerServiceName =
      'com.lesimoes.androidnotificationlistener.RNAndroidNotificationListener';
    const listenerServiceExists = app.service.some(
      (s) => s.$ && s.$['android:name'] === listenerServiceName
    );

    if (!listenerServiceExists) {
      app.service.push({
        $: {
          'android:name': listenerServiceName,
          'android:permission':
            'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name':
                    'android.service.notification.NotificationListenerService',
                },
              },
            ],
          },
        ],
      });
    }

    // 2. RNAndroidNotificationListenerHeadlessJsTaskService
    const headlessServiceName =
      'com.lesimoes.androidnotificationlistener.RNAndroidNotificationListenerHeadlessJsTaskService';
    const headlessServiceExists = app.service.some(
      (s) => s.$ && s.$['android:name'] === headlessServiceName
    );

    if (!headlessServiceExists) {
      app.service.push({
        $: {
          'android:name': headlessServiceName,
          'android:exported': 'false',
        },
      });
    }

    // 3. BootUpReceiver
    if (!app.receiver) {
      app.receiver = [];
    }
    const receiverName =
      'com.lesimoes.androidnotificationlistener.BootUpReceiver';
    const receiverExists = app.receiver.some(
      (r) => r.$ && r.$['android:name'] === receiverName
    );

    if (!receiverExists) {
      app.receiver.push({
        $: {
          'android:name': receiverName,
          'android:enabled': 'true',
          'android:exported': 'true',
          'android:permission': 'android.permission.RECEIVE_BOOT_COMPLETED',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.intent.action.BOOT_COMPLETED',
                },
              },
            ],
            category: [
              {
                $: {
                  'android:name': 'android.intent.category.DEFAULT',
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};
