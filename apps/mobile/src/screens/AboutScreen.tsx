import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useSocialNetworks } from "../api/hooks";

interface AboutScreenProps {
  readonly navigation: any;
}

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const styles = createStyles(colors);

  const { data: socials = [], isLoading } = useSocialNetworks();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleOpenLink = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening link:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("about.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Ionicons name="sparkles" size={48} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Focus</Text>
          <Text style={styles.appTagline}>{t("about.tagline")}</Text>
        </View>

        {/* Description */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.aboutUsTitle")}</Text>
          <Text style={styles.description}>{t("about.description")}</Text>
        </View> */}

        {/* Social Networks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.followUs")}</Text>

          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : socials.length === 0 ? (
            <Text style={styles.noSocials}>{t("about.noSocials")}</Text>
          ) : (
            <View style={styles.socialGrid}>
              {socials.map((social) => (
                <TouchableOpacity
                  key={social.id}
                  style={[
                    styles.socialButton,
                    { backgroundColor: social.color || colors.primary },
                  ]}
                  onPress={() => handleOpenLink(social.url)}
                >
                  <Ionicons name={social.icon as any} size={24} color="#fff" />
                  <Text style={styles.socialName}>{social.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t("about.version")} 1.0.0</Text>
        </View>
      </ScrollView>
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
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 30,
      paddingBottom: 40,
    },
    appInfo: {
      alignItems: "center",
      marginBottom: 40,
    },
    appIcon: {
      width: 100,
      height: 100,
      borderRadius: 24,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    appName: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    appTagline: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      textAlign: "center",
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    description: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    noSocials: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: "center",
      paddingVertical: 20,
    },
    socialGrid: {
      flexDirection: "column",
      gap: 12,
      width: "100%",
    },
    socialButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 10,
      width: "100%",
    },
    socialName: {
      fontSize: 15,
      fontWeight: "600",
      color: "#fff",
    },
    versionContainer: {
      alignItems: "center",
      paddingTop: 20,
    },
    versionText: {
      fontSize: 13,
      color: colors.textTertiary,
    },
  });
