import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiCall } from '../../../services/api';

export default function ServiciosListScreen() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiCall('/servicios')
      .then(setServicios)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <View style={styles.container}>
      <Button title="Ver Mis Reservas" onPress={() => router.push('/(app)/reservas')} />
      <FlatList
        data={servicios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => router.push(`/(app)/servicios/${item.id}`)}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text>${item.precio} - {item.duracion} min</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', paddingTop: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  nombre: { fontSize: 16, fontWeight: 'bold' }
});
