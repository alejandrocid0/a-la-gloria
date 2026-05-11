import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const setupNotificationChannel = async () => {
  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: 'daily-reminder',
      name: 'Recordatorio Diario',
      description: 'Aviso diario para jugar la pregunta del día',
      importance: 4,
      vibration: true,
    });
  }
};

export const scheduleDaily12Notification = async () => {
  const platform = Capacitor.getPlatform();

  if (platform === 'android') {
    // Android supports native repeating at a fixed hour — schedule once, repeats forever
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'A la Gloria - Pregunta Diaria',
          body: '¿Cuántos puntos conseguirás hoy? Tu pregunta de Semana Santa te espera.',
          channelId: 'daily-reminder',
          schedule: {
            on: { hour: 12, minute: 0 },
            repeats: true,
          },
          autoCancel: true,
        },
      ],
    });
  } else if (platform === 'ios') {
    // iOS does not support native repeating with a fixed hour — schedule next occurrence.
    // The hook calls this on every app launch, keeping it always one day ahead.
    const next12 = new Date();
    next12.setHours(12, 0, 0, 0);
    if (new Date() > next12) {
      next12.setDate(next12.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'A la Gloria - Pregunta Diaria',
          body: '¿Cuántos puntos conseguirás hoy? Tu pregunta de Semana Santa te espera.',
          schedule: { at: next12 },
          autoCancel: true,
        },
      ],
    });
  }
};
