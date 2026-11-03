import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../../../services/api';
import { colors, radius, shadow } from '../../../constants/theme';

export default function ServiciosScreen() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Estados para crear servicio rápido
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState('30');
  const [creando, setCreando] = useState(false);

  const router = useRouter();

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setServicios(await apiCall('/servicios'));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const handleCrearServicio = async () => {
    if (!nombre.trim() || !precio.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa al menos el nombre y el precio del servicio.');
      return;
    }

    setCreando(true);
    try {
      await apiCall('/servicios', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || 'Sin descripción',
          precio: parseFloat(precio),
          duracionMinutos: parseInt(duracion, 10) || 30,
          activo: true,
        }),
      });

      Alert.alert('Éxito', 'Servicio creado correctamente.');
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setDuracion('30');
      setMostrarForm(false);
      cargar();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear el servicio.');
    } finally {
      setCreando(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color={colors.primary} />;

  return (
    <FlatList
      style={styles.screen}
      data={servicios}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.intro}>Elige el servicio que necesitas y reserva tu horario.</Text>

          {/* Botón para alternar formulario de creación */}
          <TouchableOpacity 
            style={styles.btnToggleForm} 
            activeOpacity={0.8}
            onPress={() => setMostrarForm(!mostrarForm)}
          >
            <Ionicons name={mostrarForm ? "close-circle-outline" : "add-circle-outline"} size={20} color="#fff" />
            <Text style={styles.btnToggleFormText}>
              {mostrarForm ? "Cancelar Registro" : "+ Registrar Nuevo Servicio"}
            </Text>
          </TouchableOpacity>

          {/* Formulario rápido desplegable */}
          {mostrarForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Nuevo Servicio</Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre del servicio *"
                placeholderTextColor={colors.muted}
                value={nombre}
                onChangeText={setNombre}
              />

              <TextInput
                style={styles.input}
                placeholder="Descripción"
                placeholderTextColor={colors.muted}
                value={descripcion}
                onChangeText={setDescripcion}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Precio ($) *"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={precio}
                  onChangeText={setPrecio}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Duración (min)"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={duracion}
                  onChangeText={setDuracion}
                />
              </View>

              <TouchableOpacity 
                style={styles.btnGuardar} 
                onPress={handleCrearServicio}
                disabled={creando}
                activeOpacity={0.8}
              >
                {creando ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.btnGuardarText}>Guardar Servicio</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => router.push(`/(app)/servicios/${item.id}`)}>
          <View style={styles.iconBox}><Ionicons name="sparkles" size={24} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.nombre}</Text>
            <Text style={styles.desc} numberOfLines={2}>{item.descripcion}</Text>
            <View style={styles.chips}>
              <View style={styles.chip}><Ionicons name="time-outline" size={13} color={colors.muted} /><Text style={styles.chipText}>{item.duracion || item.duracionMinutos || 30} min</Text></View>
              <View style={[styles.chip, styles.chipPrice]}><Text style={[styles.chipText, { color: colors.ink, fontWeight: '800' }]}>${item.precio}</Text></View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name={error ? 'cloud-offline-outline' : 'file-tray-outline'} size={44} color={colors.muted} />
          <Text style={styles.emptyText}>{error || 'Aun no hay servicios disponibles.'}</Text>
          {error && (
            <TouchableOpacity style={styles.retry} onPress={cargar}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  list: { padding: 20, paddingTop: 4, paddingBottom: 30 },
  headerContainer: { marginBottom: 16 },
  intro: { color: colors.muted, fontSize: 15, marginBottom: 12 },

  btnToggleForm: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.lg,
    marginBottom: 12,
    ...shadow,
  },
  btnToggleFormText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  formCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.lg,
    marginBottom: 14,
    ...shadow,
  },
  formTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  btnGuardar: {
    backgroundColor: colors.ink,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: 4,
  },
  btnGuardarText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, padding: 16, borderRadius: radius.lg, marginBottom: 14, ...shadow },
  iconBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 17, fontWeight: '800', color: colors.ink },
  desc: { fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 18 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  chipPrice: { backgroundColor: colors.accentSoft },
  chipText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 70, gap: 12, paddingHorizontal: 30 },
  emptyText: { color: colors.muted, textAlign: 'center', fontSize: 15 },
  retry: { backgroundColor: colors.ink, paddingHorizontal: 22, paddingVertical: 10, borderRadius: radius.pill },
  retryText: { color: '#fff', fontWeight: '700' },
});