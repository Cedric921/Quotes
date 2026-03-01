import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedPlan } from "../store/slices/subscriptionSlice";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import {
  useSubscriptionData,
  useCreateCheckoutSession,
  useSubscriptionHistory,
} from "../api/hooks/useSubscriptions";
import {
  Subscription,
  SubscriptionPlan,
} from "../store/slices/subscriptionSlice";

interface SubscriptionScreenProps {
  readonly navigation: any;
}

export default function SubscriptionScreen({
  navigation,
}: SubscriptionScreenProps) {
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const styles = createStyles(colors);
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.auth.token);
  const selectedPlanId = useAppSelector(
    (state) => state.subscription.selectedPlanId,
  );
  const isAuthenticated = !!token;

  // React Query hooks
  const { plans, currentSubscription, isLoading, refetch } =
    useSubscriptionData(isAuthenticated);
  const checkoutMutation = useCreateCheckoutSession();
  const { data: subscriptionHistory = [] } =
    useSubscriptionHistory(isAuthenticated);

  const [subscribing, setSubscribing] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSelectPlan = (planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(setSelectedPlan(planId));
  };

  const handleSubscribe = async () => {
    if (!selectedPlanId || !token) {
      if (!token) {
        navigation.navigate("Login");
      }
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubscribing(true);

    try {
      // 1. Create checkout session on backend
      const result = await checkoutMutation.mutateAsync(selectedPlanId);

      if (!result.checkoutUrl) {
        throw new Error("No checkout URL received");
      }

      // 2. Open Stripe Checkout in browser
      const browserResult = await WebBrowser.openBrowserAsync(
        result.checkoutUrl,
        {
          dismissButtonStyle: "cancel",
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        },
      );

      // 3. When browser closes, check if payment was successful
      if (browserResult.type === "cancel") {
        Toast.show({
          type: "info",
          text1: t("subscription.paymentCancelled"),
          text2: t("subscription.paymentCancelledMessage"),
        });
        return;
      }

      // 4. Browser was dismissed - refresh to check if subscription was created
      Toast.show({
        type: "info",
        text1: t("subscription.processing"),
        text2: t("subscription.checkingPayment"),
      });

      // Refresh data after a delay to allow webhook to process
      setTimeout(() => {
        refetch();
        Toast.show({
          type: "success",
          text1: t("subscription.paymentSuccess"),
          text2: t("subscription.subscriptionActivated"),
        });
      }, 3000);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("subscription.error"),
        text2: error.message || t("subscription.tryAgain"),
      });
    } finally {
      setSubscribing(false);
    }
  };

  const getStatusBadge = () => {
    if (!currentSubscription) return null;

    const statusColors: Record<string, { bg: string; text: string }> = {
      ACTIVE: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e" },
      CANCELLED: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" },
      EXPIRED: { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280" },
    };

    const statusColor =
      statusColors[currentSubscription.status] || statusColors.EXPIRED;
    const statusText =
      currentSubscription.status === "ACTIVE"
        ? t("subscription.subscriptionActive")
        : currentSubscription.status === "CANCELLED"
          ? t("subscription.subscriptionCancelled")
          : t("subscription.subscriptionExpired");

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
        <Text style={[styles.statusText, { color: statusColor.text }]}>
          {statusText}
        </Text>
      </View>
    );
  };

  const isCheckoutLoading = checkoutMutation.isPending || subscribing;

  if (isLoading) {
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Subscription Status */}
        {currentSubscription && (
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Text style={styles.currentPlanTitle}>
                {t("subscription.currentPlan")}
              </Text>
              {getStatusBadge()}
            </View>
            <Text style={styles.currentPlanName}>
              {currentSubscription.plan?.name || t("subscription.freeTrial")}
            </Text>
            {currentSubscription.endDate && (
              <Text style={styles.currentPlanExpiry}>
                {t("subscription.expiresOn", {
                  date: new Date(
                    currentSubscription.endDate,
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
                text: t("subscription.features.premiumTopics"),
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

        {/* Plans */}
        <Text style={styles.sectionTitle}>{t("subscription.choosePlan")}</Text>

        {/* All Available Plans */}
        {plans.map((plan: SubscriptionPlan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlanId === plan.id && styles.planCardSelected,
            ]}
            onPress={() => handleSelectPlan(plan.id)}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              {selectedPlanId === plan.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </View>
            {plan.description && (
              <Text style={styles.planDescription}>{plan.description}</Text>
            )}
            <View style={styles.planPricing}>
              <Text style={styles.planPrice}>
                €{Number(plan.price).toFixed(2)}
              </Text>
              <Text style={styles.planPeriod}>
                / {plan.durationMonths}{" "}
                {plan.durationMonths === 1 ? "mois" : "mois"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            !selectedPlanId && styles.subscribeButtonDisabled,
          ]}
          onPress={handleSubscribe}
          disabled={!selectedPlanId || isCheckoutLoading}
        >
          <LinearGradient
            colors={
              selectedPlanId ? ["#667eea", "#764ba2"] : ["#9ca3af", "#9ca3af"]
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
    termsNotice: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 32,
      paddingHorizontal: 20,
    } as TextStyle,
  });
