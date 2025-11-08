// app/(tabs)/history.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const TRANSACTIONS = [
  {
    section: "Today",
    data: [
      {
        id: "1",
        title: "Paid Out",
        date: "Oct 26, 2024",
        amount: "- $150.00",
        color: "#10B981",
        status: "Complete",
        statusColor: "#94A3B8",
        icon: "arrow-downward",
      },
    ],
  },
  {
    section: "Yesterday",
    data: [
      {
        id: "2",
        title: "Repaid",
        date: "Oct 25, 2024",
        amount: "+ $75.00",
        color: "#10B981",
        status: "Complete",
        statusColor: "#94A3B8",
        icon: "arrow-upward",
      },
      {
        id: "3",
        title: "Paid Out",
        date: "Oct 25, 2024",
        amount: "- $75.00",
        color: "#FFC700",
        status: "Pending",
        statusColor: "#FFC700",
        icon: "arrow-downward",
      },
    ],
  },
  {
    section: "October 2024",
    data: [
      {
        id: "4",
        title: "Paid Out",
        date: "Oct 19, 2024",
        amount: "- $200.00",
        color: "#EF4444",
        status: "Failed",
        statusColor: "#EF4444",
        icon: "arrow-downward",
      },
    ],
  },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header} className="px-8 pt-10 pb-8">
        <Pressable>
        </Pressable>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 12, marginTop: 10 }}
      >
        <View style={styles.filterChipActive}>
          <Text style={styles.filterChipActiveText}>Sort by: Newest</Text>
          <MaterialIcons name="expand-more" size={18} color="#121212" />
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipText}>Status: All</Text>
          <MaterialIcons name="expand-more" size={18} color="#A9A9A9" />
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipText}>Type: All</Text>
          <MaterialIcons name="expand-more" size={18} color="#A9A9A9" />
        </View>
      </ScrollView>

      {/* Transaction list */}
      <FlatList
        data={TRANSACTIONS}
        keyExtractor={(item) => item.section}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.sectionHeader}>{item.section}</Text>
            {item.data.map((tx) => (
              <View key={tx.id} style={styles.txCard}>
                <View style={styles.txLeft}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: `${tx.color}20`,
                      },
                    ]}
                  >
                    <MaterialIcons name={tx.icon as any} size={22} color={tx.color} />
                  </View>
                  <View>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.txAmount,
                      {
                        color: tx.color,
                      },
                    ]}
                  >
                    {tx.amount}
                  </Text>
                  <View style={styles.txStatus}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: tx.statusColor },
                      ]}
                    />
                    <Text
                      style={[
                        styles.txStatusText,
                        { color: tx.statusColor },
                      ]}
                    >
                      {tx.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#2A2A2A",
    marginRight: 8,
  },
  filterChipActive: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#FFC70040",
    marginRight: 8,
  },
  filterChipText: { color: "#A9A9A9", fontSize: 13, fontWeight: "500" },
  filterChipActiveText: {
    color: "#121212",
    fontSize: 13,
    fontWeight: "700",
    marginRight: 4,
  },
  sectionHeader: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  txCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  txTitle: { color: "white", fontSize: 16, fontWeight: "600" },
  txDate: { color: "#A9A9A9", fontSize: 13, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: "700" },
  txStatus: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  txStatusText: { fontSize: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
