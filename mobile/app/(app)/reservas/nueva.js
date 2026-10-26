import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { apiCall } from '../../../services/api';

export default function NuevaReservaScreen() {
  const { servicioId } = useLocalSearchParams();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCrearReserva = async () => {
    if (!fecha || !hora) {
      Alert.alert('Error', 'Completa fecha y hora');
      return;
    }

    setLoading(true);
    try {
      await apiCall('/reservas', {
        method: 'POST',
        body: JSON.stringify({ fecha, hora, servicioId }),
      });
      Alert.alert('Exito', 'Reserva creada correctamente', [
        { text: 'OK', onPress: () => router.replace('/(app)/reservas') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Nueva Reserva</Text>
      <TextInput style={styles.input} placeholder="Fecha (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} />
      <TextInput style={styles.input} placeholder="Hora (HH:MM)" value={hora} onChangeText={setHora} />
      {loading ? <ActivityIndicator size="large" /> : <Button title="Confirmar Reserva" onPress={handleCrearReserva} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#fff' }
});