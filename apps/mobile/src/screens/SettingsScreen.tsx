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
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logoutThunk } from "../store/slices/authSlice";
import { changeTheme } from "../store/slices/themeSlice";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { changeLanguage, getCurrentLanguage } from "../i18n";

interface SettingsScreenProps {
  readonly navigation: any;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
];

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const theme = useAppSelector((state) => state.theme.mode);
  const { colors } = useThemeColors();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    LANGUAGES[0],
  );
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Create dynamic styles based on theme
  const styles = createStyles(colors);

  // Load current language on mount
  useEffect(() => {
    const langCode = getCurrentLanguage();
    const lang = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];
    setCurrentLanguage(lang);
  }, []);

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

  const handleLanguagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = async (language: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentLanguage(language);
    await changeLanguage(language.code);
    setShowLanguageModal(false);
  };

  const handleThemePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowThemeModal(true);
  };

  const handleThemeSelect = (selectedTheme: "light" | "dark" | "system") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(changeTheme(selectedTheme));
    setShowThemeModal(false);
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return t("settings.light");
      case "dark":
        return t("settings.dark");
      case "system":
        return t("settings.system");
      default:
        return t("settings.system");
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
    Alert.alert(t("auth.logout"), t("settings.logoutConfirmation"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => {
          await dispatch(logoutThunk());
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
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
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
          <Text style={styles.sectionTitle}>{t("settings.account")}</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>{t("settings.profile")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSubscription}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="diamond-outline" size={24} color="#FFD700" />
              <Text style={styles.menuItemText}>
                {t("settings.subscription")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.settings")}</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLanguagePress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="language-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>{t("settings.language")}</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>
                {currentLanguage.nativeName}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleThemePress}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="contrast-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>{t("settings.theme")}</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{getThemeLabel()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleStorage}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="folder-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>{t("settings.storage")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>
        </View>

        {/* Company Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.about")}</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="privacy-tip" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>
                {t("settings.privacyPolicy")}
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
              <Text style={styles.menuItemText}>
                {t("settings.termsOfService")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleContact}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="mail-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>{t("settings.contactUs")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="info-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>{t("settings.aboutUs")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ff4444" />
            <Text style={styles.logoutText}>{t("auth.logout")}</Text>
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
            <Text style={styles.modalTitle}>{t("settings.selectTheme")}</Text>

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
                {t("settings.light")}
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
                {t("settings.dark")}
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
                {t("settings.system")}
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

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("settings.selectLanguage")}
            </Text>

            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.themeOption,
                  currentLanguage.code === language.code &&
                    styles.themeOptionSelected,
                ]}
                onPress={() => handleLanguageSelect(language)}
              >
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text
                  style={[
                    styles.themeOptionText,
                    currentLanguage.code === language.code &&
                      styles.themeOptionTextSelected,
                  ]}
                >
                  {language.nativeName}
                </Text>
                {currentLanguage.code === language.code && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
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
    languageFlag: {
      fontSize: 24,
      marginRight: 4,
    } as TextStyle,
  });
