import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function ServiciosScreen() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const rol = await AsyncStorage.getItem('userRol');

      if (!token) {
        router.replace('/');
        return;
      }

      if (rol === 'admin') {
        setIsAdmin(true);
      }

      const response = await fetch(`${API_URL}/servicios`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        await AsyncStorage.clear();
        Alert.alert('Sesion expirada', 'Por favor ingresa de nuevo');
        router.replace('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }

      const data = await response.json();
      setServicios(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Servicios</Text>

      {isAdmin && (
        <View style={styles.adminButtonContainer}>
          <Button title="Crear Nuevo Servicio" color="#28a745" onPress={() => router.push('/crear-servicio')} />
        </View>
      )}

      <FlatList
        data={servicios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nombreServicio}>{item.nombre}</Text>
            <Text style={styles.descServicio}>{item.descripcion}</Text>
            <Text style={styles.detallesServicio}>Duracion: {item.duracion} min | Precio: ${item.precio}</Text>
          </View>
        )}
      />

      <View style={styles.logoutContainer}>
        <Button title="Cerrar Sesion" color="#d9534f" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  adminButtonContainer: { marginBottom: 15 },
  item: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  nombreServicio: { fontSize: 16, fontWeight: '600', color: '#333' },
  descServicio: { fontSize: 14, color: '#666', marginTop: 2 },
  detallesServicio: { fontSize: 13, color: '#007bff', marginTop: 6, fontWeight: '500' },
  logoutContainer: { marginTop: 15, marginBottom: 20 },
});