import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Share, StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

// ========================
// Presentational component
// ========================
export type BankInfoProps = {
    bankName: string;
    clabe: string; // 18 dígitos México
    accountNumber: string;
    alias?: string;
    holderName: string;
};

type Props = {
    data: BankInfoProps;
};

export function RecibirScreen({ data }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const qrRef = useRef<any>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

    const copyToClipboard = async (label: string, value: string) => {
        await Clipboard.setStringAsync(value);
        setCopiedLabel(`${label} copiado`);
    };

    useEffect(() => {
        if (!copiedLabel) return;
        const t = setTimeout(() => setCopiedLabel(null), 1800);
        return () => clearTimeout(t);
    }, [copiedLabel]);

    const shareText = async () => {
        const message = `Banco: ${data.bankName}
Titular: ${data.holderName}
CLABE: ${data.clabe}
Cuenta: ${data.accountNumber}${data.alias ? `
Alias: ${data.alias}` : ""}`;
        try {
            await Share.share({ message });
        } catch { }
    };

    // Exporta QR como PNG y abre el share sheet
    const exportQrAndShare = async () => {
        if (!qrRef.current) return;
        setIsExporting(true);
        try {
            const dataURL: string = await new Promise((resolve, reject) => {
                qrRef.current.toDataURL((d: string) => (d ? resolve(d) : reject("no-data")));
            });
            const cacheDir = ((FileSystem as any).cacheDirectory ?? (FileSystem as any).documentDirectory) || "";
            const filename = `${cacheDir}clabe_qr.png`;
            await FileSystem.writeAsStringAsync(filename, dataURL, {
                encoding: "base64",
            });
            await Share.share({ url: filename, title: "CLABE QR" });
        } catch (err) {
            // noop: podrías conectar con tu logger interno
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.headerRow}>
                <ThemedText style={[styles.title, { color: Colors[isDark ? "light" : "dark"].text }]}>
                    Recibir dinero
                </ThemedText>
                <Pressable onPress={shareText} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Compartir datos bancarios">
                    <IconSymbol name="square.and.arrow.up" size={10} color={Colors[isDark ? "light" : "dark"].tint} />
                </Pressable>
            </View>

            <View style={[styles.card, { backgroundColor: isDark ? "#101214" : "#fafafa", borderColor: isDark ? "#1d2126" : "#e7e7e7" }]}>
                <FieldRow label="Banco" value={data.bankName} onCopy={() => copyToClipboard("Banco", data.bankName)} />
                <FieldRow label="Titular" value={data.holderName} onCopy={() => copyToClipboard("Titular", data.holderName)} />
                <FieldRow label="CLABE" value={data.clabe} mono onCopy={() => copyToClipboard("CLABE", data.clabe)} />
                <FieldRow label="Cuenta" value={data.accountNumber} mono onCopy={() => copyToClipboard("Cuenta", data.accountNumber)} />
                {Boolean(data.alias) && (
                    <FieldRow label="Alias" value={data.alias!} onCopy={() => copyToClipboard("Alias", data.alias!)} />
                )}
            </View>

            <View style={[styles.qrCard, { borderColor: isDark ? "#1d2126" : "#e7e7e7" }]}>
                <ThemedText style={styles.qrLabel}>Escanea para depositar</ThemedText>
                <View style={styles.qrContainer}>
                    <QRCode value={data.clabe} size={200} getRef={(c) => (qrRef.current = c)} />

                </View>
                <ThemedText text-align="auto" >Si es necesario, dicta este código numérico</ThemedText>
                <ThemedText text-color="black">012345678901234567</ThemedText>

                <View style={styles.actionsRow}>
                    <Pressable style={styles.actionBtn} onPress={() => copyToClipboard("CLABE", data.clabe)}>
                        <IconSymbol name="doc.on.doc" size={18} color={""} />
                        <ThemedText style={styles.actionText}>Copiar CLABE</ThemedText>
                    </Pressable>
                    <Pressable style={styles.actionBtn} onPress={exportQrAndShare} disabled={isExporting}>
                        <IconSymbol name="arrow.down.to.line" size={18} color={""} />
                        <ThemedText style={styles.actionText}>{isExporting ? "Exportando..." : "Compartir QR"}</ThemedText>
                    </Pressable>
                </View>
            </View>

            {copiedLabel && (
                <View style={styles.toast} accessibilityLiveRegion="polite">
                    <IconSymbol name="checkmark" size={16} color={""} />
                    <ThemedText style={styles.toastText}>{copiedLabel}</ThemedText>
                </View>
            )}
        </ThemedView>
    );
}

// ========================
// UI Subcomponent
// ========================
function FieldRow({ label, value, onCopy, mono }: { label: string; value: string; onCopy: () => void; mono?: boolean }) {
    return (
        <View style={styles.row}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <View style={styles.valueRow}>
                <ThemedText style={[styles.value, mono && styles.monospaced]} numberOfLines={1}>
                    {value}
                </ThemedText>
                <Pressable onPress={onCopy} style={styles.smallBtn} accessibilityRole="button" accessibilityLabel={`Copiar ${label}`}>
                    <IconSymbol name="doc.on.doc" size={16} color={""} />
                </Pressable>
            </View>
        </View>
    );
}

// ========================
// Optional: Contenedor de integración
// ========================
// Si ya tienes un store/context global, mapea ahí tus campos y pásalos al componente presentacional.
// Ejemplo con un "useAppStore" (ajústalo a tu proyecto):
// import { useAppStore } from "@/store/app";
// export default function RecibirScreenContainer() {
//   const account = useAppStore((s) => s.account);
//   const data: BankInfoProps = {
//     bankName: account?.bankName ?? "",
//     clabe: account?.clabe ?? "",
//     accountNumber: account?.number ?? "",
//     alias: account?.alias ?? undefined,
//     holderName: account?.holderName ?? "",
//   };
//   return <RecibirScreen data={data} />;
// }

// Si no tienes store, exporta directamente con datos hasta que conectes el backend:
export default function RecibirScreenDemo() {
    const data: BankInfoProps = {
        bankName: "Capital One",
        clabe: "012345678901234567",
        accountNumber: "1234567890",
        alias: "ROCAEL.PAGO",
        holderName: "Rocael Lopez Cruz",
    };
    return <RecibirScreen data={data} />;
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    title: { fontSize: 22, fontFamily: Fonts.sans, fontWeight: "700" },
    card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
    row: { marginBottom: 10 },
    label: { fontSize: 12, opacity: 0.8 },
    valueRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    value: { fontSize: 16, marginRight: 8, flex: 1 },
    monospaced: { fontFamily: "monospace", fontSize: 16, letterSpacing: 1.2 },
    smallBtn: { padding: 8 },
    iconButton: { padding: 6 },
    qrCard: { alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1 },
    qrLabel: { fontSize: 14, marginBottom: 12 },
    qrContainer: { padding: 10, backgroundColor: "white", borderRadius: 8 },
    actionsRow: { flexDirection: "row", marginTop: 12 },
    actionBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 6, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.06)" },
    actionText: { marginLeft: 8 },
    toast: { position: "absolute", left: 16, right: 16, bottom: 24, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "rgba(0,0,0,0.75)", flexDirection: "row", alignItems: "center", gap: 8 },
    toastText: { color: "#fff" },
});

