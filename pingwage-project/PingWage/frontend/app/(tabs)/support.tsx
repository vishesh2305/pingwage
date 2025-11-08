// app/(tabs)/support.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const SUPPORT_ITEMS = [
  {
    id: "faqs",
    icon: "quiz",
    label: "FAQs",
    onPress: () => console.log("FAQs pressed"),
  },
  {
    id: "contact",
    icon: "mail",
    label: "Contact Us",
    onPress: () => console.log("Contact Us pressed"),
  },
  {
    id: "report",
    icon: "flag",
    label: "Report an Issue",
    onPress: () => console.log("Report an Issue pressed"),
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Support & Help Center</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <View style={styles.searchIconContainer}>
              <MaterialIcons name="search" size={24} color="#A9A9A9" />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="How can we help?"
              placeholderTextColor="#A9A9A9"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: 16 }} />

        {/* Support Menu Items */}
        <View style={styles.menuContainer}>
          {SUPPORT_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name={item.icon as any} size={24} color="#ecc813" />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#A9A9A9" />
            </Pressable>
          ))}
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
    paddingTop: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(42, 42, 42, 0.5)",
    borderRadius: 12,
    height: 56,
    overflow: "hidden",
  },
  searchIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "white",
    fontSize: 16,
    paddingRight: 16,
    paddingLeft: 8,
  },
  menuContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(42, 42, 42, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "rgba(236, 200, 19, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
    flex: 1,
  },
});
