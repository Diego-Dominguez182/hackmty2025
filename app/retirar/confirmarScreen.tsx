import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function ConfirmarScreen() {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme] as unknown as {
    text: string;
    background: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
    card: string;
    border: string;
    muted: string;
    primary: string;
    onPrimary: string;
  };
  const navigation = useNavigation();
  const { params } = useRoute<any>();
  const { monto, concepto } = params;

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <ThemedText type="title" style={styles.title}>
        Retiro sin tarjeta
      </ThemedText>

      <View style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <ThemedText style={[styles.sheetLabel, { color: palette.muted }]}>Monto a retirar</ThemedText>
        <ThemedText style={[styles.sheetAmount, { color: palette.text }]}>
          ${Number(monto).toFixed(2)}
        </ThemedText>
        <ThemedText style={[styles.sheetHint, { color: palette.muted }]}>
          Este retiro no genera comisión.
        </ThemedText>

        {concepto?.length > 0 && (
          <View style={styles.conceptRow}>
            <ThemedText style={[styles.conceptLabel, { color: palette.muted }]}>Concepto</ThemedText>
            <ThemedText style={[styles.conceptText, { color: palette.text }]} numberOfLines={2}>
              {concepto}
            </ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => {
          alert("Retiro confirmado ✅");
          navigation.goBack();
        }}
        style={[styles.cta, { backgroundColor: palette.primary }]}
      >
        <ThemedText style={[styles.ctaText, { color: palette.onPrimary }]}>Confirmar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { textAlign: "center", marginBottom: 24, fontFamily: Fonts.sans, fontSize: 20 },
  sheet: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  sheetLabel: { fontFamily: Fonts.sans, fontSize: 14 },
  sheetAmount: { marginTop: 6, fontFamily: Fonts.sans, fontSize: 28 },
  sheetHint: { marginTop: 6, fontFamily: Fonts.sans, fontSize: 13 },
  conceptRow: { marginTop: 16 },
  conceptLabel: { fontFamily: Fonts.sans, fontSize: 14, marginBottom: 4 },
  conceptText: { fontFamily: Fonts.sans, fontSize: 16 },
  cta: { paddingVertical: 16, borderRadius: 12 },
  ctaText: { textAlign: "center", fontFamily: Fonts.sans, fontSize: 16 },
});
