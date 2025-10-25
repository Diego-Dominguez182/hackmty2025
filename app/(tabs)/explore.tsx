import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

const transactions = [
  { icon: 'cart.fill', name: 'Groceries', date: 'Today', amount: -75.43 },
  { icon: 'ticket.fill', name: 'Movie Tickets', date: 'Yesterday', amount: -32.0 },
  { icon: 'dollarsign.circle.fill', name: 'Salary', date: 'Oct 23', amount: 2500.0 },
  { icon: 'fork.knife', name: 'Restaurant', date: 'Oct 22', amount: -54.2 },
  { icon: 'tshirt.fill', name: 'Clothing Store', date: 'Oct 21', amount: -120.5 },
  { icon: 'airplane', name: 'Airline Tickets', date: 'Oct 20', amount: -450.0 },
  { icon: 'house.fill', name: 'Rent', date: 'Oct 1', amount: -1200.0 },
];

export default function TransactionsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={280}
          color="#808080"
          name="list.bullet.rectangle.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          All Transactions
        </ThemedText>
      </ThemedView>

      <View style={styles.transactionsContainer}>
        {transactions.map((item, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <IconSymbol name={item.icon} size={24} />
            </View>
            <View style={styles.transactionDetails}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText>{item.date}</ThemedText>
            </View>
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.transactionAmount,
                item.amount > 0 ? styles.positiveAmount : null,
              ]}>
              {item.amount > 0 ? '+' : ''}${item.amount.toFixed(2)}
            </ThemedText>
          </View>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  transactionsContainer: {
    gap: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
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
});