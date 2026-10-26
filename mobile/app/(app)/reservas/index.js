import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { apiCall } from '../../../services/api';

export default function MisReservasScreen() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      const data = await apiCall('/reservas/mis-reservas');
      setReservas(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelar = async (id) => {
    try {
      await apiCall(`/reservas/${id}`, { method: 'DELETE' });
      Alert.alert('Exito', 'Reserva cancelada');
      cargarReservas();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Reservas</Text>
      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nombreServicio}>{item.servicio?.nombre}</Text>
            <Text>Fecha: {item.fecha} - {item.hora}</Text>
            <Text style={styles.estado}>Estado: {item.estado}</Text>
            {item.estado === 'pendiente' && (
              <Button title="Cancelar Reserva" color="#d9534f" onPress={() => cancelar(item.id)} />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', paddingTop: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  item: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  nombreServicio: { fontSize: 16, fontWeight: 'bold' },
  estado: { color: '#007bff', marginVertical: 5, fontWeight: '500' }
});