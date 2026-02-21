import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { getCurrentLanguage } from "../i18n";

const BASE_PRIVACY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_URL ||
  "https://focus.oderaformations.com/privacy";

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useThemeColors();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Build the URL with language parameter based on current app language
  const privacyUrl = useMemo(() => {
    const currentLang = getCurrentLanguage();
    // Map app language to privacy page language (only fr and en supported)
    const privacyLang = currentLang === "fr" ? "fr" : "en";
    return `${BASE_PRIVACY_URL}?lang=${privacyLang}`;
  }, [i18n.language]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    webviewContainer: {
      flex: 1,
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorIcon: {
      marginBottom: 16,
    },
    errorText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  // Inject CSS for dark mode
  const injectedCSS = isDark
    ? `
    (function() {
      const style = document.createElement('style');
      style.textContent = \`
        body {
          background-color: ${colors.background} !important;
          color: ${colors.text} !important;
        }
        * {
          color: ${colors.text} !important;
          border-color: ${colors.border} !important;
        }
        a {
          color: ${colors.primary} !important;
        }
        .bg-gray-50, .bg-white {
          background-color: ${colors.card} !important;
        }
      \`;
      document.head.appendChild(style);
    })();
    true;
  `
    : "true;";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("privacy.title", "Politique de confidentialité")}
        </Text>
      </View>

      {/* Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="cloud-offline"
            size={64}
            color={colors.textSecondary}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>
            {t(
              "privacy.loadError",
              "Impossible de charger la politique de confidentialité. Vérifiez votre connexion internet.",
            )}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>
              {t("common.retry", "Réessayer")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: privacyUrl }}
            style={{ flex: 1, backgroundColor: colors.background }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            injectedJavaScript={injectedCSS}
            startInLoadingState={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={Platform.OS === "android"}
          />
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
