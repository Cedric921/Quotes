import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ErrorMessageProps {
  readonly message: string;
  readonly onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Réessayer</Text>
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
    padding: 20,
    backgroundColor: "#000",
  } as ViewStyle,
  errorText: {
    fontSize: 48,
    marginBottom: 16,
  } as TextStyle,
  message: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  } as TextStyle,
  retryButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  } as ViewStyle,
  retryText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600" as const,
  } as TextStyle,
});
