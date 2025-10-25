import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TransferScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const isDark = (colorScheme ?? 'light') === 'dark';

  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!name || !accountNumber || !amount) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los campos obligatorios.');
      return;
    }

    const montoNum = Number(amount);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://api.nessieisreal.com/accounts/68fc67519683f20dd51a3f65/transfers?key=2cbc508da1f232ec2f27f7fc79a2d9ba`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medium: 'balance',
            payee_id: accountNumber,
            amount: montoNum,
            description,
            transaction_date: new Date().toISOString().split('T')[0],
            status: 'pending',
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      Alert.alert('✅ Transferencia exitosa', `ID de transacción: ${data._id}`);
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err?.message ?? 'No se pudo completar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#E2E8F0' : '#334155'} />
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
          Nueva transferencia
        </ThemedText>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Nombre del destinatario</ThemedText>
          <TextInput
            placeholder="Ej. Juan Pérez"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            style={[styles.input, isDark && styles.inputDark]}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Número de cuenta</ThemedText>
          <TextInput
            placeholder="Ej. 68fc678a9683f20dd51a3f68"
            placeholderTextColor="#94A3B8"
            value={accountNumber}
            onChangeText={setAccountNumber}
            style={[styles.input, isDark && styles.inputDark]}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Monto</ThemedText>
          <TextInput
            placeholder="$0.00"
            placeholderTextColor="#94A3B8"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={[styles.input, isDark && styles.inputDark]}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Descripción (opcional)</ThemedText>
          <TextInput
            placeholder="Ej. Pago de renta"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, isDark && styles.inputDark]}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={handleTransfer}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Confirmar transferencia</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: '#0F172A',
  },
  inputDark: {
    backgroundColor: '#1E293B',
    color: '#E2E8F0',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
