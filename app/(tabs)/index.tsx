import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl, // <--- AÑADIDO (1. Importar)
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const [chatVisible, setChatVisible] = useState(false);
    const [hidden, setHidden] = useState(false);
    const router = useRouter();

    const [account, setAccount] = useState<any | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [accError, setAccError] = useState<string | null>(null);
    const [accLoading, setAccLoading] = useState<boolean>(true);
    const [simpleMode, setSimpleMode] = useState<boolean>(false);

    const [refreshing, setRefreshing] = useState(false); // <--- AÑADIDO (2. Declarar estado)

    const tintColor = Colors[colorScheme ?? "light"].tint;
    const isDark = (colorScheme ?? "light") === "dark";
    const { width } = useWindowDimensions();
    const [visibleCount, setVisibleCount] = useState(8);

    // --- Chat state ---
    const [messages, setMessages] = useState<
        { id: string; role: "user" | "assistant"; text: string }[]
    >([
        {
            id: "welcome",
            role: "assistant",
            text: "¡Hola! 👋 Soy tu asistente financiero. ¿En qué puedo ayudarte hoy?",
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [sending, setSending] = useState(false);

    const ACCOUNT_ID = account?._id ?? "68fc67519683f20dd51a3f65";

    const money = (n: number) =>
        Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

    const humanDate = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
        } catch {
            return iso;
        }
    };

    const pickIcon = (desc: string = "") => {
        // ... (tu función pickIcon - sin cambios)
        const s = desc.toLowerCase();
        if (s.includes("taxi")) return "car.fill";
        if (s.includes("transporte")) return "tram.fill.tunnel";
        if (s.includes("internet")) return "wifi";
        if (s.includes("hospedaje")) return "bed.double.fill";
        if (s.includes("alimentos") || s.includes("cena")) return "fork.knife";
        if (s.includes("compras") || s.includes("super")) return "cart.fill";
        if (s.includes("servicios")) return "wrench.and.screwdriver.fill";
        if (s.includes("mantenimiento")) return "gearshape.2.fill";
        if (s.includes("tour") || s.includes("eventos")) return "ticket.fill";
        if (s.includes("gasolina")) return "fuelpump.fill";
        if (s.includes("souvenirs") || s.includes("propinas")) return "gift.fill";
        return "arrow.up.right.circle.fill";
    };

    const visibleTxs = useMemo(
        () => transactions.slice(0, visibleCount),
        [transactions, visibleCount]
    );

    const CLAUDE_PROXY_URL = "http://172.20.10.6:3000/claude";


    const sendMessage = async () => {
        const text = inputText.trim();
        if (!text) return;
        const userMsg = { id: Date.now().toString(), role: "user" as const, text };
        setMessages((m) => [...m, userMsg]);
        setInputText("");
        Keyboard.dismiss();
        setSending(true);

        try {
            const res = await fetch(CLAUDE_PROXY_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            if (!res.ok) {
                const body = await res.text();
                throw new Error(body || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const replyText = data.reply ?? data.output_text ?? JSON.stringify(data);
            const assistantMsg = {
                id: (Date.now() + 1).toString(),
                role: "assistant" as const,
                text: String(replyText),
            };
            setMessages((m) => [...m, assistantMsg]);
        } catch (err: any) {
            const errMsg = {
                id: (Date.now() + 2).toString(),
                role: "assistant" as const,
                text: "Error al conectar con el asistente: " + (err?.message ?? "desconocido"),
            };
            setMessages((m) => [...m, errMsg]);
            console.error("Chat error:", err);
        } finally {
            setSending(false);
        }
    };

    // --- LÓGICA DE CARGA (Sin cambios, ya incluía setRefreshing) ---
    const fetchData = useCallback(async (isRefreshing = false) => {
        if (!isRefreshing) {
            setAccLoading(true);
        }
        setAccError(null);

        const cacheBust = `&_cb=${new Date().getTime()}`;
        const antiCacheHeaders = new Headers();
        antiCacheHeaders.append('Cache-Control', 'no-cache, no-store, must-revalidate');
        antiCacheHeaders.append('Pragma', 'no-cache');
        antiCacheHeaders.append('Expires', '0');

        try {
            const resAcc = await fetch(
                `http://api.nessieisreal.com/accounts/68fc67519683f20dd51a3f65?key=2cbc508da1f232ec2f27f7fc79a2d9ba${cacheBust}`,
                { headers: antiCacheHeaders }
            );
            if (!resAcc.ok) throw new Error(`HTTP ${resAcc.status} (Cuenta)`);
            const dataAccount = await resAcc.json();

            const resPurchases = await fetch(
                `http://api.nessieisreal.com/accounts/68fc67519683f20dd51a3f65/purchases?key=2cbc508da1f232ec2f27f7fc79a2d9ba${cacheBust}`,
                { headers: antiCacheHeaders }
            );
            if (!resPurchases.ok)
                throw new Error(`HTTP ${resPurchases.status} (Compras)`);
            const dataPurchases = await resPurchases.json();

            const resTransfers = await fetch(
                `http://api.nessieisreal.com/accounts/68fc67519683f20dd51a3f65/transfers?key=2cbc508da1f232ec2f27f7fc79a2d9ba${cacheBust}`,
                { headers: antiCacheHeaders }
            );
            if (!resTransfers.ok)
                throw new Error(`HTTP ${resTransfers.status} (Transferencias)`);
            const dataTransfers = await resTransfers.json();

            setAccount(dataAccount);
            // 1. Combinar ambas listas
            const allTransactions = [...dataPurchases, ...dataTransfers];

            // 2. Ordenar la lista combinada por fecha (más reciente primero)
            allTransactions.sort((a, b) => {
                try {
                    const dateA = new Date(a.transaction_date || a.purchase_date); //
                    const dateB = new Date(b.transaction_date || b.purchase_date); //
                    return dateB.getTime() - dateA.getTime(); //
                } catch (e) {
                    console.error("Error al parsear fecha para ordenar:", e, a, b); // Ver si hay errores
                    return 0; // No mover si hay error al convertir la fecha
                }
            });

            // 3. Guardar la lista YA ORDENADA en el estado
            setTransactions(allTransactions);
        } catch (err: any) {
            setAccError(err?.message ?? "Error desconocido");
            console.error("Error al obtener datos:", err);
        } finally {
            if (!isRefreshing) {
                setAccLoading(false);
            }
            setRefreshing(false); // Detener el "pull-to-refresh"
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchData(false);
        }, [fetchData])
    );

    // --- FUNCIÓN onRefresh (Sin cambios, ya estaba correcta) ---
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData(true);
    }, [fetchData]);

    // ... (El resto de tus constantes: H_PADDING, quickActions, frequentContacts, etc. no cambian) ...
    const H_PADDING = 16;
    const GRID_GAP = 10;
    const actionSize = Math.floor((width - H_PADDING * 2 - GRID_GAP * 3) / 4);
    const balanceFont = width < 360 ? 28 : width < 400 ? 32 : 40;

    const balanceNumber = Number(account?.balance ?? 0);
    const balanceText = hidden
        ? "•••••••"
        : balanceNumber.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
        });

    const quickActions = useMemo(
        () => [
            { key: "enviar", label: "Enviar", bg: "#0F766E", localIcon: require('@/assets/images/send_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png') },
            { key: "recibir", label: "Recibir", bg: "#065F46", localIcon: require('@/assets/images/approval_delegation_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png') },
            { key: "pagar", label: "Pagar", bg: "#0C4A6E", localIcon: require('@/assets/images/payments_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png') },
            { key: "cambiar", label: "Retirar", bg: "#10B981", localIcon: require('@/assets/images/payment_arrow_down_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png') },
        ],
        []
    );

    const frequentContacts = useMemo(
        () => [
            { id: "1", name: "Yahir Zapata", account: "9212408309123456", avatar: "👨", lastAmount: 500 },
            { id: "2", name: "Angel Arturo", account: "9221082014123456", avatar: "👨", lastAmount: 1200 },
            { id: "3", name: "Rocael Lopez", account: "9211541234123456", avatar: "👨", lastAmount: 800 },
        ],
        []
    );


    return (
        <View style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
            <View
                style={[
                    styles.navbar,
                    { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
                ]}
            >
                <ThemedText type="defaultSemiBold" style={styles.navbarTitle}>
                    Modo simple
                </ThemedText>
                <Switch
                    value={simpleMode}
                    onValueChange={setSimpleMode}
                    trackColor={{ false: "#E2E8F0", true: tintColor }}
                    thumbColor={simpleMode ? "#FFFFFF" : "#F4F4F5"}
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                // <--- AÑADIDO (3. Conectar el RefreshControl) ---
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={isDark ? "#FFFFFF" : "#0369A1"} // Color de la ruedita
                    />
                }
            // --- FIN DE LA ADICIÓN ---
            >
                {simpleMode ? (
                    // ... (Tu UI de Modo Simple - sin cambios) ...
                    <View style={styles.simpleModeContainer}>
                        <TouchableOpacity
                            style={[
                                styles.simpleCard,
                                { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
                            ]}
                            onPress={() => setHidden((v) => !v)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.simpleCardHeader}>
                                <IconSymbol
                                    name="creditcard.fill"
                                    size={32}
                                    color={tintColor}
                                />
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={styles.simpleCardTitle}
                                >
                                    Consultar Saldo
                                </ThemedText>
                            </View>
                            <ThemedText
                                style={[styles.simpleCardAmount, { fontSize: balanceFont }]}
                            >
                                {balanceText}
                            </ThemedText>
                            <ThemedText style={styles.simpleCardSubtitle}>
                                Toca para {hidden ? "mostrar" : "ocultar"} saldo
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.simpleCard,
                                { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
                            ]}
                            activeOpacity={0.8}
                        >
                            <View style={styles.simpleCardHeader}>
                                <IconSymbol name="paperplane.fill" size={32} color="#10B981" />
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={styles.simpleCardTitle}
                                >
                                    Transferir
                                </ThemedText>
                            </View>
                            <ThemedText style={styles.simpleCardSubtitle}>
                                Enviar dinero a contactos frecuentes
                            </ThemedText>
                            <View style={styles.contactPreview}>
                                {frequentContacts.slice(0, 3).map((contact) => (
                                    <View key={contact.id} style={styles.contactItem}>
                                        <Pressable
                                            onPress={() => router.push({
                                                pathname: "/(tabs)/transferScreen",
                                                params: {
                                                    to: contact.account,
                                                    name: contact.name,
                                                    amount: contact.lastAmount.toString(),
                                                    description: "Transferencia a " + contact.name

                                                }
                                            })}>
                                            <ThemedText style={styles.contactAvatar}>
                                                {contact.avatar}
                                            </ThemedText>
                                            <ThemedText style={styles.contactName} numberOfLines={1}>
                                                {contact.name}
                                            </ThemedText>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.simpleCard,
                                { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
                            ]}
                            onPress={() => router.push("/(tabs)/transferScreen")}
                            activeOpacity={0.8}
                        >
                            <View style={styles.simpleCardHeader}>
                                <IconSymbol
                                    name="tray.and.arrow.down.fill"
                                    size={32}
                                    color="#0C4A6E"
                                />
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={styles.simpleCardTitle}
                                >
                                    Depositar
                                </ThemedText>
                            </View>
                            <ThemedText style={styles.simpleCardSubtitle}>
                                Agregar dinero a tu cuenta
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // ... (Tu UI de Modo Normal - sin cambios en la estructura) ...
                    <>
                        <View
                            style={[
                                styles.balanceCard,
                                {
                                    backgroundColor: isDark ? "#0C4A6E" : "#0369A1",
                                    marginHorizontal: H_PADDING,
                                },
                            ]}
                        >
                            <View style={styles.balanceHeaderRow}>
                                <ThemedText style={styles.balanceTitle}>
                                    Saldo disponible
                                </ThemedText>
                                <TouchableOpacity
                                    onPress={() => setHidden((v) => !v)}
                                    hitSlop={8}
                                >
                                    <IconSymbol
                                        name={hidden ? "eye.slash.fill" : "eye.fill"}
                                        size={20}
                                        color="#E0F2FE"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.balanceMainRow}>
                                <ThemedText
                                    style={[styles.balanceAmount, { fontSize: balanceFont }]}
                                >
                                    {balanceText}
                                </ThemedText>
                                <View style={styles.badge}>
                                    <IconSymbol
                                        name="chart.line.uptrend.xyaxis"
                                        size={13}
                                        color="#FFFFFF"
                                    />
                                    <ThemedText style={styles.badgeText}>+2.3%</ThemedText>
                                </View>
                            </View>

                            <View style={styles.sparklineWrap}>
                                <View style={styles.sparklineShadow} />
                                <View style={styles.sparklineLine} />
                            </View>

                            <View style={styles.daysRow}>
                                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                                    <ThemedText key={`${d}-${i}`} style={styles.dayText}>
                                        {d}
                                    </ThemedText>
                                ))}
                            </View>

                            <ThemedText style={styles.accountHint}>
                                Cuenta de ahorros •••• 4892
                            </ThemedText>
                        </View>

                        <View
                            style={[styles.sectionHeader, { paddingHorizontal: H_PADDING }]}
                        >
                            <ThemedText type="subtitle">Acciones rápidas</ThemedText>
                        </View>

                        <View
                            style={[
                                styles.quickGrid,
                                { paddingHorizontal: H_PADDING, columnGap: GRID_GAP },
                            ]}
                        >
                            {quickActions.map((a) => (
                                <Pressable
                                    key={a.key}
                                    onPress={() => {
                                        if (a.key === "enviar") {
                                            router.push("/(tabs)/transferScreen");
                                        } else if (a.key === "recibir") {
                                            router.push("/(tabs)/recibirScreen");
                                        } else if (a.key === "pagar") {
                                            router.push("/(tabs)/payScreen");
                                        } else if (a.key === "cambiar") {
                                            router.push("/retirar/montoScreen");

                                        }
                                    }}
                                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                                >
                                    <View style={styles.quickItem}>
                                        <View
                                            style={[
                                                styles.quickIconBox,
                                                {
                                                    width: actionSize,
                                                    height: actionSize,
                                                    borderRadius: Math.floor(actionSize * 0.28),
                                                    backgroundColor: a.bg,
                                                },
                                            ]}
                                        >
                                            <Image
                                                source={a.localIcon}
                                                style={{
                                                    width: Math.floor(actionSize * 0.55),
                                                    height: Math.floor(actionSize * 0.55),
                                                }}
                                                resizeMode="contain"
                                            />
                                        </View>
                                        <ThemedText style={styles.quickLabel}>{a.label}</ThemedText>
                                    </View>
                                </Pressable>
                            ))}
                        </View>

                        <View
                            style={[
                                styles.transactionsHeaderRow,
                                { paddingHorizontal: H_PADDING },
                            ]}
                        >
                            <ThemedText type="subtitle">Transacciones recientes</ThemedText>
                            <Pressable hitSlop={8} onPress={() => { }}>
                                <ThemedText style={[styles.link, { color: tintColor }]}>
                                    Ver todas
                                </ThemedText>
                            </Pressable>
                        </View>

                        <ThemedView
                            style={[
                                styles.transactionsList,
                                { paddingHorizontal: H_PADDING },
                            ]}
                        >
                            {/* <--- MODIFICADO (4. Mejorar lógica de carga) --- */}
                            {accLoading && !refreshing && (
                                <ThemedText style={{ opacity: 0.7, paddingVertical: 12 }}>
                                    Cargando transacciones…
                                </ThemedText>
                            )}

                            {!accLoading && visibleTxs.length === 0 && (
                                <ThemedText style={{ opacity: 0.7, paddingVertical: 12 }}>
                                    No hay transacciones para mostrar.
                                </ThemedText>
                            )}

                            {!accLoading &&
                                visibleTxs.map((tx) => {
                                    const outgoing = tx.payer_id === ACCOUNT_ID;
                                    const amountTxt = `${outgoing ? "-" : "+"}${money(
                                        tx.amount
                                    )}`;
                                    const amountStyle = outgoing
                                        ? styles.txAmountNeg
                                        : styles.txAmountPos;
                                    const iconName = pickIcon(tx.description);
                                    const cancelled =
                                        String(tx.status || "").toLowerCase() === "cancelled";

                                    return (
                                        <Pressable
                                            key={tx._id}
                                            style={[
                                                styles.transactionItem,
                                                cancelled && { opacity: 0.55 },
                                            ]}
                                            onPress={() =>
                                                router.push({
                                                    pathname: "/(tabs)/transactionDetailScreen",
                                                    params: {
                                                        id: tx._id,
                                                        tx: encodeURIComponent(JSON.stringify(tx)),
                                                        accountId: ACCOUNT_ID,
                                                    },
                                                })
                                            }
                                        >
                                            <View
                                                style={[
                                                    styles.txIcon,
                                                    {
                                                        backgroundColor: isDark
                                                            ? "rgba(148,163,184,0.15)"
                                                            : "rgba(100,116,139,0.1)",
                                                    },
                                                ]}
                                            >
                                                <IconSymbol
                                                    name={iconName as any}
                                                    size={20}
                                                    color={tintColor}
                                                />
                                            </View>

                                            <View style={styles.txInfo}>
                                                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                                                    {tx.description || "Movimiento"}
                                                </ThemedText>
                                                <ThemedText style={styles.txDate}>
                                                    {humanDate(tx.transaction_date || tx.purchase_date)} •{" "}
                                                    {tx.type?.toUpperCase() || "—"}
                                                </ThemedText>
                                            </View>

                                            <ThemedText type="defaultSemiBold" style={amountStyle}>
                                                {amountTxt}
                                            </ThemedText>
                                        </Pressable>
                                    );
                                })}

                            {visibleCount < transactions.length && (
                                <TouchableOpacity
                                    onPress={() => setVisibleCount((c) => c + 8)}
                                    activeOpacity={0.8}
                                    style={styles.loadMore}
                                >
                                    <ThemedText style={styles.loadMoreText}>
                                        Cargar más
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </ThemedView>
                    </>
                )}
            </ScrollView>

            {/* ... (Tu FAB y Modal - sin cambios) ... */}
            {(
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: tintColor }]}
                    onPress={() => setChatVisible(true)}
                    activeOpacity={0.8}
                >
                    <IconSymbol name="sparkles" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            <Modal
                animationType="slide"
                transparent
                visible={chatVisible}
                onRequestClose={() => setChatVisible(false)}
            >
                <Pressable
                    style={styles.chatOverlay}
                    onPress={() => setChatVisible(false)}
                >
                    <Pressable
                        style={styles.chatBox}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.chatHeader}>
                            <View style={styles.chatHeaderLeft}>
                                <View
                                    style={[styles.aiIndicator, { backgroundColor: tintColor }]}
                                />
                                <ThemedText type="subtitle">Asistente IA</ThemedText>
                            </View>
                            <TouchableOpacity
                                onPress={() => setChatVisible(false)}
                                hitSlop={8}
                            >
                                <IconSymbol
                                    name="xmark.circle.fill"
                                    size={28}
                                    color={isDark ? "#94A3B8" : "#64748B"}
                                />
                            </TouchableOpacity>
                        </View>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            style={{ flex: 1 }}
                        >
                            <View style={styles.chatContent}>
                                <FlatList
                                    data={messages}
                                    keyExtractor={(it) => it.id}
                                    renderItem={({ item }) => (
                                        <View
                                            style={[
                                                styles.messageContainer,
                                                item.role === "assistant"
                                                    ? { alignItems: "flex-start" }
                                                    : { alignItems: "flex-end" },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.messageBubble,
                                                    {
                                                        backgroundColor:
                                                            item.role === "assistant"
                                                                ? isDark
                                                                    ? "#1E293B"
                                                                    : "#F1F5F9"
                                                                : isDark
                                                                    ? "#0B1220"
                                                                    : "#0369A1",
                                                    },
                                                ]}
                                            >
                                                <ThemedText
                                                    style={[
                                                        styles.messageText,
                                                        item.role === "user" && { color: "#FFF" },
                                                    ]}
                                                >
                                                    {item.text}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    )}
                                    contentContainerStyle={{ paddingBottom: 12 }}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>

                            <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" }}>
                                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                    <TextInput
                                        value={inputText}
                                        onChangeText={setInputText}
                                        placeholder="Escribe un mensaje..."
                                        placeholderTextColor="#64748B"
                                        style={{
                                            flex: 1,
                                            paddingVertical: 10,
                                            paddingHorizontal: 14,
                                            borderRadius: 999,
                                            backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
                                            color: isDark ? "#E2E8F0" : "#0F172A",
                                        }}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            // Simulación de activación de voz
                                            alert('Simulando activación de modo voz estilo Bixby/GPT.');
                                        }}
                                        style={{
                                            backgroundColor: '#EAF1FB',
                                            padding: 10,
                                            borderRadius: 12,
                                            marginLeft: 2,
                                        }}
                                    >
                                        <IconSymbol name="mic" size={20} color={tintColor} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={sendMessage}
                                        disabled={sending}
                                        style={{
                                            marginLeft: 6,
                                            backgroundColor: tintColor,
                                            padding: 10,
                                            borderRadius: 12,
                                            opacity: sending ? 0.7 : 1,
                                        }}
                                    >
                                        {sending ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const CARD_RADIUS = 20;

const styles = StyleSheet.create({
    // ... (Todos tus estilos - sin cambios)
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 16,
        paddingBottom: 100,
    },

    balanceCard: {
        borderRadius: CARD_RADIUS,
        padding: 20,
        marginBottom: 4,
        // marginTop: 36, // <--- MODIFICADO (Eliminado para que se alinee con la navbar)
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    balanceHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    balanceTitle: {
        color: "#E0F2FE",
        fontSize: 14,
        fontWeight: "500",
        letterSpacing: 0.3,
    },
    balanceMainRow: {
        marginTop: 10,
        marginBottom: 2,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    balanceAmount: {
        color: "#FFFFFF",
        fontFamily: Fonts.rounded,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    badge: {
        paddingHorizontal: 10,
        height: 26,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        flexDirection: "row",
        gap: 5,
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },

    sparklineWrap: {
        marginTop: 14,
        marginBottom: 4,
        height: 50,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    sparklineShadow: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 10,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 12,
    },
    sparklineLine: {
        position: "absolute",
        left: 10,
        right: 10,
        top: 24,
        height: 3,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.95)",
        transform: [{ skewX: "-5deg" }],
    },

    daysRow: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 8,
    },
    dayText: {
        color: "#BAE6FD",
        fontSize: 12,
        fontWeight: "500",
    },
    accountHint: {
        marginTop: 12,
        color: "#E0F2FE",
        fontSize: 12,
        fontWeight: "500",
    },

    sectionHeader: {
        marginTop: 24,
        marginBottom: 12,
    },

    quickGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    quickItem: {
        alignItems: "center",
        gap: 8,
    },
    quickIconBox: {
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    quickLabel: {
        fontSize: 12,
        fontWeight: "500",
    },

    transactionsHeaderRow: {
        marginTop: 24,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    link: {
        fontSize: 14,
        fontWeight: "600",
    },

    transactionsList: {
        gap: 4,
    },
    transactionItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 12,
    },
    txIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    txInfo: { flex: 1 },
    txDate: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 2,
    },
    txAmountNeg: {
        fontSize: 16,
        fontWeight: "700",
        color: "#EF4444",
    },
    txAmountPos: {
        fontSize: 16,
        fontWeight: "700",
        color: "#10B981",
    },

    fab: {
        position: "absolute",
        right: 20,
        bottom: 50,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        elevation: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },

    chatOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    chatBox: {
        width: "100%",
        height: "70%",
        backgroundColor: "white",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 20,
    },
    chatHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    chatHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    aiIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    chatContent: {
        flex: 1,
        padding: 20,
    },
    messageContainer: {
        alignItems: "flex-start",
    },
    messageBubble: {
        padding: 16,
        borderRadius: 16,
        maxWidth: "85%",
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    loadMore: {
        marginTop: 6,
        marginBottom: 10,
        alignSelf: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "rgba(2,132,199,0.12)",
    },
    loadMoreText: {
        fontWeight: "700",
        letterSpacing: 0.2,
    },

    navbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    navbarTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    simpleModeContainer: {
        padding: 20,
        gap: 16,
    },
    simpleCard: {
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        height: 170,
    },
    simpleCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginBottom: 12,
    },
    simpleCardTitle: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    simpleCardAmount: {
        fontFamily: Fonts.rounded,
        fontWeight: "800",
        letterSpacing: -0.5,
        marginBottom: 4,
        textAlign: "center",
    },
    simpleCardSubtitle: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: "center",
    },
    contactPreview: {
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
    },
    contactItem: {
        alignItems: "center",
        gap: 4,
        flex: 1,
    },
    contactAvatar: {
        fontSize: 20,
        alignSelf: "center",
    },
    contactName: {
        fontSize: 12,
        textAlign: "center",
    },

    contactsContainer: {
        gap: 12,
    },
    contactsTitle: {
        marginBottom: 8,
    },
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
    },
    contactInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    contactAvatarLarge: {
        fontSize: 32,
    },
    contactDetails: {
        flex: 1,
    },
    contactLastAmount: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 2,
    },
});