import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Tx = {
  _id: string;
  amount: number;
  description?: string;
  medium?: string;
  payee_id?: string;
  payer_id?: string;
  status?: string;
  transaction_date?: string;
  purchase_date?: string;
  type?: string;
};

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; tx?: string; accountId?: string }>();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const isDark = (colorScheme ?? 'light') === 'dark';

  const tx: Tx | null = useMemo(() => {
    try {
      return params.tx ? JSON.parse(decodeURIComponent(String(params.tx))) as Tx : null;
    } catch {
      return null;
    }
  }, [params.tx]);

  const accountId = String(params.accountId ?? '');

  const money = (n: number) =>
    Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const humanDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
      const f = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
      const t = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      return `${f} • ${t}`;
    } catch {
      return iso;
    }
  };

  const pickIcon = (desc: string = '') => {
    const s = desc.toLowerCase();
    if (s.includes('taxi')) return 'car.fill';
    if (s.includes('transporte')) return 'tram.fill.tunnel';
    if (s.includes('internet')) return 'wifi';
    if (s.includes('hospedaje')) return 'bed.double.fill';
    if (s.includes('alimentos') || s.includes('cena')) return 'fork.knife';
    if (s.includes('compras') || s.includes('super')) return 'cart.fill';
    if (s.includes('servicios')) return 'wrench.and.screwdriver.fill';
    if (s.includes('mantenimiento')) return 'gearshape.2.fill';
    if (s.includes('tour') || s.includes('eventos')) return 'ticket.fill';
    if (s.includes('gasolina')) return 'fuelpump.fill';
    if (s.includes('souvenirs') || s.includes('propinas')) return 'gift.fill';
    return 'arrow.up.right.circle.fill';
  };

  const outgoing = tx?.payer_id && accountId ? tx.payer_id === accountId : (tx?.amount ?? 0) >= 0 ? false : true;
  const isNegative = outgoing;
  const amountColor = isNegative ? '#EF4444' : '#10B981';
  const formattedAmount = `${isNegative ? '-' : '+'}${money(Math.abs(tx?.amount ?? 0))}`;

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: 'Completado', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    pending:   { label: 'Pendiente',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    cancelled: { label: 'Cancelado',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const currentStatus = statusMap[String(tx?.status ?? 'completed').toLowerCase()] ?? statusMap.completed;

  const title = tx?.description || 'Movimiento';
  const icon = pickIcon(tx?.description);
  const reference = tx?._id ?? '—';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transacción: ${title}\nMonto: ${formattedAmount}\nFecha: ${humanDate(tx?.transaction_date || tx?.purchase_date)}\nReferencia: ${reference}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!tx) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>No se pudo cargar la transacción.</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#E2E8F0' : '#334155'} />
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
          Detalles de transacción
        </ThemedText>
        <TouchableOpacity onPress={handleShare} hitSlop={8}>
          <IconSymbol name="square.and.arrow.up" size={22} color={tintColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.amountCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${amountColor}15` }]}>
            <IconSymbol name={icon as any} size={40} color={amountColor} />
          </View>

          <ThemedText style={styles.category}>{tx.type?.toUpperCase() ?? '—'}</ThemedText>
          <ThemedText style={[styles.amount, { color: amountColor }]}>{formattedAmount}</ThemedText>

          <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: currentStatus.color }]} />
            <ThemedText style={[styles.statusText, { color: currentStatus.color }]}>
              {currentStatus.label}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Información general
          </ThemedText>

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <IconSymbol name="doc.text" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              <ThemedText style={styles.labelText}>Descripción</ThemedText>
            </View>
            <ThemedText style={styles.valueText}>{title}</ThemedText>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <IconSymbol name="calendar" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              <ThemedText style={styles.labelText}>Fecha</ThemedText>
            </View>
            <ThemedText style={styles.valueText}>{humanDate(tx.purchase_date || tx.transaction_date)}</ThemedText>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <IconSymbol name="number" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              <ThemedText style={styles.labelText}>Referencia</ThemedText>
            </View>
            <ThemedText style={[styles.valueText, styles.monospaceText]}>
              {reference}
            </ThemedText>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabel}>
              <IconSymbol name="arrow.left.arrow.right" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              <ThemedText style={styles.labelText}>Dirección</ThemedText>
            </View>
            <ThemedText style={styles.valueText}>
              {outgoing ? 'Salida (pagaste tú)' : 'Entrada (te pagaron)'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {}}
          >
            <IconSymbol name="arrow.down.doc" size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              Descargar comprobante
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {}}
          >
            <IconSymbol name="exclamationmark.circle" size={20} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              Reportar problema
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 17,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  amountCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  category: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  detailsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  detailRow: {
    gap: 12,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  labelText: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 15,
    fontWeight: '500',
    paddingLeft: 28,
  },
  monospaceText: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 16,
  },

  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});