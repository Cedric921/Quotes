import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface ErrorMessageProps {
  readonly message?: string;
  readonly onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.container, { height: height - 120 }]}>
      <Ionicons
        name="cloud-offline-outline"
        size={56}
        color="rgba(255,255,255,0.4)"
      />
      <Text style={styles.message}>
        {message || t("errors.connectionError")}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="reload" size={18} color="#fff" />
          <Text style={styles.retryText}>{t("common.retry")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  } as ViewStyle,
  message: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 28,
    lineHeight: 24,
    paddingHorizontal: 20,
  } as TextStyle,
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 10,
  } as ViewStyle,
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500" as const,
  } as TextStyle,
});
