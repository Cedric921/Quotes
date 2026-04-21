import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useRoute, RouteProp } from "@react-navigation/native";
import { PurchasesPackage } from "react-native-purchases";
import {
  usePackages,
  useCustomerInfo,
  usePurchase,
  useRestorePurchases,
} from "../api/hooks/usePurchases";
import { Subscription } from "../store/slices/subscriptionSlice";
import { useSubscriptionHistory } from "../api/hooks/useSubscriptions";
import { RootStackParamList } from "../navigation/AppNavigator";

interface SubscriptionScreenProps {
  readonly navigation: any;
}

type SubscriptionScreenRouteProp = RouteProp<
  RootStackParamList,
  "Subscription"
>;

export default function SubscriptionScreen({
  navigation,
}: SubscriptionScreenProps) {
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const styles = createStyles(colors);
  const route = useRoute<SubscriptionScreenRouteProp>();

  // Check if coming from profile button
  const fromProfile = route.params?.fromProfile ?? false;

  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = !!token;

  // RevenueCat hooks
  const {
    data: packages = [],
    isLoading: packagesLoading,
    refetch: refetchPackages,
  } = usePackages();
  const {
    customerInfo,
    isPremium,
    refetch: refetchCustomerInfo,
  } = useCustomerInfo();
  const purchaseMutation = usePurchase();
  const restoreMutation = useRestorePurchases();

  // Legacy subscription history from backend
  const { data: subscriptionHistory = [] } =
    useSubscriptionHistory(isAuthenticated);

  // Selected package state
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefresh = async () => {
    setIsRefetching(true);
    try {
      await Promise.all([refetchPackages(), refetchCustomerInfo()]);
    } finally {
      setIsRefetching(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (fromProfile) {
      navigation.navigate("Profile");
    } else {
      navigation.goBack();
    }
  };

  const handleSelectPackage = (pkg: PurchasesPackage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPackage(pkg);
  };

  const handleSubscribe = async () => {
    if (!selectedPackage) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await purchaseMutation.mutateAsync(selectedPackage);
      Toast.show({
        type: "success",
        text1: t("subscription.paymentSuccess"),
        text2: t("subscription.subscriptionActivated"),
      });
    } catch (error: any) {
      if (error.userCancelled) {
        Toast.show({
          type: "info",
          text1: t("subscription.paymentCancelled"),
          text2: t("subscription.paymentCancelledMessage"),
        });
      } else {
        Toast.show({
          type: "error",
          text1: t("subscription.error"),
          text2: error.message || t("subscription.tryAgain"),
        });
      }
    }
  };

  const handleRestorePurchases = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const info = await restoreMutation.mutateAsync();
      if (info.entitlements.active["premium"]) {
        Toast.show({
          type: "success",
          text1: t("subscription.restoreSuccess"),
          text2: t("subscription.subscriptionActivated"),
        });
      } else {
        Toast.show({
          type: "info",
          text1: t("subscription.noSubscription"),
          text2: t("subscription.noPurchasesToRestore"),
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("subscription.error"),
        text2: error.message || t("subscription.tryAgain"),
      });
    }
  };

  const getStatusBadge = () => {
    if (!isPremium) return null;

    return (
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: "rgba(34, 197, 94, 0.1)" },
        ]}
      >
        <Text style={[styles.statusText, { color: "#22c55e" }]}>
          {t("subscription.subscriptionActive")}
        </Text>
      </View>
    );
  };

  const isCheckoutLoading =
    purchaseMutation.isPending || restoreMutation.isPending;

  if (packagesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("subscription.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Current Premium Status */}
        {isPremium && (
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Text style={styles.currentPlanTitle}>
                {t("subscription.currentPlan")}
              </Text>
              {getStatusBadge()}
            </View>
            <Text style={styles.currentPlanName}>
              {t("subscription.premium")}
            </Text>
            {customerInfo?.entitlements.active["premium"]?.expirationDate && (
              <Text style={styles.currentPlanExpiry}>
                {t("subscription.expiresOn", {
                  date: new Date(
                    customerInfo.entitlements.active["premium"].expirationDate,
                  ).toLocaleDateString(),
                })}
              </Text>
            )}
          </View>
        )}

        {/* Premium Features */}
        <View style={styles.featuresCard}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuresGradient}
          >
            <Ionicons name="diamond" size={32} color="#fff" />
            <Text style={styles.featuresTitle}>
              {t("subscription.features.title")}
            </Text>
          </LinearGradient>
          <View style={styles.featuresList}>
            {[
              {
                icon: "infinite",
                text: t("subscription.features.unlimitedQuotes"),
              },
              {
                icon: "star",
                text: t("subscription.features.premiumSubjects"),
              },
              {
                icon: "notifications",
                text: t("subscription.features.customNotifications"),
              },
              {
                icon: "cloud-offline",
                text: t("subscription.features.offlineAccess"),
              },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name={feature.icon as any}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plans from RevenueCat */}
        {!isPremium && (
          <>
            <Text style={styles.sectionTitle}>
              {t("subscription.choosePlan")}
            </Text>

            {packages.map((pkg: PurchasesPackage) => (
              <TouchableOpacity
                key={pkg.identifier}
                style={[
                  styles.planCard,
                  selectedPackage?.identifier === pkg.identifier &&
                    styles.planCardSelected,
                ]}
                onPress={() => handleSelectPackage(pkg)}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>
                    {pkg.product.title || pkg.identifier}
                  </Text>
                  <Ionicons
                    name={
                      selectedPackage?.identifier === pkg.identifier
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={24}
                    color={
                      selectedPackage?.identifier === pkg.identifier
                        ? colors.primary
                        : colors.textTertiary
                    }
                  />
                </View>
                <View style={styles.planPricing}>
                  <Text style={styles.planPrice}>
                    {pkg.product.priceString}
                  </Text>
                  <Text style={styles.planPeriod}>
                    /
                    {pkg.packageType === "ANNUAL"
                      ? t("subscription.year")
                      : t("subscription.month")}
                  </Text>
                </View>
                {pkg.product.description && (
                  <Text style={styles.planDescription}>
                    {pkg.product.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Subscribe Button */}
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                !selectedPackage && styles.subscribeButtonDisabled,
              ]}
              onPress={handleSubscribe}
              disabled={!selectedPackage || isCheckoutLoading}
            >
              <LinearGradient
                colors={
                  selectedPackage
                    ? ["#667eea", "#764ba2"]
                    : ["#9ca3af", "#9ca3af"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeGradient}
              >
                {isCheckoutLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.subscribeButtonText}>
                    {t("subscription.subscribe")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Restore Purchases Button (iOS requirement) */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestorePurchases}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.restoreButtonText}>
                  {t("subscription.restorePurchases")}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Subscription History */}
        {isAuthenticated && subscriptionHistory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t("subscription.history")}</Text>
            {subscriptionHistory.map((sub: Subscription, index: number) => (
              <View key={sub.id || index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyPlanName}>
                    {sub.plan?.name || "Plan"}
                  </Text>
                  <View
                    style={[
                      styles.historyStatusBadge,
                      {
                        backgroundColor:
                          sub.status === "ACTIVE"
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(107, 114, 128, 0.1)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyStatusText,
                        {
                          color:
                            sub.status === "ACTIVE" ? "#22c55e" : "#6b7280",
                        },
                      ]}
                    >
                      {sub.status === "ACTIVE"
                        ? t("subscription.subscriptionActive")
                        : sub.status === "CANCELLED"
                          ? t("subscription.subscriptionCancelled")
                          : t("subscription.subscriptionExpired")}
                    </Text>
                  </View>
                </View>
                <View style={styles.historyDates}>
                  <Text style={styles.historyDateText}>
                    {new Date(sub.startDate).toLocaleDateString()} -{" "}
                    {sub.endDate
                      ? new Date(sub.endDate).toLocaleDateString()
                      : t("subscription.ongoing")}
                  </Text>
                  {sub.amountPaid && (
                    <Text style={styles.historyAmountText}>
                      €{Number(sub.amountPaid).toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Not Now Link */}
        <TouchableOpacity
          style={styles.notNowButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Navigate based on authentication status and source
            if (fromProfile || isAuthenticated) {
              navigation.navigate("Profile");
            } else {
              navigation.navigate("Signup");
            }
          }}
        >
          <Text style={styles.notNowText}>{t("subscription.notNow")}</Text>
        </TouchableOpacity>

        {/* Terms Notice */}
        <Text style={styles.termsNotice}>{t("subscription.termsNotice")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
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
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
    headerTitle: {
      fontSize: 20,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    placeholder: {
      width: 40,
    } as ViewStyle,
    content: {
      flex: 1,
      paddingHorizontal: 20,
    } as ViewStyle,
    currentPlanCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
    } as ViewStyle,
    currentPlanHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    } as ViewStyle,
    currentPlanTitle: {
      fontSize: 14,
      color: colors.textTertiary,
    } as TextStyle,
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    } as ViewStyle,
    statusText: {
      fontSize: 12,
      fontWeight: "600" as const,
    } as TextStyle,
    currentPlanName: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.text,
      marginBottom: 4,
    } as TextStyle,
    currentPlanExpiry: {
      fontSize: 14,
      color: colors.textTertiary,
    } as TextStyle,
    featuresCard: {
      marginTop: 20,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.backgroundSecondary,
    } as ViewStyle,
    featuresGradient: {
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      columnGap: 12,
    } as ViewStyle,
    featuresTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: "#fff",
    } as TextStyle,
    featuresList: {
      padding: 16,
      rowGap: 12,
    } as ViewStyle,
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 12,
    } as ViewStyle,
    featureText: {
      fontSize: 15,
      color: colors.text,
    } as TextStyle,
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: colors.text,
      marginTop: 24,
      marginBottom: 12,
    } as TextStyle,
    planCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "transparent",
    } as ViewStyle,
    planCardSelected: {
      borderColor: colors.primary,
    } as ViewStyle,
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    } as ViewStyle,
    planName: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    planPricing: {
      flexDirection: "row",
      alignItems: "baseline",
      marginTop: 8,
    } as ViewStyle,
    planPrice: {
      fontSize: 28,
      fontWeight: "700" as const,
      color: colors.text,
    } as TextStyle,
    planPeriod: {
      fontSize: 14,
      color: colors.textTertiary,
      marginLeft: 4,
    } as TextStyle,
    planDescription: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 4,
      marginBottom: 8,
    } as TextStyle,
    discountBadge: {
      position: "absolute",
      top: -8,
      right: 12,
      backgroundColor: "#22c55e",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    } as ViewStyle,
    discountText: {
      fontSize: 12,
      fontWeight: "700" as const,
      color: "#fff",
    } as TextStyle,
    trialButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      columnGap: 8,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      marginTop: 12,
    } as ViewStyle,
    trialButtonText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.primary,
    } as TextStyle,
    buttonDisabled: {
      opacity: 0.6,
    } as ViewStyle,
    subscribeButton: {
      marginTop: 20,
      borderRadius: 16,
      overflow: "hidden",
    } as ViewStyle,
    subscribeButtonDisabled: {
      opacity: 0.7,
    } as ViewStyle,
    subscribeGradient: {
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    subscribeButtonText: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: "#fff",
    } as TextStyle,
    billingSummaryCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      marginTop: 24,
    } as ViewStyle,
    billingSummaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 12,
      marginBottom: 16,
    } as ViewStyle,
    billingSummaryTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    billingSummaryContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    } as ViewStyle,
    billingStat: {
      alignItems: "center",
    } as ViewStyle,
    billingStatValue: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: colors.text,
    } as TextStyle,
    billingStatLabel: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 4,
    } as TextStyle,
    billingStatDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
    } as ViewStyle,
    historyCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    } as ViewStyle,
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    } as ViewStyle,
    historyPlanName: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    historyStatusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    } as ViewStyle,
    historyStatusText: {
      fontSize: 11,
      fontWeight: "600" as const,
    } as TextStyle,
    historyDates: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    } as ViewStyle,
    historyDateText: {
      fontSize: 13,
      color: colors.textTertiary,
    } as TextStyle,
    historyAmountText: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.primary,
    } as TextStyle,
    restoreButton: {
      marginTop: 16,
      alignItems: "center",
      padding: 12,
    } as ViewStyle,
    restoreButtonText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "500" as const,
    } as TextStyle,
    notNowButton: {
      marginTop: 16,
      alignItems: "center",
      padding: 12,
    } as ViewStyle,
    notNowText: {
      fontSize: 14,
      color: colors.textTertiary,
      textDecorationLine: "underline",
    } as TextStyle,
    termsNotice: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 32,
      paddingHorizontal: 20,
    } as TextStyle,
  });
