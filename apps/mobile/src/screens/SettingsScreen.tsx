import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
  Image,
  ImageStyle,
  Alert,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface SettingsScreenProps {
  readonly navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme, colors } = useTheme();
  const [language, setLanguage] = useState("Français");
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Create dynamic styles based on theme
  const styles = createStyles(colors);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Profile");
  };

  const handleSubscription = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to Subscription screen
    Alert.alert("Subscription", "Subscription screen coming soon!");
  };

  const handleLanguage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Show language picker
    Alert.alert("Language", "Language selection coming soon!");
  };

  const handleThemePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowThemeModal(true);
  };

  const handleThemeSelect = (selectedTheme: "light" | "dark" | "system") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(selectedTheme);
    setShowThemeModal(false);
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Clair";
      case "dark":
        return "Sombre";
      case "system":
        return "Système";
      default:
        return "Système";
    }
  };

  const handleStorage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to Storage screen
    Alert.alert("Storage", "Storage management coming soon!");
  };

  const handlePrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Open Privacy Policy
    Alert.alert("Privacy Policy", "Privacy Policy coming soon!");
  };

  const handleTerms = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Open Terms of Service
    Alert.alert("Terms", "Terms of Service coming soon!");
  };

  const handleContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Open Contact form
    Alert.alert("Contact", "Contact form coming soon!");
  };

  const handleAbout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to About screen
    Alert.alert("About", "About Focus coming soon!");
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.navigate("Home");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Menu</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || "User"}</Text>
              <Text style={styles.userEmail}>
                {user?.email || "user@example.com"}
              </Text>
              {user?.isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={14} color="#FFD700" />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Moi Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MOI</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSubscription}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="diamond-outline" size={24} color="#FFD700" />
              <Text style={styles.menuItemText}>Subscription</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleLanguage}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="language-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>Langues</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{language}</Text>
              <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleThemePress}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="contrast-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>Thème</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{getThemeLabel()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleStorage}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="folder-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>Espace</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>
        </View>

        {/* Company Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPANY</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="privacy-tip" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>
                Politique de confidentialité
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleTerms}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#0A84FF"
              />
              <Text style={styles.menuItemText}>Conditions d'utilisation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleContact}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="mail-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>Contactez-nous</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="info-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>À propos de nous</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ff4444" />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir le thème</Text>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === "light" && styles.themeOptionSelected,
              ]}
              onPress={() => handleThemeSelect("light")}
            >
              <Ionicons
                name="sunny"
                size={24}
                color={theme === "light" ? colors.primary : colors.text}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  theme === "light" && styles.themeOptionTextSelected,
                ]}
              >
                Clair
              </Text>
              {theme === "light" && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === "dark" && styles.themeOptionSelected,
              ]}
              onPress={() => handleThemeSelect("dark")}
            >
              <Ionicons
                name="moon"
                size={24}
                color={theme === "dark" ? colors.primary : colors.text}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  theme === "dark" && styles.themeOptionTextSelected,
                ]}
              >
                Sombre
              </Text>
              {theme === "dark" && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === "system" && styles.themeOptionSelected,
              ]}
              onPress={() => handleThemeSelect("system")}
            >
              <Ionicons
                name="phone-portrait"
                size={24}
                color={theme === "system" ? colors.primary : colors.text}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  theme === "system" && styles.themeOptionTextSelected,
                ]}
              >
                Système
              </Text>
              {theme === "system" && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
    headerTitle: {
      fontSize: 20,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    placeholder: {
      width: 40,
    } as ViewStyle,
    content: {
      flex: 1,
    } as ViewStyle,
    profileCard: {
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    } as ViewStyle,
    profileGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      columnGap: 16,
    } as ViewStyle,
    avatarContainer: {
      width: 70,
      height: 70,
    } as ViewStyle,
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 3,
      borderColor: "rgba(255, 255, 255, 0.3)",
    } as ImageStyle,
    avatarPlaceholder: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "rgba(255, 255, 255, 0.3)",
    } as ViewStyle,
    avatarText: {
      fontSize: 32,
      fontWeight: "700" as const,
      color: "#fff",
    } as TextStyle,
    userInfo: {
      flex: 1,
      rowGap: 4,
    } as ViewStyle,
    userName: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: "#fff",
      letterSpacing: 0.3,
    } as TextStyle,
    userEmail: {
      fontSize: 14,
      color: "#fff",
      opacity: 0.8,
    } as TextStyle,
    premiumBadge: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderWidth: 1,
      borderColor: "rgba(255, 215, 0, 0.5)",
      alignSelf: "flex-start",
      marginTop: 4,
    } as ViewStyle,
    premiumText: {
      fontSize: 11,
      fontWeight: "600" as const,
      color: "#FFD700",
      letterSpacing: 0.5,
    } as TextStyle,
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    } as ViewStyle,
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600" as const,
      marginBottom: 12,
      letterSpacing: 0.5,
      color: colors.textTertiary,
    } as TextStyle,
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: colors.backgroundSecondary,
    } as ViewStyle,
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 12,
    } as ViewStyle,
    menuItemRight: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 8,
    } as ViewStyle,
    menuItemText: {
      fontSize: 16,
      fontWeight: "500" as const,
      color: colors.text,
    } as TextStyle,
    menuItemValue: {
      fontSize: 14,
      color: colors.textTertiary,
    } as TextStyle,
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      columnGap: 12,
      padding: 16,
      borderRadius: 12,
      backgroundColor: "rgba(255, 68, 68, 0.1)",
      borderWidth: 1,
      borderColor: "rgba(255, 68, 68, 0.3)",
    } as ViewStyle,
    logoutText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: "#ff4444",
    } as TextStyle,
    bottomSpacing: {
      height: 40,
    } as ViewStyle,
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    } as ViewStyle,
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: "100%",
      maxWidth: 400,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
    modalTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.text,
      marginBottom: 20,
      textAlign: "center",
    } as TextStyle,
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
      marginBottom: 12,
      columnGap: 12,
      borderWidth: 2,
      borderColor: "transparent",
    } as ViewStyle,
    themeOptionSelected: {
      backgroundColor: "rgba(10, 132, 255, 0.1)",
      borderColor: colors.primary,
    } as ViewStyle,
    themeOptionText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    themeOptionTextSelected: {
      color: colors.primary,
    } as TextStyle,
  });
