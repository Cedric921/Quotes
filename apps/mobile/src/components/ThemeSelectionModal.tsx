import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { changeBackgroundTheme } from "../store/slices/themeSlice";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useActiveThemes } from "../api/hooks";
import { BackgroundTheme } from "../services/api";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 64) / 2;
const ITEM_HEIGHT = ITEM_WIDTH * 1.4;

interface ThemeSelectionModalProps {
  readonly isVisible: boolean;
  readonly onClose: () => void;
}

export default function ThemeSelectionModal({
  isVisible,
  onClose,
}: ThemeSelectionModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  useThemeColors(); // Keep for potential future use
  const selectedTheme = useAppSelector((state) => state.theme.backgroundTheme);

  const { data: themes, isLoading } = useActiveThemes();

  const handleSelectTheme = (theme: BackgroundTheme) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(changeBackgroundTheme(theme));
  };

  const handleClearTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(changeBackgroundTheme(null));
  };

  const renderThemeItem = ({ item }: { item: BackgroundTheme }) => {
    const isSelected = selectedTheme?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.themeItem,
          isSelected && { borderColor: "#FFD700", borderWidth: 2 },
        ]}
        onPress={() => handleSelectTheme(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.thumbnailUrl || item.imageUrl }}
          style={styles.themeImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.themeOverlay}
        >
          <Text style={styles.themeName}>{item.name}</Text>
          {item.fontName && (
            <Text style={styles.fontName}>{item.fontName}</Text>
          )}
          {isSelected && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {t("settings.backgroundTheme") || "Fond d'écran"}
            </Text>
            <TouchableOpacity
              onPress={handleClearTheme}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>
                {t("common.reset") || "Reset"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Themes Grid */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
            </View>
          ) : (
            <FlatList
              data={themes}
              renderItem={renderThemeItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="images-outline" size={48} color="#666" />
                  <Text style={styles.emptyText}>
                    {t("settings.noThemesAvailable") || "Aucun thème"}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  themeItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 16,
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
    paddingTop: 30,
  },
  themeName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  fontName: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 2,
  },
  checkmark: {
    position: "absolute",
    top: -20,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
});
