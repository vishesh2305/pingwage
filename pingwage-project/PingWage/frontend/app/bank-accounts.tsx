// app/bank-accounts.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BANK_ACCOUNTS = [
  {
    id: "1",
    name: "Main Bank",
    bankName: "Fidelity Bank",
    accountType: "Checking",
    accountNumber: "**** **** **** 4821",
    isPrimary: true,
  },
  {
    id: "2",
    name: "Savings Account",
    bankName: "Capital Trust",
    accountType: "Savings",
    accountNumber: "**** **** **** 1190",
    isPrimary: false,
  },
];

export default function BankAccountsScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleEdit = (accountId: string) => {
    console.log("Edit account:", accountId);
  };

  const handleRemove = (accountId: string) => {
    console.log("Remove account:", accountId);
  };

  const handleSetPrimary = (accountId: string) => {
    console.log("Set as primary:", accountId);
  };

  const handleAddAccount = () => {
    console.log("Add new account");
  };

  return (
    <SafeAreaView style={styles.container} className="pt-10">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Bank Accounts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <Text style={styles.description}>
          Your saved accounts for receiving payments. You can add, edit, or
          remove accounts at any time.
        </Text>

        {/* Bank Accounts List */}
        <View style={styles.accountsList}>
          {BANK_ACCOUNTS.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              {/* Header with name and primary badge */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons
                      name="account-balance"
                      size={24}
                      color="#ecc813"
                    />
                  </View>
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                {account.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryText}>Primary</Text>
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color="#ecc813"
                    />
                  </View>
                )}
              </View>

              {/* Account Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Bank Name</Text>
                    <Text style={styles.detailValue}>{account.bankName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Account Type</Text>
                    <Text style={styles.detailValue}>{account.accountType}</Text>
                  </View>
                </View>
                <View style={styles.detailItemFull}>
                  <Text style={styles.detailLabel}>Account Number</Text>
                  <Text style={styles.detailValue}>{account.accountNumber}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <View style={styles.actionButtonsRow}>
                  <Pressable
                    onPress={() => handleEdit(account.id)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.actionButtonHalf,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <MaterialIcons name="edit" size={18} color="white" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleRemove(account.id)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.actionButtonHalf,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <MaterialIcons name="delete" size={18} color="white" />
                    <Text style={styles.actionButtonText}>Remove</Text>
                  </Pressable>
                </View>

                {!account.isPrimary && (
                  <Pressable
                    onPress={() => handleSetPrimary(account.id)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.actionButtonFull,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <MaterialIcons name="star" size={18} color="#ecc813" />
                    <Text style={styles.actionButtonTextPrimary}>
                      Set as Primary
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Add New Account Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            onPress={handleAddAccount}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <MaterialIcons name="add-circle" size={24} color="#181711" />
            <Text style={styles.addButtonText}>Add New Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  description: {
    color: "#A0A0A0",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 4,
  },
  accountsList: {
    gap: 16,
  },
  accountCard: {
    backgroundColor: "#222222",
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(236, 200, 19, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  accountName: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  primaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 28,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "rgba(236, 200, 19, 0.2)",
  },
  primaryText: {
    color: "#ecc813",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsGrid: {
    gap: 12,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailItemFull: {
    width: "100%",
  },
  detailLabel: {
    color: "#A0A0A0",
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  actionButtonsContainer: {
    gap: 12,
    paddingTop: 8,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "#3a3a3a",
  },
  actionButtonHalf: {
    flex: 1,
  },
  actionButtonFull: {
    width: "100%",
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  actionButtonTextPrimary: {
    color: "#ecc813",
    fontSize: 14,
    fontWeight: "700",
  },
  addButtonContainer: {
    marginTop: 32,
  },
  addButton: {
    height: 56,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#FFC700",
    shadowColor: "#ecc813",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    color: "#181711",
    fontSize: 18,
    fontWeight: "700",
  },
});
