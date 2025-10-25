// app/(tabs)/payScreen.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

type PayMode = "servicio" | "tarjeta";

export default function PayScreen() {
  const colorScheme = useColorScheme();
  const isDark = (colorScheme ?? "light") === "dark";
  const tint = Colors[colorScheme ?? "light"].tint;
  const router = useRouter();

  // Si algún día llegas aquí con params, ej: accountId
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();

  // ⚙️ CONFIG API
  const API_KEY = "2cbc508da1f232ec2f27f7fc79a2d9ba";
  const ACCOUNT_ID = accountId || "68fc67519683f20dd51a3f65"; // misma cuenta demo que usas en Home

  // 🧭 Estado del formulario
  const [mode, setMode] = useState<PayMode>("servicio");
  const [amount, setAmount] = useState<string>("");
  const [concept, setConcept] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Servicio (merchant) seleccionado
  const [serviceKey, setServiceKey] = useState<string>("internet");
  // Tarjeta destino (id de cuenta de crédito)
  const [creditAccountId, setCreditAccountId] = useState<string>("68fc67519683f20dd51a3f65"); // ajusta aquí si tienes cuenta crédito distinta

  // 🔖 Catálogo simple de servicios -> merchant_id de Nessie
  // Puedes poblarlos desde /merchants y guardar ids reales
  // o usar estos de ejemplo (reemplázalos por los que obtengas).
  const SERVICES = useMemo(() => ([
    { key: "internet",  label: "Internet",      icon: "wifi",                 merchantId: "57cf75cea73e494d8675ec49" },
    { key: "luz",       label: "Luz",           icon: "bolt.fill",            merchantId: "57cf75cea73e494d8675ec4a" },
    { key: "agua",      label: "Agua",          icon: "drop.fill",            merchantId: "57cf75cea73e494d8675ec4b" },
    { key: "telefono",  label: "Teléfono",      icon: "phone.fill",           merchantId: "57cf75cea73e494d8675ec4c" },
  ]), []);

  const selectedService = SERVICES.find(s => s.key === serviceKey)!;

  const money = (n: number) =>
    Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  // ✅ Validaciones básicas
  const parsedAmount = Number(amount);
  const canSubmit =
    !loading &&
    parsedAmount > 0 &&
    (mode === "servicio" ? Boolean(selectedService?.merchantId) : Boolean(creditAccountId));

  // 🧪 Helper request
  async function jsonFetch(url: string, init?: RequestInit) {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
    }
    return res.json();
  }

  // 🚀 Submit
  const handlePay = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      if (mode === "servicio") {
        // FLOW: Purchase (cargo al comercio)
        // POST /accounts/:id/purchases?key=API_KEY
        // body esperado por Nessie:
        // {
        //   "merchant_id": "...",
        //   "medium": "balance",
        //   "purchase_date": "YYYY-MM-DD",
        //   "amount": number,
        //   "description": "texto"
        // }
        const body = {
          merchant_id: selectedService.merchantId,
          medium: "balance",
          purchase_date: today,
          amount: parsedAmount,
          description: concept || `Pago ${selectedService.label}`,
        };

        const data = await jsonFetch(
          `http://api.nessieisreal.com/accounts/${ACCOUNT_ID}/purchases?key=${API_KEY}`,
          { method: "POST", body: JSON.stringify(body) }
        );

        Alert.alert(
          "Pago realizado",
          `Servicio: ${selectedService.label}\nMonto: ${money(parsedAmount)}\nFolio: ${data?.objectCreated?._id || "—"}`
        );
      } else {
        // FLOW: Transferencia (pago de tarjeta)
        // POST /accounts/:id/transfers?key=API_KEY
        // body esperado por Nessie:
        // {
        //   "medium": "balance",
        //   "payee_id": "idCuentaDestino",
        //   "amount": number,
        //   "transaction_date": "YYYY-MM-DD",
        //   "description": "texto"
        // }
        const body = {
          medium: "balance",
          payee_id: String(creditAccountId),
          amount: parsedAmount,
          transaction_date: today,
          description: concept || "Pago de tarjeta",
        };

        const data = await jsonFetch(
          `http://api.nessieisreal.com/accounts/${ACCOUNT_ID}/transfers?key=${API_KEY}`,
          { method: "POST", body: JSON.stringify(body) }
        );

        Alert.alert(
          "Pago de tarjeta enviado",
          `Destino: ${creditAccountId}\nMonto: ${money(parsedAmount)}\nFolio: ${data?.objectCreated?._id || "—"}`
        );
      }

      // Limpia el form
      setAmount("");
      setConcept("");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "No se pudo procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <IconSymbol name="chevron.left" size={22} color={isDark ? "#E2E8F0" : "#0F172A"} />
          </TouchableOpacity>
          <ThemedText type="title" style={{ fontSize: 20, fontFamily: Fonts.rounded }}>Realizar pago</ThemedText>
          <View style={{ width: 22 }} />
        </View>

        {/* Modo de pago */}
        <ThemedText type="subtitle" style={{ marginTop: 8, marginBottom: 10 }}>¿Qué quieres pagar?</ThemedText>
        <View style={styles.segment}>
          <SegmentItem
            selected={mode === "servicio"}
            onPress={() => setMode("servicio")}
            icon="creditcard.fill"
            label="Servicio"
          />
          <SegmentItem
            selected={mode === "tarjeta"}
            onPress={() => setMode("tarjeta")}
            icon="rectangle.and.arrow.up.right.and.arrow.down.left"
            label="Tarjeta"
          />
        </View>

        {/* Bloque servicio */}
        {mode === "servicio" && (
          <ThemedView style={[styles.card, { backgroundColor: isDark ? "#0B3B5E" : "#E0F2FE" }]}>
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Selecciona servicio</ThemedText>
            <View style={styles.servicesGrid}>
              {SERVICES.map(s => (
                <Pressable key={s.key} onPress={() => setServiceKey(s.key)} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                  <View style={[
                    styles.serviceItem,
                    serviceKey === s.key && { borderColor: tint, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "white" }
                  ]}>
                    <IconSymbol name={s.icon as any} size={20} color={tint} />
                    <ThemedText style={styles.serviceLabel}>{s.label}</ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          </ThemedView>
        )}

        {/* Bloque tarjeta */}
        {mode === "tarjeta" && (
          <ThemedView style={[styles.card, { backgroundColor: isDark ? "#042F2E" : "#D1FAE5" }]}>
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Cuenta de tarjeta a pagar</ThemedText>
            <View style={styles.input}>
              <IconSymbol name="creditcard" size={18} color={isDark ? "#94A3B8" : "#64748B"} />
              <TextInput
                placeholder="ID de cuenta crédito destino"
                placeholderTextColor={isDark ? "#94A3B8" : "#64748B"}
                value={creditAccountId}
                onChangeText={setCreditAccountId}
                style={styles.inputText}
                autoCapitalize="none"
              />
            </View>
            <ThemedText style={{ opacity: 0.7, marginTop: 6, fontSize: 12 }}>
              Tip: busca tus cuentas con `GET /accounts?type=Credit Card` y copia el <ThemedText type="defaultSemiBold">_id</ThemedText>.
            </ThemedText>
          </ThemedView>
        )}

        {/* Monto y concepto */}
        <ThemedView style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Detalle del pago</ThemedText>

          <View style={styles.input}>
            <IconSymbol name="dollarsign.circle" size={18} color={isDark ? "#94A3B8" : "#64748B"} />
            <TextInput
              placeholder="Monto (MXN)"
              placeholderTextColor={isDark ? "#94A3B8" : "#64748B"}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              style={styles.inputText}
            />
          </View>

          <View style={[styles.input, { marginTop: 10 }]}>
            <IconSymbol name="text.cursor" size={18} color={isDark ? "#94A3B8" : "#64748B"} />
            <TextInput
              placeholder={mode === "servicio" ? "Concepto (ej. Folio, periodo, etc.)" : "Concepto (ej. Pago mensual)"}
              placeholderTextColor={isDark ? "#94A3B8" : "#64748B"}
              value={concept}
              onChangeText={setConcept}
              style={styles.inputText}
            />
          </View>

          <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <IconSymbol name="info.circle.fill" size={18} color={tint} />
            <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>
              Se registrará un movimiento {mode === "servicio" ? "de compra (purchase)" : "de transferencia (transfer)"} con fecha de hoy.
            </ThemedText>
          </View>
        </ThemedView>

        {/* Botón pagar */}
        <TouchableOpacity
          disabled={!canSubmit}
          onPress={handlePay}
          activeOpacity={0.85}
          style={[
            styles.payBtn,
            { backgroundColor: canSubmit ? tint : (isDark ? "#334155" : "#CBD5E1") }
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
              <ThemedText style={styles.payBtnLabel}>
                {mode === "servicio" ? "Pagar servicio" : "Pagar tarjeta"}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// --- Componentes UI pequeños para mantener tu estilo ---
function SegmentItem({
  selected,
  onPress,
  icon,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  icon: string;
  label: string;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
      <View style={[
        styles.segmentItem,
        selected ? styles.segmentSelected : styles.segmentUnselected
      ]}>
        <IconSymbol name={icon as any} size={18} color={selected ? "#fff" : "#0F172A"} />
        <ThemedText style={{ fontWeight: "700", color: selected ? "#fff" : "#0F172A" }}>{label}</ThemedText>
      </View>
    </Pressable>
  );
}

const CARD_RADIUS = 18;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  segment: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  segmentItem: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
  },
  segmentSelected: {
    backgroundColor: "#0C4A6E",
    borderColor: "#0C4A6E",
  },
  segmentUnselected: {
    backgroundColor: "#E2E8F0",
    borderColor: "#CBD5E1",
  },
  card: {
    borderRadius: CARD_RADIUS,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  serviceItem: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    gap: 6,
  },
  serviceLabel: { fontSize: 12, fontWeight: "700" },

  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(100,116,139,0.25)",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },

  payBtn: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  payBtnLabel: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
