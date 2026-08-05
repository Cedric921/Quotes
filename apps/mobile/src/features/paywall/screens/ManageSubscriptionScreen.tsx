import React, { useMemo } from "react";
import { Linking, Platform, View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../../theme";
import {
  Button,
  Card,
  GradientBorderCard,
  Sheet,
  SettingsRow,
  SettingsSection,
  Text,
} from "../../../ui";
import { useAppSelector } from "../../../store/hooks";
import { useUserPayments, type Payment } from "../../../api/hooks/useUser";
import { usePaywall } from "../usePaywall";
import { notifyError, notifySuccess } from "../../auth/feedback";

/**
 * Both stores insist that cancelling happens on their own screen, so the app
 * links out rather than pretending to own the subscription.
 */
const STORE_SUBSCRIPTIONS_URL = Platform.select({
  ios: "itms-apps://apps.apple.com/account/subscriptions",
  android: "https://play.google.com/store/account/subscriptions",
  default: "https://play.google.com/store/account/subscriptions",
});

const useStyles = makeStyles((t) => ({
  status: { marginBottom: t.space.xl, gap: t.space.xxs },
  cta: { marginTop: t.space.lg },
  payment: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.space.md,
    paddingVertical: t.space.sm,
  },
  paymentCopy: { flex: 1, gap: t.space.xxs },
  empty: { marginTop: t.space.xs },
}));

export interface ManageSubscriptionScreenProps {
  onBack: () => void;
  onOpenPaywall: () => void;
}

/**
 * Settings › Premium. It answers three questions and nothing else: what am I
 * on, what have I paid, and where do I cancel.
 *
 * v1 answered them inside the 814-line subscription screen, next to the plan
 * picker — so reading your status meant scrolling past an offer.
 */
export function ManageSubscriptionScreen({
  onBack,
  onOpenPaywall,
}: ManageSubscriptionScreenProps) {
  const s = useStyles();
  const { t, i18n } = useTranslation();
  const user = useAppSelector((st) => st.auth.user);
  const isSubscribed = user?.isSubscribed ?? false;
  const { restore, isRestoring } = usePaywall();
  const { data: payments = [], isLoading } = useUserPayments();

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [i18n.language],
  );

  const amountFmt = useMemo(
    () => (payment: Payment) =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: payment.currency || "EUR",
      }).format(payment.amount),
    [i18n.language],
  );

  const renewal = user?.subscriptionEndDate
    ? dateFmt.format(new Date(user.subscriptionEndDate))
    : undefined;

  const onRestore = async () => {
    try {
      await restore();
      notifySuccess("subscription.restoreSuccess");
    } catch {
      notifyError("subscription.noPurchasesToRestore");
    }
  };

  const status = (
    <View style={s.status}>
      <Text variant="caption" tone="tertiary">
        {t("subscription.currentPlan").toUpperCase()}
      </Text>
      <Text variant="title">
        {isSubscribed ? t("subscription.premium") : t("profile.free")}
      </Text>
      {isSubscribed ? (
        <Text variant="body" tone="dim">
          {renewal
            ? t("subscription.renewsOn", { date: renewal })
            : t("subscription.subscriptionActive")}
        </Text>
      ) : (
        <Text variant="body" tone="dim">
          {t("subscription.noSubscription")}
        </Text>
      )}
    </View>
  );

  return (
    <Sheet title={t("settings.manageSubscription")} onBack={onBack} collapsedOnly>
      {/* The gradient outline is the premium marker; a free plan gets a plain card. */}
      {isSubscribed ? (
        <GradientBorderCard>{status}</GradientBorderCard>
      ) : (
        <Card>
          {status}
          <View style={s.cta}>
            <Button
              label={t("settings.unlockAll")}
              variant="gradient"
              onPress={onOpenPaywall}
            />
          </View>
        </Card>
      )}

      <SettingsSection title={t("subscription.title")}>
        <SettingsRow
          icon="refresh-outline"
          label={t("subscription.restorePurchases")}
          onPress={() => void onRestore()}
          value={isRestoring ? t("subscription.processing") : undefined}
        />
        <SettingsRow
          icon="open-outline"
          label={t("subscription.manageInStore")}
          onPress={() => void Linking.openURL(STORE_SUBSCRIPTIONS_URL)}
        />
      </SettingsSection>

      <SettingsSection title={t("subscription.paymentHistory")}>
        {payments.length > 0 ? (
          payments.map((payment) => (
            <View key={payment.id} style={s.payment}>
              <View style={s.paymentCopy}>
                <Text variant="body">{payment.planName}</Text>
                <Text variant="caption" tone="tertiary">
                  {dateFmt.format(new Date(payment.paidAt ?? payment.createdAt))}
                </Text>
              </View>
              <Text variant="label">{amountFmt(payment)}</Text>
            </View>
          ))
        ) : (
          <View style={s.payment}>
            <Text variant="body" tone="dim" style={s.empty}>
              {isLoading ? t("common.loading") : t("subscription.noPayments")}
            </Text>
          </View>
        )}
      </SettingsSection>
    </Sheet>
  );
}
