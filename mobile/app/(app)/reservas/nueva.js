import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../../../services/api';
import { construirFecha, faltaMenosDe24h, programarRecordatorio } from '../../../services/notifications';
import { colors, radius, shadow } from '../../../constants/theme';

const pad = (n) => String(n).padStart(2, '0');
const aFecha = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const DIAS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const HORARIOS = [];
for (let h = 8; h <= 18; h++) HORARIOS.push(`${pad(h)}:00`, `${pad(h)}:30`);

export default function NuevaReservaScreen() {
  const { servicioId } = useLocalSearchParams();
  const router = useRouter();
  const [servicio, setServicio] = useState(null);
  const [diaIdx, setDiaIdx] = useState(0);
  const [hora, setHora] = useState(null);
  const [loading, setLoading] = useState(false);

  const dias = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  }), []);

  useEffect(() => {
    apiCall(`/servicios/${servicioId}`).then(setServicio).catch(() => {});
  }, [servicioId]);

  const fecha = aFecha(dias[diaIdx]);
  const pasada = (h) => construirFecha(fecha, h).getTime() <= Date.now();

  const handleCrearReserva = async () => {
    if (!hora) return Alert.alert('Atencion', 'Selecciona un horario.');
    const momento = construirFecha(fecha, hora);

    setLoading(true);
    try {
      const reserva = await apiCall('/reservas', {
        method: 'POST',
        body: JSON.stringify({ servicioId: Number(servicioId), fecha, hora, fechaHora: momento.toISOString() }),
      });

      let mensaje;
      if (faltaMenosDe24h(momento)) {
        mensaje = 'Tu reserva es en menos de 24 horas, por eso no se programo recordatorio.';
      } else {
        let id = null;
        try {
          id = await programarRecordatorio({
            reservaId: reserva.id,
            nombreServicio: reserva.servicio?.nombre || servicio?.nombre || 'tu servicio',
            hora,
            fechaHora: momento,
          });
        } catch (e) {
          id = null;
        }
        mensaje = id
          ? 'Te avisaremos 24 horas antes de tu cita.'
          : 'No pudimos programar el recordatorio. Revisa los permisos de notificaciones.';
      }

      Alert.alert('Reserva creada', mensaje, [{ text: 'OK', onPress: () => router.replace('/(app)/reservas') }]);
    } catch (error) {
      Alert.alert('No se pudo reservar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <View style={styles.top}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Nueva reserva</Text>
            <Text style={styles.title} numberOfLines={1}>{servicio?.nombre || 'Cargando...'}</Text>
          </View>
        </View>

        <Text style={styles.section}>1. Elige el dia</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {dias.map((d, i) => {
            const active = i === diaIdx;
            return (
              <TouchableOpacity key={i} style={[styles.day, active && styles.dayActive]} onPress={() => { setDiaIdx(i); setHora(null); }}>
                <Text style={[styles.dayName, active && styles.onDark]}>{DIAS[d.getDay()]}</Text>
                <Text style={[styles.dayNum, active && styles.onDark]}>{d.getDate()}</Text>
                <Text style={[styles.dayMonth, active && styles.onDark]}>{MESES[d.getMonth()]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.section}>2. Elige la hora</Text>
        <View style={styles.slots}>
          {HORARIOS.map((h) => {
            const off = pasada(h);
            const active = hora === h;
            return (
              <TouchableOpacity key={h} disabled={off} style={[styles.slot, active && styles.slotActive, off && styles.slotOff]} onPress={() => setHora(h)}>
                <Text style={[styles.slotText, active && styles.onDark, off && styles.slotTextOff]}>{h}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {hora && (
          <View style={styles.summary}>
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            <Text style={styles.summaryText}>
              {DIAS[dias[diaIdx].getDay()]} {dias[diaIdx].getDate()} de {MESES[dias[diaIdx].getMonth()]} a las {hora}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.cta, (!hora || loading) && { opacity: 0.5 }]} disabled={!hora || loading} onPress={handleCrearReserva} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Confirmar reserva</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', ...shadow },
  kicker: { fontSize: 12, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  section: { fontSize: 14, fontWeight: '800', color: colors.muted, marginTop: 22, marginBottom: 12, paddingHorizontal: 20 },
  row: { paddingHorizontal: 20, gap: 10 },
  day: { width: 64, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, ...shadow },
  dayActive: { backgroundColor: colors.ink },
  dayName: { fontSize: 12, fontWeight: '700', color: colors.muted },
  dayNum: { fontSize: 22, fontWeight: '800', color: colors.ink, marginVertical: 2 },
  dayMonth: { fontSize: 12, fontWeight: '600', color: colors.muted },
  onDark: { color: '#fff' },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
  slot: { width: '22%', paddingVertical: 12, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotOff: { backgroundColor: 'transparent', borderStyle: 'dashed' },
  slotText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  slotTextOff: { color: '#B8BEC6', textDecorationLine: 'line-through' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 24, padding: 16, backgroundColor: colors.primarySoft, borderRadius: radius.md },
  summaryText: { flex: 1, color: colors.primary, fontWeight: '800', fontSize: 15 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, backgroundColor: colors.bg },
  cta: { backgroundColor: colors.ink, paddingVertical: 17, borderRadius: radius.md, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});