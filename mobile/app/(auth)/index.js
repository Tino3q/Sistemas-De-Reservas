import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../../services/api';
import { colors, radius, shadow } from '../../constants/theme';

export default function AuthScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('userToken')
      .then((t) => { if (t) router.replace('/(app)/servicios'); })
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password || (isRegistering && !nombre.trim())) {
      Alert.alert('Atencion', 'Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        await apiCall('/auth/registro', {
          method: 'POST',
          body: JSON.stringify({ nombre: nombre.trim(), email: email.trim(), password }),
        });
        Alert.alert('Listo', 'Cuenta creada correctamente. Ya puedes iniciar sesion.');
        setIsRegistering(false);
        setPassword('');
      } else {
        const data = await apiCall('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password }),
        });
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userRol', data.usuario.rol);
        router.replace('/(app)/servicios');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Ocurrio un error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <View style={styles.splash}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logo}><Ionicons name="calendar" size={30} color="#fff" /></View>
          <Text style={styles.brand}>Reservas</Text>
          <Text style={styles.tagline}>Agenda tus servicios en segundos</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.switch}>
            {['Ingresar', 'Crear cuenta'].map((label, i) => {
              const active = (i === 1) === isRegistering;
              return (
                <TouchableOpacity key={label} style={[styles.switchItem, active && styles.switchActive]} onPress={() => setIsRegistering(i === 1)}>
                  <Text style={[styles.switchText, active && styles.switchTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isRegistering && (
            <Field icon="person-outline" placeholder="Nombre completo" value={nombre} onChangeText={setNombre} />
          )}
          <Field icon="mail-outline" placeholder="Correo electronico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Field icon="lock-closed-outline" placeholder="Contrasena" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isRegistering ? 'Crear mi cuenta' : 'Ingresar'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ icon, ...props }) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={20} color={colors.muted} />
      <TextInput style={styles.fieldInput} placeholderTextColor="#9AA6B2" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { backgroundColor: colors.primary, paddingTop: 90, paddingBottom: 90, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  logo: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  brand: { color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 4 },
  card: { backgroundColor: colors.card, marginHorizontal: 20, marginTop: -56, padding: 20, borderRadius: radius.lg, ...shadow },
  switch: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.pill, padding: 4, marginBottom: 18 },
  switchItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.pill },
  switchActive: { backgroundColor: colors.ink },
  switchText: { color: colors.muted, fontWeight: '700' },
  switchTextActive: { color: '#fff' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: 14, marginBottom: 12 },
  fieldInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.ink },
  button: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});