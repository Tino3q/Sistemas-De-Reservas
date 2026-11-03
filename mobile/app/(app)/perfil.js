import { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../../services/api';
import { cancelarTodosLosRecordatorios } from '../../services/notifications';
import { colors, radius, shadow } from '../../constants/theme';

export default function PerfilScreen() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useFocusEffect(useCallback(() => {
    apiCall('/usuarios/perfil')
      .then((u) => { setEmail(u.email); setNombre(u.nombre); })
      .catch((e) => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, []));

  const guardar = async () => {
    if (nombre.trim().length < 2) return Alert.alert('Atencion', 'El nombre debe tener al menos 2 caracteres.');
    setSaving(true);
    try {
      const u = await apiCall('/usuarios/perfil', { method: 'PUT', body: JSON.stringify({ nombre: nombre.trim() }) });
      setNombre(u.nombre);
      Alert.alert('Listo', 'Tu perfil se actualizo correctamente.');
    } catch (e) {
      Alert.alert('No se pudo guardar', e.message);
    } finally {
      setSaving(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      await cancelarTodosLosRecordatorios();
    } catch (e) {
      console.warn(e);
    }
    await AsyncStorage.multiRemove(['userToken', 'userRol']);
    router.replace('/');
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color={colors.primary} />;

  const inicial = (nombre.trim()[0] || '?').toUpperCase();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatar}><Text style={styles.avatarText}>{inicial}</Text></View>

        <View style={styles.card}>
          <Text style={styles.label}>Correo electronico</Text>
          <View style={[styles.field, styles.fieldLocked]}>
            <Ionicons name="mail-outline" size={20} color={colors.muted} />
            <TextInput style={[styles.input, { color: colors.muted }]} value={email} editable={false} selectTextOnFocus={false} />
            <Ionicons name="lock-closed" size={16} color={colors.muted} />
          </View>

          <Text style={styles.label}>Nombre</Text>
          <View style={styles.field}>
            <Ionicons name="person-outline" size={20} color={colors.muted} />
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Tu nombre" placeholderTextColor="#9AA6B2" />
          </View>

          <TouchableOpacity style={[styles.save, saving && { opacity: 0.7 }]} onPress={guardar} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Guardar cambios</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logout} onPress={cerrarSesion} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Cerrar sesion</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  content: { padding: 20, alignItems: 'stretch' },
  avatar: { alignSelf: 'center', width: 96, height: 96, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 22, ...shadow },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, ...shadow },
  label: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: 14, marginBottom: 18 },
  fieldLocked: { opacity: 0.8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.ink },
  save: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: radius.md, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, paddingVertical: 16, borderRadius: radius.md, backgroundColor: colors.dangerSoft },
  logoutText: { color: colors.danger, fontSize: 16, fontWeight: '800' },
});