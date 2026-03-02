import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { changeBackgroundTheme } from "../store/slices/themeSlice";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useActiveThemes } from "../api/hooks";
import { BackgroundTheme } from "../services/api";

interface ThemeSelectionScreenProps {
  readonly navigation: any;
}

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;
const ITEM_HEIGHT = ITEM_WIDTH * (16 / 9);

export default function ThemeSelectionScreen({
  navigation,
}: ThemeSelectionScreenProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { colors } = useThemeColors();
  const selectedTheme = useAppSelector((state) => state.theme.backgroundTheme);
  const {
    data: themes,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useActiveThemes();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSelectTheme = (theme: BackgroundTheme) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(changeBackgroundTheme(theme));
  };

  const handleClearTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(changeBackgroundTheme(null));
  };

  const renderThemeItem = ({ item }: { item: BackgroundTheme }) => {
    const isSelected = selectedTheme?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.themeItem,
          isSelected && { borderColor: colors.primary, borderWidth: 3 },
        ]}
        onPress={() => handleSelectTheme(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.thumbnailUrl || item.imageUrl }}
          style={styles.themeImage}
          resizeMode="cover"
        />
        <View style={styles.themeOverlay}>
          <Text style={styles.themeName}>{item.name}</Text>
          {isSelected && (
            <View
              style={[styles.checkmark, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          )}
        </View>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("settings.backgroundTheme") || "Fond d'écran"}
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
            {t("common.error") || "Erreur de chargement"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={themes}
          renderItem={renderThemeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
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
                !selectedTheme && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={handleClearTheme}
            >
              <Ionicons
                name="close-circle-outline"
                size={32}
                color={!selectedTheme ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.clearButtonText,
                  {
                    color: !selectedTheme
                      ? colors.primary
                      : colors.textSecondary,
                  },
                ]}
              >
                {t("settings.noBackground") || "Aucun fond"}
              </Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="images-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t("settings.noThemesAvailable") || "Aucun thème disponible"}
              </Text>
            </View>
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
  headerTitle: {
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
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  themeItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1c1c1e",
  },
  themeImage: {
    width: "100%",
    height: "100%",
  },
  themeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  themeName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: -30,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
