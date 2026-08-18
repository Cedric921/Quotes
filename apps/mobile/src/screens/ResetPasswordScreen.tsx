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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { RouteProp } from "@react-navigation/native";
import { API_CONFIG } from "../constants/config";
import { RootStackParamList } from "../navigation/AppNavigator";

interface ResetPasswordScreenProps {
  readonly navigation: any;
  readonly route: RouteProp<RootStackParamList, "ResetPassword">;
}

export default function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordScreenProps) {
  const { t } = useTranslation();
  const initialEmail = route?.params?.email ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim() || !code.trim() || !newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("auth.fillAllFields"),
      });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("auth.passwordTooShort"),
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("auth.passwordMismatch"),
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code: code.trim(),
            newPassword,
          }),
          signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error(t("auth.invalidResetCode"));
        }
        throw new Error(data.message || t("auth.errorOccurred"));
      }

      Toast.show({
        type: "success",
        text1: t("auth.resetPasswordSuccess"),
        text2: t("auth.resetPasswordSuccessMessage"),
        visibilityTime: 4000,
      });

      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconWrap}>
            <Ionicons name="key" size={56} color="#fff" />
          </View>
          <Text style={styles.title}>{t("auth.resetPasswordTitle")}</Text>
          <Text style={styles.subtitle}>
            {t("auth.resetPasswordSubtitle")}
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

          <View style={styles.inputContainer}>
            <Ionicons
              name="keypad-outline"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder={t("auth.verificationCode")}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder={t("auth.newPassword")}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder={t("auth.confirmNewPassword")}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#667eea" />
            ) : (
              <Text style={styles.submitButtonText}>
                {t("auth.resetPasswordSubmit")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.backToLoginText}>{t("auth.backToLogin")}</Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 30,
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
    marginBottom: 28,
  } as TextStyle,
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    columnGap: 12,
    marginBottom: 14,
  } as ViewStyle,
  input: { flex: 1, fontSize: 16, color: "#fff" } as TextStyle,
  submitButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
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
