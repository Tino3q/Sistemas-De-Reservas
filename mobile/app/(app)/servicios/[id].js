import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { apiCall } from '../../../services/api';

export default function ServicioDetalleScreen() {
  const { id } = useLocalSearchParams();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiCall(`/servicios/${id}`)
      .then(setServicio)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !servicio) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{servicio.nombre}</Text>
      <Text style={styles.desc}>{servicio.descripcion}</Text>
      <Text style={styles.detalles}>Duracion: {servicio.duracion} min</Text>
      <Text style={styles.detalles}>Precio: ${servicio.precio}</Text>
      <View style={styles.spacer}>
        <Button title="Reservar este servicio" onPress={() => router.push(`/(app)/reservas/nueva?servicioId=${id}`)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  desc: { fontSize: 16, color: '#666', marginBottom: 15 },
  detalles: { fontSize: 15, marginBottom: 5, fontWeight: '500' },
  spacer: { marginTop: 20 }
});