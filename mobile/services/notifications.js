import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const MAP_KEY = 'notifMap';
const CANAL = 'recordatorios';
export const HORAS_ANTES = 24;
const MS_ANTES = HORAS_ANTES * 60 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const soportado = Platform.OS !== 'web';

const leerMapa = async () => {
  try {
    return JSON.parse((await AsyncStorage.getItem(MAP_KEY)) || '{}');
  } catch (e) {
    return {};
  }
};

const guardarMapa = (mapa) => AsyncStorage.setItem(MAP_KEY, JSON.stringify(mapa));

export const construirFecha = (fecha, hora) => {
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

export const faltaMenosDe24h = (fechaHora) => fechaHora.getTime() - Date.now() < MS_ANTES;

export async function pedirPermisos() {
  if (!soportado) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Recordatorios de reservas',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) return true;
  if (actual.canAskAgain === false) return false;
  const nuevo = await Notifications.requestPermissionsAsync();
  return nuevo.granted;
}

export async function programarRecordatorio({ reservaId, nombreServicio, hora, fechaHora }) {
  if (!soportado) return null;
  if (faltaMenosDe24h(fechaHora)) return null;

  const permitido = await pedirPermisos();
  if (!permitido) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de tu reserva',
      body: `Manana tienes ${nombreServicio} a las ${hora}.`,
      data: { reservaId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(fechaHora.getTime() - MS_ANTES),
      channelId: CANAL,
    },
  });

  const mapa = await leerMapa();
  mapa[reservaId] = notificationId;
  await guardarMapa(mapa);
  return notificationId;
}

export async function cancelarRecordatorio(reservaId) {
  if (!soportado) return;
  const mapa = await leerMapa();
  const notificationId = mapa[reservaId];
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } finally {
    delete mapa[reservaId];
    await guardarMapa(mapa);
  }
}

export async function cancelarTodosLosRecordatorios() {
  if (soportado) await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(MAP_KEY);
}