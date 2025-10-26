
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ModalScreen() {
  const handleVoicePress = () => {
    Alert.alert('Interacción de voz', 'Simulando activación de modo voz estilo Bixby/GPT.');
  };
  const handleSendPress = () => {
    Alert.alert('Enviar mensaje', 'Simulando envío de mensaje al chat.');
  };
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Chat con IA</ThemedText>
      <View style={styles.chatContainer}>
        {/* Simulación de área de mensajes */}
        <View style={styles.messagesArea}>
          <ThemedText>Simulación de mensajes...</ThemedText>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.iconButton} onPress={handleVoicePress}>
            <IconSymbol name={"mic" as any} color="#007AFF" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSendPress}>
            <IconSymbol name={"paperplane.fill"} color="#007AFF" size={28} />
          </TouchableOpacity>
        </View>
      </View>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  chatContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  messagesArea: {
    minHeight: 120,
    marginBottom: 12,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    padding: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    color: '#222',
  },
  iconButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#eaf1fb',
    marginLeft: 2,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
