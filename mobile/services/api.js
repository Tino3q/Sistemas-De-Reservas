import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.16.22.143:3000';

export const apiCall = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('userToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, { ...options, headers, signal: controller.signal });
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexion y la IP del backend.');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      await AsyncStorage.multiRemove(['userToken', 'userRol']);
      throw new Error('Tu sesion expiro. Inicia sesion nuevamente.');
    }
    throw new Error(data?.error || data?.message || `Error ${response.status}`);
  }

  return data;
};