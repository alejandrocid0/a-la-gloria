import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  scheduleDaily12Notification,
  setupNotificationChannel,
} from '@/utils/notificationScheduler';

export const useNotificationSetup = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setup = async () => {
      try {
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== 'granted') return;

        await setupNotificationChannel();

        // iOS: cancel previous and reschedule on every app launch (no native repeat support)
        if (Capacitor.getPlatform() === 'ios') {
          await LocalNotifications.cancelAll();
        }

        await scheduleDaily12Notification();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Notification setup failed:', error);
        }
      }
    };

    setup();
  }, []);
};
