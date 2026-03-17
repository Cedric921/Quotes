import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../store/hooks";
import { useSendContactMessage } from "../api/hooks";

interface ContactScreenProps {
  readonly navigation: any;
}

export default function ContactScreen({ navigation }: ContactScreenProps) {
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const styles = createStyles(colors);
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendContactMutation = useSendContactMessage();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("contact.fillAllFields"),
      });
      return;
    }

    if (message.length < 10) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("contact.messageTooShort"),
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    sendContactMutation.mutate(
      { name, email, subject, message },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: t("common.success"),
            text2: t("contact.messageSent"),
          });
          setSubject("");
          setMessage("");
          navigation.goBack();
        },
        onError: () => {
          Toast.show({
            type: "error",
            text1: t("common.error"),
            text2: t("contact.sendError"),
          });
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("contact.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.subtitle}>{t("contact.subtitle")}</Text>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("contact.name")}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("contact.namePlaceholder")}
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("contact.email")}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t("contact.emailPlaceholder")}
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("contact.subject")}</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder={t("contact.subjectPlaceholder")}
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Message */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("contact.message")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder={t("contact.messagePlaceholder")}
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              sendContactMutation.isPending && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={sendContactMutation.isPending}
          >
            {sendContactMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>{t("common.send")}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },
    placeholder: {
      width: 40,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    scrollContent: {
      paddingTop: 20,
      paddingBottom: 40,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 24,
      lineHeight: 22,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 150,
      paddingTop: 16,
    },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      marginTop: 12,
      gap: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });
