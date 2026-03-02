import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useUserPayments, Payment } from "../api/hooks/useUser";

interface PaymentHistoryScreenProps {
  readonly navigation: any;
}

export default function PaymentHistoryScreen({ navigation }: PaymentHistoryScreenProps) {
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const styles = createStyles(colors);

  const { data: payments, isLoading, refetch, isRefetching } = useUserPayments();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency || "EUR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
      case "ACTIVE":
        return "#34C759";
      case "PENDING":
        return "#FF9500";
      case "FAILED":
      case "CANCELLED":
        return "#FF3B30";
      default:
        return colors.textTertiary;
    }
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.planName}>{item.planName}</Text>
          <Text style={styles.paymentDate}>{formatDate(item.paidAt || item.createdAt)}</Text>
        </View>
        <View style={styles.paymentAmount}>
          <Text style={styles.amount}>{formatAmount(item.amount, item.currency)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Calculate total spent
  const totalSpent = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("payments.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Total Spent Card */}
      <View style={styles.totalCard}>
        <MaterialIcons name="account-balance-wallet" size={32} color={colors.primary} />
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>{t("payments.totalSpent")}</Text>
          <Text style={styles.totalAmount}>{formatAmount(totalSpent, "EUR")}</Text>
        </View>
      </View>

      {/* Payments List */}
      <FlatList
        data={payments || []}
        keyExtractor={(item) => item.id}
        renderItem={renderPayment}
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
            <MaterialIcons name="receipt-long" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>{t("payments.empty")}</Text>
            <Text style={styles.emptySubtext}>{t("payments.emptySubtext")}</Text>
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
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    } as ViewStyle,
    backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" } as ViewStyle,
    headerTitle: { fontSize: 20, fontWeight: "600", color: colors.text } as TextStyle,
    placeholder: { width: 40 } as ViewStyle,
    totalCard: {
      flexDirection: "row", alignItems: "center", margin: 20, padding: 20,
      backgroundColor: colors.backgroundSecondary, borderRadius: 16, gap: 16,
    } as ViewStyle,
    totalInfo: { flex: 1 } as ViewStyle,
    totalLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 } as TextStyle,
    totalAmount: { fontSize: 28, fontWeight: "700", color: colors.text } as TextStyle,
    listContent: { paddingHorizontal: 20, paddingBottom: 20 } as ViewStyle,
    paymentCard: {
      backgroundColor: colors.backgroundSecondary, borderRadius: 12, padding: 16, marginBottom: 12,
    } as ViewStyle,
    paymentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" } as ViewStyle,
    paymentInfo: { flex: 1 } as ViewStyle,
    planName: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 4 } as TextStyle,
    paymentDate: { fontSize: 14, color: colors.textSecondary } as TextStyle,
    paymentAmount: { alignItems: "flex-end" } as ViewStyle,
    amount: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 4 } as TextStyle,
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 } as ViewStyle,
    statusText: { fontSize: 12, fontWeight: "600" } as TextStyle,
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100 } as ViewStyle,
    emptyText: { fontSize: 18, fontWeight: "600", color: colors.text, marginTop: 16 } as TextStyle,
    emptySubtext: { fontSize: 14, color: colors.textTertiary, marginTop: 8, textAlign: "center" } as TextStyle,
  });

