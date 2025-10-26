import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function ConceptoScreen() {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];
  const navigation = useNavigation();
  const { params } = useRoute<any>();
  const { monto } = params;
  const [concepto, setConcepto] = useState("");

  return (
    <ThemedView style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <ThemedText type="title" style={styles.title}>
        Retiro sin tarjeta
      </ThemedText>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.tint, shadowColor: "#000" },
        ]}
      >
        <ThemedText style={[styles.cardLabel, { color: palette.text }]}>Monto</ThemedText>
        <ThemedText style={[styles.cardAmount, { color: palette.text }]}>
          ${Number(monto).toFixed(2)}
        </ThemedText>
      </View>

      <ThemedText style={[styles.label, { color: palette.text }]}>Concepto</ThemedText>
      <TextInput
        placeholder="Concepto (opcional)"
        placeholderTextColor={palette.icon}
        value={concepto}
        onChangeText={setConcepto}
        style={[
          styles.input,
          {
            borderColor: palette.tint,
            color: palette.text,
            backgroundColor: palette.background,
          },
        ]}
      />

      <TouchableOpacity
        onPress={() => (navigation as any).navigate("retirar/confirmarScreen", { monto, concepto })}
        style={[styles.cta, { backgroundColor: palette.tint }]}
      >
        <ThemedText style={[styles.ctaText, { color: palette.text }]}>Continuar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { textAlign: "center", marginBottom: 24, fontFamily: Fonts.sans, fontWeight: "600", fontSize: 20 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  cardLabel: { fontFamily: Fonts.sans, fontSize: 14, opacity: 0.9 },
  cardAmount: { marginTop: 4, fontFamily: Fonts.sans, fontSize: 24 },
  label: { fontFamily: Fonts.sans, fontSize: 18, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sans,
    fontSize: 16,
    marginBottom: 22,
  },
  cta: { paddingVertical: 16, borderRadius: 12 },
  ctaText: { textAlign: "center", fontFamily: Fonts.sans, fontSize: 16 },
});
