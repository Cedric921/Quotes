import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslatedSubscription, useThemeColors } from "../hooks";
import { SubscriptionPlan } from "../store/slices/subscriptionSlice";

interface TranslatedPlanCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onPress: () => void;
}

export function TranslatedPlanCard({
  plan,
  isSelected,
  onPress,
}: TranslatedPlanCardProps) {
  const { colors } = useThemeColors();
  const { translatedPlan, isTranslating } = useTranslatedSubscription(plan);

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        {
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        },
        isSelected && styles.planCardSelected,
      ]}
      onPress={onPress}
    >
      <View style={styles.planHeader}>
        <View style={styles.planNameContainer}>
          <Text style={[styles.planName, { color: colors.text }]}>
            {translatedPlan.name}
          </Text>
          {isTranslating && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.loadingIndicator}
            />
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </View>
      {translatedPlan.description && (
        <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
          {translatedPlan.description}
        </Text>
      )}
      <View style={styles.planPricing}>
        <Text style={[styles.planPrice, { color: colors.text }]}>
          €{Number(plan.price).toFixed(2)}
        </Text>
        <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
          / {plan.durationMonths} {plan.durationMonths === 1 ? "mois" : "mois"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  planCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  planCardSelected: {
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  planPricing: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "800",
  },
  planPeriod: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default TranslatedPlanCard;

