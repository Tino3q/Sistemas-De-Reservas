import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function CrearServicioScreen() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCrear = async () => {
    if (!nombre || !descripcion || !duracion || !precio) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(`${API_URL}/servicios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          duracion: parseInt(duracion),
          precio: parseFloat(precio),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo crear el servicio');
      }

      Alert.alert('Exito', 'Servicio creado correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear Nuevo Servicio</Text>

      <TextInput style={styles.input} placeholder="Nombre del servicio" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Descripcion" value={descripcion} onChangeText={setDescripcion} />
      <TextInput style={styles.input} placeholder="Duracion (minutos)" value={duracion} onChangeText={setDuracion} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Precio ($)" value={precio} onChangeText={setPrecio} keyboardType="numeric" />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Button title="Guardar Servicio" onPress={handleCrear} />
          <View style={styles.spacer} />
          <Button title="Cancelar" color="#6c757d" onPress={() => router.back()} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#fff' },
  spacer: { height: 10 },
});