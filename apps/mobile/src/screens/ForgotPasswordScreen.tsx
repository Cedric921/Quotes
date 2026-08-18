import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { API_CONFIG } from "../constants/config";

interface ForgotPasswordScreenProps {
  readonly navigation: any;
}

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("auth.fillAllFields"),
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // La locale voyage avec la demande : le code arrive dans la langue
          // de l'app, pas dans celle du serveur.
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            locale: i18n.language,
          }),
          // Render endort les instances gratuites ; un demarrage a froid peut
          // prendre une trentaine de secondes, au-dela c'est une panne.
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        },
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(t("auth.tooManyResetRequests"));
        }
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || t("auth.errorOccurred"));
      }

      Toast.show({
        type: "success",
        text1: t("auth.resetCodeSent"),
        text2: t("auth.resetCodeSentMessage"),
        visibilityTime: 4000,
      });

      navigation.navigate("ResetPassword", { email: email.trim().toLowerCase() });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: error.message || t("auth.errorOccurred"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed" size={56} color="#fff" />
          </View>
          <Text style={styles.title}>{t("auth.forgotPasswordTitle")}</Text>
          <Text style={styles.subtitle}>
            {t("auth.forgotPasswordSubtitle")}
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder={t("auth.email")}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSendCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#667eea" />
            ) : (
              <Text style={styles.submitButtonText}>
                {t("auth.sendResetCode")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.backToLoginText}>{t("auth.backToLogin")}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  gradient: { flex: 1 } as ViewStyle,
  header: { paddingTop: 60, paddingHorizontal: 20 } as ViewStyle,
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  } as ViewStyle,
  iconWrap: { alignItems: "center", marginBottom: 20 } as ViewStyle,
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  } as TextStyle,
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 36,
  } as TextStyle,
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    columnGap: 12,
    marginBottom: 16,
  } as ViewStyle,
  input: { flex: 1, fontSize: 16, color: "#fff" } as TextStyle,
  submitButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  } as ViewStyle,
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#667eea",
  } as TextStyle,
  backToLogin: { marginTop: 20, alignItems: "center" } as ViewStyle,
  backToLoginText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500" as const,
  } as TextStyle,
});
