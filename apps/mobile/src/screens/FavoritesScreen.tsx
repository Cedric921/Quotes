import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ViewStyle,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useLikedQuotes } from "../api/hooks/useUser";
import { quotesApi } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "../api/hooks/useUser";
import { Quote } from "../types";

interface FavoritesScreenProps {
  readonly navigation: any;
}

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const styles = createStyles(colors);
  const queryClient = useQueryClient();

  const { data: likedQuotes, isLoading, refetch, isRefetching } = useLikedQuotes();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleUnlike = async (quoteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      t("favorites.removeTitle"),
      t("favorites.removeMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              await quotesApi.unlikeQuote(quoteId);
              queryClient.invalidateQueries({ queryKey: userKeys.likedQuotes() });
            } catch (error) {
              console.error("Error unliking quote:", error);
            }
          },
        },
      ]
    );
  };

  const renderQuote = ({ item }: { item: Quote }) => (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteText}>"{item.text}"</Text>
      <Text style={styles.quoteAuthor}>— {item.author}</Text>
      {item.topic && (
        <View style={styles.topicBadge}>
          <Text style={styles.topicText}>{item.topic.name}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.unlikeButton}
        onPress={() => handleUnlike(item.id)}
      >
        <MaterialIcons name="favorite" size={24} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("favorites.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <FlatList
        data={likedQuotes || []}
        keyExtractor={(item) => item.id}
        renderItem={renderQuote}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#0A84FF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="favorite-border" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>{t("favorites.empty")}</Text>
            <Text style={styles.emptySubtext}>{t("favorites.emptySubtext")}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background } as ViewStyle,
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,
    backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" } as ViewStyle,
    headerTitle: { fontSize: 20, fontWeight: "600", color: colors.text } as TextStyle,
    placeholder: { width: 40 } as ViewStyle,
    listContent: { padding: 20 } as ViewStyle,
    quoteCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      position: "relative",
    } as ViewStyle,
    quoteText: { fontSize: 16, lineHeight: 24, color: colors.text, fontStyle: "italic", marginBottom: 12 } as TextStyle,
    quoteAuthor: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" } as TextStyle,
    topicBadge: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginTop: 12,
    } as ViewStyle,
    topicText: { fontSize: 12, color: colors.primary, fontWeight: "600" } as TextStyle,
    unlikeButton: { position: "absolute", top: 16, right: 16 } as ViewStyle,
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100 } as ViewStyle,
    emptyText: { fontSize: 18, fontWeight: "600", color: colors.text, marginTop: 16 } as TextStyle,
    emptySubtext: { fontSize: 14, color: colors.textTertiary, marginTop: 8, textAlign: "center" } as TextStyle,
  });

