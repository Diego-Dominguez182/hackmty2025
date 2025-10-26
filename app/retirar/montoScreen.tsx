import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

const PRESET_MONTOS = [100, 200, 300, 500, 1000, 1500];

const formatMoney = (n: number | string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

export default function MontoScreen() {
  const navigation = useNavigation<any>();
  const scheme = useColorScheme() ?? "light";
  type Palette = {
    background: string;
    primary: string;
    onPrimary: string;
    muted: string;
    border: string;
    text: string;
    card: string;
  };
  const palette = Colors[scheme] as unknown as Palette;
  const [monto, setMonto] = useState<string>("");

  const isValid = useMemo(() => {
    const v = Number(monto);
    return Number.isFinite(v) && v > 0 && v % 100 === 0;
  }, [monto]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <ThemedText type="title" style={styles.title}>
        Retiro sin tarjeta
      </ThemedText>

      <View style={styles.grid}>
        {PRESET_MONTOS.map((value) => {
          const selected = monto === String(value);
          return (
            <TouchableOpacity
              key={value}
              onPress={() => setMonto(String(value))}
              style={[
                styles.chip,
                {
                  borderColor: palette.primary,
                  backgroundColor: selected ? palette.primary : "transparent",
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Monto ${value}`}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  { color: selected ? palette.onPrimary : palette.primary },
                ]}
              >
                {formatMoney(value)}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInput
        placeholder="Otro monto"
        placeholderTextColor={palette.muted}
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto}
        style={[
          styles.input,
          {
            borderColor: palette.border,
            color: palette.text,
            backgroundColor: palette.card,
          },
        ]}
      />

      <ThemedText style={[styles.helper, { color: palette.muted }]}>
        Usa solo múltiplos de 100.
      </ThemedText>

      <TouchableOpacity
        disabled={!isValid}
        onPress={() => navigation.navigate("retirar/conceptoScreen", { monto })}
        style={[
          styles.cta,
          { backgroundColor: palette.primary, opacity: isValid ? 1 : 0.5 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isValid }}
      >
        <ThemedText style={[styles.ctaText, { color: palette.onPrimary }]}>Continuar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { textAlign: "center", marginBottom: 24, fontFamily: Fonts.sans, fontWeight: "600", fontSize: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "30%",
    alignItems: "center",
  },
  chipText: { fontFamily: Fonts.sans, fontWeight: "600", fontSize: 16 },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sans,
    fontWeight: "400",
    fontSize: 16,
  },
  helper: { marginTop: 8, fontSize: 12 },
  cta: { marginTop: 20, paddingVertical: 16, borderRadius: 12 },
  ctaText: { textAlign: "center", fontFamily: Fonts.sans, fontWeight: "600", fontSize: 16 },
});
