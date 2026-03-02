import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { changeSelectedFont } from "../store/slices/fontSlice";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useActiveFonts } from "../api/hooks";
import { FontItem } from "../services/api";

interface FontSelectionScreenProps {
  readonly navigation: any;
}

export default function FontSelectionScreen({
  navigation,
}: FontSelectionScreenProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { colors } = useThemeColors();
  const selectedFont = useAppSelector((state) => state.font.selectedFont);
  const isPremium = useAppSelector(
    (state) => state.auth.user?.isPremium || state.auth.user?.isAdmin,
  );
  const {
    data: fonts,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useActiveFonts();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSelectFont = (font: FontItem) => {
    if (font.isPremium && !isPremium) {
      // Navigate to subscription screen
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      navigation.navigate("Subscription");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(
      changeSelectedFont({
        id: font.id,
        name: font.name,
        fontFamily: font.fontFamily,
      }),
    );
  };

  const handleClearFont = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(changeSelectedFont(null));
  };

  const renderFontItem = ({ item }: { item: FontItem }) => {
    const isSelected = selectedFont?.id === item.id;
    const isLocked = item.isPremium && !isPremium;

    return (
      <TouchableOpacity
        style={[
          styles.fontItem,
          { backgroundColor: colors.card, borderColor: colors.border },
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
          isLocked && { opacity: 0.6 },
        ]}
        onPress={() => handleSelectFont(item)}
        activeOpacity={0.8}
      >
        <View style={styles.fontHeader}>
          <Text style={[styles.fontName, { color: colors.text }]}>
            {item.name}
          </Text>
          {isLocked && (
            <View
              style={[styles.premiumBadge, { backgroundColor: colors.warning }]}
            >
              <Ionicons name="lock-closed" size={12} color="#fff" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
          {isSelected && (
            <View
              style={[styles.checkmark, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          )}
        </View>
        <Text
          style={[
            styles.fontPreview,
            { color: colors.textSecondary, fontFamily: item.fontFamily },
          ]}
        >
          {item.previewText || "The quick brown fox jumps over the lazy dog"}
        </Text>
        <Text style={[styles.fontFamily, { color: colors.textTertiary }]}>
          {item.fontFamily}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("settings.fonts") || "Fonts"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.error}
          />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {t("common.error") || "Error loading fonts"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={fonts}
          renderItem={renderFontItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <TouchableOpacity
              style={[
                styles.clearButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                !selectedFont && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={handleClearFont}
            >
              <Ionicons name="text-outline" size={24} color={colors.text} />
              <Text style={[styles.clearText, { color: colors.text }]}>
                {t("settings.defaultFont") || "Default Font"}
              </Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  clearText: {
    fontSize: 16,
    fontWeight: "500",
  },
  fontItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  fontHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fontName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginRight: 8,
  },
  premiumText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  fontPreview: {
    fontSize: 18,
    marginBottom: 8,
    lineHeight: 26,
  },
  fontFamily: {
    fontSize: 12,
  },
});
