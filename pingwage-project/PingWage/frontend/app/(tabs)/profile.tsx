// app/(tabs)/profile.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const PROFILE_DATA = {
  name: "Nathan",
  company: "Innovate Corp",
  email: "nattimmis@gmail.com",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSVUQ26YP7WvfIBgCxqIWhxY9_zSQtkyi6Y1BBwWOSiUaZvfiT8FAs0ZP0mr8qLidUIQy9l-T4eSzVeApeQdeV8OIX5sGGr4-nHqN4KdDFfi0HZhsvxhdnMG6ojo5J50BPaRv0VLvoGeWSOp7K3PK0XHlzQ4-DBXShM6dx9P-XT2Aa7OKyJGKKyMxO3cZ9E6WjdsuGJsg_pSD6QMrQtPIfkoPJoIjOBlNKhXnJSGjDzNnqhiYt-K1GN_g1NNekuZjJcJVrQuQx4Rti",
};

export default function ProfileScreen() {
  const router = useRouter();

  const handleEditPhoto = () => {
    console.log("Edit photo pressed");
  };

  const MENU_ITEMS = [
    {
      id: "bank",
      icon: "account-balance",
      label: "Bank Account Details",
      onPress: () => {
        Haptics.selectionAsync();
        router.push('/bank-accounts');
      },
    },
    {
      id: "security",
      icon: "security",
      label: "Security Settings",
      onPress: () => {
        Haptics.selectionAsync();
        console.log("Security Settings pressed");
      },
    },
    {
      id: "settings",
      icon: "settings",
      label: "Settings",
      onPress: () => {
        Haptics.selectionAsync();
        router.push('/settings');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 48 }} />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: PROFILE_DATA.avatar }}
              style={styles.avatar}
            />
            <Pressable
              onPress={handleEditPhoto}
              style={styles.editButton}
            >
              <MaterialIcons name="edit" size={16} color="#181711" />
            </Pressable>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{PROFILE_DATA.name}</Text>
            <Text style={styles.profileCompany}>{PROFILE_DATA.company}</Text>
            <Text style={styles.profileEmail}>{PROFILE_DATA.email}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item) => (
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
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#2A2A2A",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFC700",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
  profileInfo: {
    alignItems: "center",
    gap: 4,
  },
  profileName: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  profileCompany: {
    color: "#A9A9A9",
    fontSize: 16,
    marginTop: 4,
  },
  profileEmail: {
    color: "#A9A9A9",
    fontSize: 16,
  },
  menuContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F1F1F",
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
    width: 40,
    height: 40,
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
