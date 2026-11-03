import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

const icono = (activo, inactivo) => ({ color, size, focused }) => (
  <Ionicons name={focused ? activo : inactivo} size={size} color={color} />
);

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line, height: 64, paddingTop: 6, paddingBottom: 8 },
        sceneStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg, elevation: 0, shadowOpacity: 0 },
        headerTitleAlign: 'left',
        headerTitleStyle: { fontSize: 24, fontWeight: '800', color: colors.ink },
      }}
    >
      <Tabs.Screen name="servicios" options={{ title: 'Servicios', headerTitle: 'Servicios', tabBarIcon: icono('sparkles', 'sparkles-outline') }} />
      <Tabs.Screen name="reservas" options={{ title: 'Mis reservas', headerTitle: 'Mis reservas', tabBarIcon: icono('calendar', 'calendar-outline') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', headerTitle: 'Mi perfil', tabBarIcon: icono('person', 'person-outline') }} />
    </Tabs>
  );
}