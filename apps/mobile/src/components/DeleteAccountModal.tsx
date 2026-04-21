import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../hooks";
import { useAppDispatch } from "../store/hooks";
import { logoutThunk } from "../store/slices/authSlice";
import { accountApi } from "../services/api";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteAccountModal({
  visible,
  onClose,
  onDeleted,
}: DeleteAccountModalProps) {
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const dispatch = useAppDispatch();
  const styles = createStyles(colors);

  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setStep(1);
    setPassword("");
    setError("");
    onClose();
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
    setError("");
  };

  const handleConfirmDelete = async () => {
    if (!password.trim()) {
      setError(t("settings.passwordRequired"));
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsDeleting(true);
    setError("");
    try {
      await accountApi.deleteAccount(password);
      handleClose();
      await dispatch(logoutThunk());
      onDeleted();
    } catch (err: any) {
      console.error("Error deleting account:", err);
      if (err.response?.status === 401) {
        setError(t("settings.wrongPassword"));
      } else {
        setError(t("settings.deleteAccountError"));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
          {step === 1 ? (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={48} color="#ff4444" />
              </View>
              <Text style={styles.title}>{t("settings.deleteAccountTitle")}</Text>
              <Text style={styles.subtitle}>{t("settings.deleteAccountSubtitle")}</Text>
              <View style={styles.warningList}>
                <WarningItem styles={styles} text={t("settings.deleteWarning1")} />
                <WarningItem styles={styles} text={t("settings.deleteWarning2")} />
                <WarningItem styles={styles} text={t("settings.deleteWarning3")} />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={handleNextStep}>
                  <Text style={styles.continueButtonText}>{t("settings.continue")}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={48} color="#ff4444" />
              </View>
              <Text style={styles.title}>{t("settings.confirmIdentity")}</Text>
              <Text style={styles.subtitle}>{t("settings.enterPasswordToDelete")}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t("auth.password")}
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => { setPassword(text); setError(""); }}
                  editable={!isDeleting}
                  autoCapitalize="none"
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={isDeleting}>
                  <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                  onPress={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.deleteButtonText}>{t("settings.deleteMyAccount")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function WarningItem({ styles, text }: { styles: any; text: string }) {
  return (
    <View style={styles.warningItem}>
      <Ionicons name="close-circle" size={20} color="#ff4444" />
      <Text style={styles.warningText}>{text}</Text>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    } as ViewStyle,
    content: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      width: "100%",
      maxWidth: 400,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
    stepIndicator: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    } as ViewStyle,
    stepDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.border,
    } as ViewStyle,
    stepDotActive: {
      backgroundColor: "#ff4444",
    } as ViewStyle,
    stepLine: {
      width: 40,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: 8,
    } as ViewStyle,
    iconContainer: {
      alignItems: "center",
      marginBottom: 16,
    } as ViewStyle,
    title: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    } as TextStyle,
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 20,
    } as TextStyle,
    warningList: {
      marginBottom: 24,
    } as ViewStyle,
    warningItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 12,
    } as ViewStyle,
    warningText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    } as TextStyle,
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
    } as ViewStyle,
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    } as ViewStyle,
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    continueButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: "#ff4444",
      alignItems: "center",
    } as ViewStyle,
    continueButtonText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: "#fff",
    } as TextStyle,
    inputContainer: {
      marginBottom: 16,
    } as ViewStyle,
    passwordInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    } as TextStyle,
    errorText: {
      color: "#ff4444",
      fontSize: 14,
      textAlign: "center",
      marginBottom: 16,
    } as TextStyle,
    deleteButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: "#ff4444",
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    deleteButtonDisabled: {
      opacity: 0.6,
    } as ViewStyle,
    deleteButtonText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: "#fff",
    } as TextStyle,
  });
