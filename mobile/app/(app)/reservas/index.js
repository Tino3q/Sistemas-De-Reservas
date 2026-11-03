import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../../../services/api';
import { cancelarRecordatorio } from '../../../services/notifications';
import { colors, radius, shadow } from '../../../constants/theme';

const ESTILOS = {
  pendiente: { bg: colors.accentSoft, fg: '#A15C0B' },
  confirmada: { bg: colors.primarySoft, fg: colors.primary },
  cancelada: { bg: colors.dangerSoft, fg: colors.danger },
  completada: { bg: '#E5E9F0', fg: colors.muted },
};

export default function MisReservasScreen() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const cargar = useCallback(async () => {
    try {
      const data = await apiCall('/reservas/mis-reservas');
      data.sort((a, b) => (a.estado === 'cancelada') - (b.estado === 'cancelada'));
      setReservas(data);
      data.filter((r) => r.estado === 'cancelada').forEach((r) => cancelarRecordatorio(r.id).catch(() => {}));
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const cancelar = (id) => {
    Alert.alert('Cancelar reserva', 'Seguro que deseas cancelarla?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Si, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiCall(`/reservas/${id}`, { method: 'DELETE' });
            await cancelarRecordatorio(id);
            cargar();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color={colors.primary} />;

  return (
    <FlatList
      style={styles.screen}
      data={reservas}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={colors.primary} />}
      ListHeaderComponent={
        <TouchableOpacity style={styles.newButton} activeOpacity={0.85} onPress={() => router.push('/(app)/servicios')}>
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.newButtonText}>Nueva reserva</Text>
        </TouchableOpacity>
      }
      renderItem={({ item }) => {
        const est = ESTILOS[item.estado] || ESTILOS.pendiente;
        const cancelada = item.estado === 'cancelada';
        return (
          <View style={[styles.card, cancelada && { opacity: 0.65 }]}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>{item.servicio?.nombre || 'Servicio'}</Text>
              <View style={[styles.badge, { backgroundColor: est.bg }]}>
                <Text style={[styles.badgeText, { color: est.fg }]}>{item.estado}</Text>
              </View>
            </View>
            <View style={styles.meta}>
              <View style={styles.metaItem}><Ionicons name="calendar-outline" size={16} color={colors.muted} /><Text style={styles.metaText}>{item.fecha}</Text></View>
              <View style={styles.metaItem}><Ionicons name="time-outline" size={16} color={colors.muted} /><Text style={styles.metaText}>{item.hora}</Text></View>
            </View>
            {!cancelada && (
              <TouchableOpacity style={styles.cancel} onPress={() => cancelar(item.id)}>
                <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
                <Text style={styles.cancelText}>Cancelar reserva</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="calendar-clear-outline" size={46} color={colors.muted} />
          <Text style={styles.emptyText}>Aun no tienes reservas.{'\n'}Agenda tu primera cita!</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  list: { padding: 20, paddingTop: 4, paddingBottom: 30 },
  newButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 15, borderRadius: radius.md, marginBottom: 18 },
  newButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, marginBottom: 14, ...shadow },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  name: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.ink },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  meta: { flexDirection: 'row', gap: 18, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 15, color: colors.ink, fontWeight: '600' },
  cancel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingVertical: 11, borderRadius: radius.sm, backgroundColor: colors.dangerSoft },
  cancelText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 50, gap: 12 },
  emptyText: { color: colors.muted, textAlign: 'center', fontSize: 15, lineHeight: 22 },
});