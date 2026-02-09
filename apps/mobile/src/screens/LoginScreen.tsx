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
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface LoginScreenProps {
  readonly navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("auth.fillAllFields"),
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled automatically by auth state change
      navigation.navigate("Home");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("auth.loginError"),
        text2: error.message || t("auth.errorOccurred"),
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Signup");
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>
              Focus<Text style={styles.logoDot}>.</Text>
            </Text>
            <Text style={styles.subtitle}>{t("auth.welcomeBack")}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                name="lock-closed-outline"
                size={20}
                color="rgba(255,255,255,0.7)"
              />
              <TextInput
                style={styles.input}
                placeholder={t("auth.password")}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#667eea" />
              ) : (
                <Text style={styles.loginButtonText}>{t("auth.login")}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("common.or")}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
            >
              <Text style={styles.signupButtonText}>
                {t("auth.createAccount")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  gradient: {
    flex: 1,
  } as ViewStyle,
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  } as ViewStyle,
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  } as ViewStyle,
  logo: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#fff",
    letterSpacing: 1,
  } as TextStyle,
  logoDot: {
    color: "#FF453A",
  } as TextStyle,
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  } as TextStyle,
  form: {
    rowGap: 16,
  } as ViewStyle,
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    columnGap: 12,
  } as ViewStyle,
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  } as TextStyle,
  loginButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  } as ViewStyle,
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#667eea",
  } as TextStyle,
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    columnGap: 12,
  } as ViewStyle,
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  } as ViewStyle,
  dividerText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  } as TextStyle,
  signupButton: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  } as ViewStyle,
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  } as TextStyle,
});
