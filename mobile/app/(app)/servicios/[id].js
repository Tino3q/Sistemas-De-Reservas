import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../../../services/api';
import { colors, radius, shadow } from '../../../constants/theme';

export default function ServicioDetalleScreen() {
  const { id } = useLocalSearchParams();
  const [servicio, setServicio] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    apiCall(`/servicios/${id}`).then(setServicio).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Volver</Text></TouchableOpacity>
      </View>
    );
  }
  if (!servicio) return <ActivityIndicator style={styles.center} size="large" color={colors.primary} />;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroIcon}><Ionicons name="sparkles" size={34} color={colors.primary} /></View>
          <Text style={styles.title}>{servicio.nombre}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={22} color={colors.primary} />
              <Text style={styles.statValue}>{servicio.duracion} min</Text>
              <Text style={styles.statLabel}>Duracion</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Ionicons name="pricetag-outline" size={22} color={colors.primary} />
              <Text style={styles.statValue}>${servicio.precio}</Text>
              <Text style={styles.statLabel}>Precio</Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Descripcion</Text>
          <Text style={styles.desc}>{servicio.descripcion}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/(app)/reservas/nueva', params: { servicioId: String(servicio.id) } })}
        >
          <Text style={styles.ctaText}>Reservar este servicio</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, gap: 12 },
  error: { color: colors.danger, fontSize: 15, textAlign: 'center', paddingHorizontal: 30 },
  link: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  hero: { backgroundColor: colors.primary, paddingTop: 56, paddingBottom: 70, alignItems: 'center', borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  back: { position: 'absolute', top: 50, left: 18, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroIcon: { width: 76, height: 76, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: colors.card, marginHorizontal: 20, marginTop: -40, padding: 20, borderRadius: radius.lg, ...shadow },
  stats: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.ink },
  statLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  divider: { width: 1, height: 44, backgroundColor: colors.line },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  desc: { fontSize: 16, color: colors.ink, lineHeight: 24 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, backgroundColor: colors.bg },
  cta: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: colors.ink, paddingVertical: 17, borderRadius: radius.md },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});