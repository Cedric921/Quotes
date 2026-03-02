import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "../../hooks";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { SubscriptionPlan } from "../../store/slices/subscriptionSlice";

interface ProfileCompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (data: { name: string; email: string; password: string }) => void;
  selectedPlan: SubscriptionPlan | null;
  isLoading?: boolean;
}

export default function ProfileCompletionModal({
  isVisible,
  onClose,
  onComplete,
  selectedPlan,
  isLoading = false,
}: ProfileCompletionModalProps) {
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const styles = createStyles(colors);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t("onboarding.errors.nameRequired");
    }

    if (!email.trim()) {
      newErrors.email = t("onboarding.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("onboarding.errors.emailInvalid");
    }

    if (!password) {
      newErrors.password = t("onboarding.errors.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("onboarding.errors.passwordTooShort");
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("onboarding.errors.passwordMismatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    options?: {
      secureTextEntry?: boolean;
      keyboardType?: "default" | "email-address";
      autoCapitalize?: "none" | "sentences" | "words";
    },
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={options?.secureTextEntry && !showPassword}
          keyboardType={options?.keyboardType || "default"}
          autoCapitalize={options?.autoCapitalize || "sentences"}
        />
        {options?.secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {t("onboarding.completeProfile")}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Plan Info */}
          {selectedPlan && (
            <View style={styles.planInfo}>
              <Ionicons name="diamond" size={24} color="#667eea" />
              <View style={styles.planInfoText}>
                <Text style={styles.planName}>{selectedPlan.name}</Text>
                <Text style={styles.planPrice}>
                  €{Number(selectedPlan.price).toFixed(2)} /{" "}
                  {selectedPlan.durationMonths} mois
                </Text>
              </View>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {t("onboarding.createAccount")}
            </Text>
            <Text style={styles.formSubtitle}>
              {t("onboarding.createAccountSubtitle")}
            </Text>

            {renderInput(
              t("onboarding.name"),
              name,
              setName,
              t("onboarding.namePlaceholder"),
              errors.name,
              {
                autoCapitalize: "words",
              },
            )}

            {renderInput(
              t("onboarding.email"),
              email,
              setEmail,
              t("onboarding.emailPlaceholder"),
              errors.email,
              {
                keyboardType: "email-address",
                autoCapitalize: "none",
              },
            )}

            {renderInput(
              t("onboarding.password"),
              password,
              setPassword,
              t("onboarding.passwordPlaceholder"),
              errors.password,
              {
                secureTextEntry: true,
                autoCapitalize: "none",
              },
            )}

            {renderInput(
              t("onboarding.confirmPassword"),
              confirmPassword,
              setConfirmPassword,
              t("onboarding.confirmPasswordPlaceholder"),
              errors.confirmPassword,
              {
                secureTextEntry: true,
                autoCapitalize: "none",
              },
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {t("onboarding.continueToPayment")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    placeholder: {
      width: 40,
    },
    planInfo: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      marginHorizontal: 20,
      marginTop: 20,
      padding: 16,
      borderRadius: 12,
      columnGap: 12,
    },
    planInfoText: {
      flex: 1,
    },
    planName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    planPrice: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    form: {
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    formTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    formSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 24,
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      padding: 12,
    },
    errorText: {
      fontSize: 13,
      color: colors.error,
      marginTop: 4,
    },
    actionsContainer: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 40,
    },
    submitButton: {
      borderRadius: 16,
      overflow: "hidden",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    gradientButton: {
      paddingVertical: 16,
      alignItems: "center",
    },
    submitButtonText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#fff",
    },
  });
