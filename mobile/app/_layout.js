import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { pedirPermisos } from '../services/notifications';

export default function RootLayout() {
  useEffect(() => {
    pedirPermisos().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}