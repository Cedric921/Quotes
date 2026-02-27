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
import { useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedPlan } from "../store/slices/subscriptionSlice";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import {
  useSubscriptionData,
  useStartFreeTrial,
  useCreateCheckout,
  useSubscriptionHistory,
  useUserPayments,
  Payment,
} from "../api/hooks/useSubscriptions";
import { Subscription } from "../store/slices/subscriptionSlice";

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
  const { plans, config, currentSubscription, isLoading, refetch } =
    useSubscriptionData(isAuthenticated);
  const startTrialMutation = useStartFreeTrial();
  const checkoutMutation = useCreateCheckout();
  const { data: subscriptionHistory = [] } =
    useSubscriptionHistory(isAuthenticated);
  const { data: payments = [] } = useUserPayments(isAuthenticated);

  const [subscribing, setSubscribing] = useState(false);

  // Calculate total spent
  const totalSpent = useMemo(() => {
    return payments
      .filter((p: Payment) => p.status === "SUCCEEDED")
      .reduce((sum: number, p: Payment) => sum + p.amount, 0);
  }, [payments]);

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
      const result = await checkoutMutation.mutateAsync(selectedPlanId);

      // Open Stripe Checkout in browser
      if (result.url) {
        const browserResult = await WebBrowser.openBrowserAsync(result.url);

        // Refresh data after returning from browser
        if (
          browserResult.type === "cancel" ||
          browserResult.type === "dismiss"
        ) {
          refetch();
        }
      }
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

  const handleStartTrial = async () => {
    if (!token) {
      navigation.navigate("Login");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await startTrialMutation.mutateAsync();
      Toast.show({
        type: "success",
        text1: t("subscription.trialStarted"),
        text2: t("subscription.enjoyTrial"),
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("subscription.error"),
        text2: error.message || t("subscription.tryAgain"),
      });
    }
  };

  const getStatusBadge = () => {
    if (!currentSubscription) return null;

    const statusColors: Record<string, { bg: string; text: string }> = {
      ACTIVE: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e" },
      TRIAL: { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6" },
      CANCELLED: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" },
      EXPIRED: { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280" },
      PAST_DUE: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" },
    };

    const statusColor =
      statusColors[currentSubscription.status] || statusColors.EXPIRED;
    const statusText =
      currentSubscription.status === "ACTIVE"
        ? t("subscription.subscriptionActive")
        : currentSubscription.status === "TRIAL"
          ? t("subscription.freeTrial")
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

  const monthlyPlan = plans.find((p) => p.type === "MONTHLY");
  const yearlyPlan = plans.find((p) => p.type === "YEARLY");
  const isTrialLoading = startTrialMutation.isPending;
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

        {/* Monthly Plan */}
        {monthlyPlan && (
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlanId === monthlyPlan.id && styles.planCardSelected,
            ]}
            onPress={() => handleSelectPlan(monthlyPlan.id)}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{t("subscription.monthly")}</Text>
              {selectedPlanId === monthlyPlan.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </View>
            <View style={styles.planPricing}>
              <Text style={styles.planPrice}>
                €{monthlyPlan.price.toFixed(2)}
              </Text>
              <Text style={styles.planPeriod}>
                {t("subscription.perMonth")}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Yearly Plan */}
        {yearlyPlan && (
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlanId === yearlyPlan.id && styles.planCardSelected,
            ]}
            onPress={() => handleSelectPlan(yearlyPlan.id)}
          >
            {yearlyPlan.discountPercentage > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {t("subscription.save", {
                    percent: yearlyPlan.discountPercentage,
                  })}
                </Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{t("subscription.yearly")}</Text>
              {selectedPlanId === yearlyPlan.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </View>
            <View style={styles.planPricing}>
              <Text style={styles.planPrice}>
                €{yearlyPlan.price.toFixed(2)}
              </Text>
              <Text style={styles.planPeriod}>{t("subscription.perYear")}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Free Trial Button */}
        {!currentSubscription && config && (
          <TouchableOpacity
            style={[
              styles.trialButton,
              isTrialLoading && styles.buttonDisabled,
            ]}
            onPress={handleStartTrial}
            disabled={isTrialLoading}
          >
            {isTrialLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="gift" size={20} color={colors.primary} />
                <Text style={styles.trialButtonText}>
                  {t("subscription.startTrial")} ({config.freemiumDurationDays}{" "}
                  {t("subscription.days")})
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

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

        {/* Billing Summary */}
        {isAuthenticated && (payments.length > 0 || totalSpent > 0) && (
          <View style={styles.billingSummaryCard}>
            <View style={styles.billingSummaryHeader}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.billingSummaryTitle}>
                {t("subscription.billingSummary")}
              </Text>
            </View>
            <View style={styles.billingSummaryContent}>
              <View style={styles.billingStat}>
                <Text style={styles.billingStatValue}>
                  €{totalSpent.toFixed(2)}
                </Text>
                <Text style={styles.billingStatLabel}>
                  {t("subscription.totalSpent")}
                </Text>
              </View>
              <View style={styles.billingStatDivider} />
              <View style={styles.billingStat}>
                <Text style={styles.billingStatValue}>{payments.length}</Text>
                <Text style={styles.billingStatLabel}>
                  {t("subscription.totalPayments")}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Subscription History */}
        {isAuthenticated && subscriptionHistory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t("subscription.history")}</Text>
            {subscriptionHistory.map((sub: Subscription, index: number) => (
              <View key={sub.id || index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyPlanName}>
                    {sub.plan?.name || t("subscription.freeTrial")}
                  </Text>
                  <View
                    style={[
                      styles.historyStatusBadge,
                      {
                        backgroundColor:
                          sub.status === "ACTIVE"
                            ? "rgba(34, 197, 94, 0.1)"
                            : sub.status === "TRIAL"
                              ? "rgba(59, 130, 246, 0.1)"
                              : "rgba(107, 114, 128, 0.1)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyStatusText,
                        {
                          color:
                            sub.status === "ACTIVE"
                              ? "#22c55e"
                              : sub.status === "TRIAL"
                                ? "#3b82f6"
                                : "#6b7280",
                        },
                      ]}
                    >
                      {sub.status === "ACTIVE"
                        ? t("subscription.subscriptionActive")
                        : sub.status === "TRIAL"
                          ? t("subscription.freeTrial")
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
                </View>
              </View>
            ))}
          </>
        )}

        {/* Payment History */}
        {isAuthenticated && payments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {t("subscription.paymentHistory")}
            </Text>
            {payments.slice(0, 5).map((payment: Payment, index: number) => (
              <View key={payment.id || index} style={styles.paymentCard}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentAmount}>
                    €{payment.amount.toFixed(2)}
                  </Text>
                  <Text style={styles.paymentDate}>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.paymentStatusBadge,
                    {
                      backgroundColor:
                        payment.status === "SUCCEEDED"
                          ? "rgba(34, 197, 94, 0.1)"
                          : payment.status === "PENDING"
                            ? "rgba(245, 158, 11, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentStatusText,
                      {
                        color:
                          payment.status === "SUCCEEDED"
                            ? "#22c55e"
                            : payment.status === "PENDING"
                              ? "#f59e0b"
                              : "#ef4444",
                      },
                    ]}
                  >
                    {payment.status === "SUCCEEDED"
                      ? t("subscription.paymentSucceeded")
                      : payment.status === "PENDING"
                        ? t("subscription.paymentPending")
                        : t("subscription.paymentFailed")}
                  </Text>
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
    } as ViewStyle,
    historyDateText: {
      fontSize: 13,
      color: colors.textTertiary,
    } as TextStyle,
    paymentCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    } as ViewStyle,
    paymentInfo: {
      flex: 1,
    } as ViewStyle,
    paymentAmount: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    paymentDate: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 2,
    } as TextStyle,
    paymentStatusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    } as ViewStyle,
    paymentStatusText: {
      fontSize: 11,
      fontWeight: "600" as const,
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
