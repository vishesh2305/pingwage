// app/settings.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  StatusBar,
  Image,
  Switch,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const PROFILE_DATA = {
  name: "Nathan Timmis",
  email: "nattimmis@gmail.com",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSVUQ26YP7WvfIBgCxqIWhxY9_zSQtkyi6Y1BBwWOSiUaZvfiT8FAs0ZP0mr8qLidUIQy9l-T4eSzVeApeQdeV8OIX5sGGr4-nHqN4KdDFfi0HZhsvxhdnMG6ojo5J50BPaRv0VLvoGeWSOp7K3PK0XHlzQ4-DBXShM6dx9P-XT2Aa7OKyJGKKyMxO3cZ9E6WjdsuGJsg_pSD6QMrQtPIfkoPJoIjOBlNKhXnJSGjDzNnqhiYt-K1GN_g1NNekuZjJcJVrQuQx4Rti",
};

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    console.log("Edit Profile pressed");
  };

  const handleLogout = () => {
    console.log("Logout pressed");
    // TODO: Implement logout logic
  };

  return (
    <SafeAreaView style={styles.container} className="pt-3">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <Image
              source={{ uri: PROFILE_DATA.avatar }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{PROFILE_DATA.name}</Text>
              <Text style={styles.profileEmail}>{PROFILE_DATA.email}</Text>
            </View>
          </View>
          <Pressable
            onPress={handleEditProfile}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          <View style={styles.card}>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="person" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Personal Details</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#A9A9A9" />
            </Pressable>

            <View style={styles.separator} />

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="lock" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Change Password</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#A9A9A9" />
            </Pressable>
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT METHODS</Text>
          <View style={styles.card}>
            <Pressable
              onPress={() => router.push('/bank-accounts')}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="account-balance" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Bank Account</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.accountNumber}>•••• 4821</Text>
                <MaterialIcons name="chevron-right" size={24} color="#A9A9A9" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.card}>
            {/* Push Notifications */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="notifications" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Push Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: "#3a3a3a", true: "#ecc813" }}
                thumbColor="white"
                ios_backgroundColor="#3a3a3a"
              />
            </View>

            <View style={styles.separator} />

            {/* Email Notifications */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="mail" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Email Notifications</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: "#3a3a3a", true: "#ecc813" }}
                thumbColor="white"
                ios_backgroundColor="#3a3a3a"
              />
            </View>

            <View style={styles.separator} />

            {/* Biometric Login */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="fingerprint" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Biometric Login</Text>
              </View>
              <Switch
                value={biometricLogin}
                onValueChange={setBiometricLogin}
                trackColor={{ false: "#3a3a3a", true: "#ecc813" }}
                thumbColor="white"
                ios_backgroundColor="#3a3a3a"
              />
            </View>

            <View style={styles.separator} />

            {/* Appearance */}
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="dark-mode" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Appearance</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.appearanceText}>Dark</Text>
                <MaterialIcons name="chevron-right" size={24} color="#A9A9A9" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Support & Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT & LEGAL</Text>
          <View style={styles.card}>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="help" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Help Center</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#A9A9A9" />
            </Pressable>

            <View style={styles.separator} />

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="gavel" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Terms of Service</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#A9A9A9" />
            </Pressable>

            <View style={styles.separator} />

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="privacy-tip" size={22} color="#ecc813" />
                </View>
                <Text style={styles.menuItemText}>Privacy Policy</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#A9A9A9" />
            </Pressable>
          </View>
        </View>

        {/* Log Out Button */}
        <View style={styles.logoutSection}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
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
    marginRight: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2a2a2a",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  profileName: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  profileEmail: {
    color: "#A9A9A9",
    fontSize: 16,
  },
  editButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonPressed: {
    opacity: 0.7,
  },
  editButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#A9A9A9",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#1F1F1F",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  menuItemPressed: {
    opacity: 0.7,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(236, 200, 19, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuItemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
    flex: 1,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accountNumber: {
    color: "#A9A9A9",
    fontSize: 14,
  },
  appearanceText: {
    color: "#A9A9A9",
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginLeft: 70,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  logoutButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFC700",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutButtonText: {
    color: "#181711",
    fontSize: 16,
    fontWeight: "700",
  },
});
