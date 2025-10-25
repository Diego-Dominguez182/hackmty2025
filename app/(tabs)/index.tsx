import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [chatVisible, setChatVisible] = useState(false);

  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#fff', dark: '#001E3C' }}
        headerImage={
          <IconSymbol
          color={tintColor}
            name="creditcard.fill"
            size={200}
            style={[
              styles.headerImage,
              { color: tintColor },
            ]}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome Back!</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.balanceContainer, { backgroundColor: colorScheme === 'light' ? '#F4F8FA' : '#003A6B'}]}>
          <ThemedText style={styles.balanceLabel}>Current Balance</ThemedText>
          <ThemedText style={styles.balanceAmount}>$12,345.67</ThemedText>
        </ThemedView>

        <View style={styles.actionsContainer}>
          <View style={styles.actionButton}>
            <IconSymbol name="arrow.up.circle.fill" size={32} color={tintColor} />
            <ThemedText style={styles.actionLabel}>Send</ThemedText>
          </View>
          <View style={styles.actionButton}>
            <IconSymbol name="arrow.down.circle.fill" size={32} color={tintColor} />
            <ThemedText style={styles.actionLabel}>Request</ThemedText>
          </View>
          <View style={styles.actionButton}>
            <IconSymbol name="newspaper.fill" size={32} color={tintColor} />
            <ThemedText style={styles.actionLabel}>Bills</ThemedText>
          </View>
          <View style={styles.actionButton}>
            <IconSymbol name="ellipsis.circle.fill" size={32} color={tintColor} />
            <ThemedText style={styles.actionLabel}>More</ThemedText>
          </View>
        </View>

        <ThemedView style={styles.transactionsContainer}>
          <ThemedText type="subtitle">Recent Transactions</ThemedText>
          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <IconSymbol name="cart.fill" size={24} color={tintColor} />
            </View>
            <View style={styles.transactionDetails}>
              <ThemedText type="defaultSemiBold">Groceries</ThemedText>
              <ThemedText>Today</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.transactionAmount}>
              -$75.43
            </ThemedText>
          </View>
          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <IconSymbol name="ticket.fill" size={24} color={tintColor} />
            </View>
            <View style={styles.transactionDetails}>
              <ThemedText type="defaultSemiBold">Movie Tickets</ThemedText>
              <ThemedText>Yesterday</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.transactionAmount}>
              -$32.00
            </ThemedText>
          </View>
          <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <IconSymbol name="dollarsign.circle.fill" size={24} color={tintColor}/>
            </View>
            <View style={styles.transactionDetails}>
              <ThemedText type="defaultSemiBold">Salary</ThemedText>
              <ThemedText>Oct 23</ThemedText>
            </View>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.transactionAmount, styles.positiveAmount]}>
              +$2,500.00
            </ThemedText>
          </View>
        </ThemedView>
      </ParallaxScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: tintColor }]}
        onPress={() => setChatVisible(true)}>
        <IconSymbol name="sparkles" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={chatVisible}
        onRequestClose={() => setChatVisible(false)}>
        <View style={styles.chatContainer}>
          <View style={styles.chatBox}>
            <View style={styles.chatHeader}>
              <ThemedText type="subtitle">AI Assistant</ThemedText>
              <TouchableOpacity onPress={() => setChatVisible(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#555" />
              </TouchableOpacity>
            </View>
            <View style={styles.chatContent}>
              <ThemedText>Hello! How can I help you today?</ThemedText>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: 40,
    right: 40,
    position: 'absolute',
    opacity: 0.7,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
  },
  balanceAmount: {
    fontSize: 48,
    fontFamily: Fonts.rounded,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  transactionsContainer: {
    gap: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
  },
  positiveAmount: {
    color: '#2e7d32',
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chatContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  chatBox: {
    width: '90%',
    height: '60%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 12,
  },
  chatContent: {
    flex: 1,
  },
});
