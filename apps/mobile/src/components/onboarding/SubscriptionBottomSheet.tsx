import { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "../../hooks";
import { useTranslation } from "react-i18next";
import { useSubscriptionPlans } from "../../api/hooks/useSubscriptions";
import { SubscriptionPlan } from "../../store/slices/subscriptionSlice";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useSubscriptionPlans(true);

  const snapPoints = useMemo(() => ["75%", "90%"], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlanId(plan.id);
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
    bottomSheetRef.current?.close();
  };

  if (!isVisible) return null;

  const styles = createStyles(colors);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
    >
      <BottomSheetScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="diamond" size={48} color="#667eea" />
          <Text style={styles.title}>{t("onboarding.welcomeTitle")}</Text>
          <Text style={styles.subtitle}>{t("onboarding.welcomeSubtitle")}</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {[
            {
              icon: "infinite",
              text: t("subscription.features.unlimitedQuotes"),
            },
            { icon: "star", text: t("subscription.features.premiumTopics") },
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

        {/* Plans */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : (
          <View style={styles.plansContainer}>
            <Text style={styles.sectionTitle}>
              {t("onboarding.choosePlan")}
            </Text>
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
                selectedPlanId ? ["#667eea", "#764ba2"] : ["#9ca3af", "#9ca3af"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.continueButtonText}>
                {t("onboarding.continue")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>
              {t("onboarding.skipForNow")}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
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
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
