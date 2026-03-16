import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeColors } from "../../hooks";
import { useTranslation } from "react-i18next";
import { useSubscriptionPlans } from "../../api/hooks/useSubscriptions";
import { SubscriptionPlan } from "../../store/slices/subscriptionSlice";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DONT_SHOW_AGAIN_KEY = "@focus_dont_show_onboarding";

interface SubscriptionBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

export default function SubscriptionBottomSheet({
  isVisible,
  onClose,
  onSelectPlan,
}: SubscriptionBottomSheetProps) {
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [step, setStep] = useState<"welcome" | "plans">("welcome");

  const { data: plans = [], isLoading } = useSubscriptionPlans(true);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlanId(plan.id);
  };

  const handleContinueToPlans = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("plans");
  };

  const handleContinue = () => {
    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (selectedPlan) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelectPlan(selectedPlan);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("welcome");
    onClose();
  };

  const handleDontShowAgain = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem(DONT_SHOW_AGAIN_KEY, "true");
    setStep("welcome");
    onClose();
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={handleSkip}
    >
      <TouchableWithoutFeedback onPress={handleSkip}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={styles.sheetContainer}>
        <View style={styles.handleBar} />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {step === "welcome" ? (
            <>
              {/* Welcome Step */}
              <View style={styles.header}>
                <Ionicons name="diamond" size={48} color="#667eea" />
                <Text style={styles.title}>{t("onboarding.welcomeTitle")}</Text>
                <Text style={styles.subtitle}>
                  {t("onboarding.welcomeSubtitle")}
                </Text>
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
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

              {/* Continue Button */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinueToPlans}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.continueButtonText}>
                      {t("onboarding.continue")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Plans Step */}
              <View style={styles.header}>
                <Ionicons name="sparkles" size={48} color="#667eea" />
                <Text style={styles.title}>{t("onboarding.choosePlan")}</Text>
                <Text style={styles.subtitle}>
                  {t("onboarding.choosePlanSubtitle")}
                </Text>
              </View>

              {/* Plans */}
              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                  style={styles.loader}
                />
              ) : (
                <View style={styles.plansContainer}>
                  {plans.map((plan: SubscriptionPlan) => (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.planCard,
                        selectedPlanId === plan.id && styles.planCardSelected,
                      ]}
                      onPress={() => handleSelectPlan(plan)}
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
                        <Text style={styles.planDescription}>
                          {plan.description}
                        </Text>
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
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    !selectedPlanId && styles.buttonDisabled,
                  ]}
                  onPress={handleContinue}
                  disabled={!selectedPlanId}
                >
                  <LinearGradient
                    colors={
                      selectedPlanId
                        ? ["#667eea", "#764ba2"]
                        : ["#9ca3af", "#9ca3af"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.continueButtonText}>
                      {t("onboarding.subscribe")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Not now - Subtle button */}
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <Text style={styles.skipButtonText}>
                    {t("onboarding.notNow")}
                  </Text>
                </TouchableOpacity>

                {/* Don't show again - Very subtle */}
                <TouchableOpacity
                  style={styles.dontShowAgainButton}
                  onPress={handleDontShowAgain}
                >
                  <Text style={styles.dontShowAgainText}>
                    {t("onboarding.dontShowAgain")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sheetContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      maxHeight: SCREEN_HEIGHT * 0.85,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
    },
    handleBar: {
      width: 40,
      height: 4,
      backgroundColor: colors.textTertiary,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 8,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      alignItems: "center",
      paddingVertical: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginTop: 16,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
      lineHeight: 22,
    },
    featuresContainer: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
      rowGap: 12,
      marginBottom: 20,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 12,
    },
    featureText: {
      fontSize: 15,
      color: colors.text,
    },
    loader: {
      marginVertical: 40,
    },
    plansContainer: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    planCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "transparent",
    },
    planCardSelected: {
      borderColor: colors.primary,
    },
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    planName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    planDescription: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 4,
    },
    planPricing: {
      flexDirection: "row",
      alignItems: "baseline",
      marginTop: 8,
    },
    planPrice: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
    },
    planPeriod: {
      fontSize: 14,
      color: colors.textTertiary,
      marginLeft: 4,
    },
    actionsContainer: {
      paddingBottom: 40,
    },
    continueButton: {
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 12,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    gradientButton: {
      paddingVertical: 16,
      alignItems: "center",
    },
    continueButtonText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#fff",
    },
    skipButton: {
      paddingVertical: 12,
      alignItems: "center",
    },
    skipButtonText: {
      fontSize: 14,
      color: colors.textTertiary,
      opacity: 0.7,
    },
    dontShowAgainButton: {
      paddingVertical: 8,
      alignItems: "center",
      marginTop: 4,
    },
    dontShowAgainText: {
      fontSize: 12,
      color: colors.textTertiary,
      opacity: 0.5,
      textDecorationLine: "underline",
    },
  });
