import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function TransferScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? "light"].tint;
  const isDark = (colorScheme ?? "light") === "dark";

  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE = "http://api.nessieisreal.com";
  const APIKEY = "2cbc508da1f232ec2f27f7fc79a2d9ba";
  const PAYER_ID = "68fc67519683f20dd51a3f65";

  const handleTransfer = async () => {
    if (!name || !accountNumber || !amount) {
      Alert.alert(
        "Campos incompletos",
        "Por favor llena todos los campos obligatorios."
      );
      return;
    }

    const montoNum = Number(amount);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a 0.");
      return;
    }

    const looksLikeId = /^[a-f0-9]{24}$/i.test(accountNumber.trim());
    if (!looksLikeId) {
      Alert.alert(
        "Cuenta destino inválida",
        "El ID de cuenta debe tener 24 caracteres hexadecimales."
      );
      return;
    }

    try {
      setLoading(true);

      const [payerRes, payeeRes] = await Promise.all([
        fetch(`${BASE}/accounts/${PAYER_ID}?key=${APIKEY}`),
        fetch(`${BASE}/accounts/${accountNumber.trim()}?key=${APIKEY}`),
      ]);

      if (!payerRes.ok) {
        const t = await payerRes.text();
        throw new Error(`Cuenta origen no encontrada (${PAYER_ID}). ${t}`);
      }
      if (!payeeRes.ok) {
        const t = await payeeRes.text();
        throw new Error(`Cuenta destino no existe (${accountNumber}). ${t}`);
      }

      const body = {
        medium: "balance",
        payee_id: accountNumber.trim(),
        amount: montoNum,
        transaction_date: new Date().toISOString().slice(0, 10),
        status: "pending",
        description,
      };

      const response = await fetch(
        `${BASE}/accounts/${PAYER_ID}/transfers?key=${APIKEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medium: 'balance',
            payee_id: accountNumber,
            amount: montoNum,
            description,
            transaction_date: new Date().toISOString().split('T')[0],
            status: 'completed', // 'pending' o 'completed'
          }),
        }
      );

      // --- ¡LA MODIFICACIÓN IMPORTANTE! ---
      if (!response.ok) {
        // Si la respuesta es un error (como 400),
        // leemos el JSON del error para ver el mensaje.
        const errorData = await response.json();
        
        // Lanzamos un error con el mensaje específico de la API
        throw new Error(errorData.message || `Error HTTP ${response.status}`);
      }
      // --- FIN DE LA MODIFICACIÓN ---

      const data = await response.json();
      console.log("Transfer created:", data.objectCreated._id);
      Alert.alert(
        "Transferencia creada",
        `ID: ${data.objectCreated._id ?? "—"}`
      );
      router.back();

    } catch (err: any) {
      console.error(err);
      // Ahora la alerta mostrará el mensaje útil de la API
      Alert.alert('Error en la transferencia', err?.message ?? 'No se pudo completar la operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <IconSymbol
            name="chevron.left"
            size={24}
            color={isDark ? "#E2E8F0" : "#334155"}
          />
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

        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={handleTransfer}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>
              Confirmar transferencia
            </ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
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
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: "#0F172A",
  },
  inputDark: {
    backgroundColor: "#1E293B",
    color: "#E2E8F0",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
