import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  GradientBorderCard,
  IconCircle,
  LinkButton,
  Screen,
  Text,
  Toggle,
} from "../../ui";
import { makeStyles } from "../../theme";
import { TrialTimeline, type TrialStep } from "./components/TrialTimeline";
import { usePaywall } from "./usePaywall";
import {
  cancelTrialReminder,
  requestNotificationPermissions,
  scheduleTrialReminder,
} from "../../services/notificationService";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "../../constants/appConfig";

const TRIAL_DAYS = 3;

const useStyles = makeStyles((t) => ({
  close: { alignSelf: "flex-start", marginBottom: t.space.xs },
  title: { marginBottom: t.space.xs },
  subtitle: { marginBottom: t.space.xl },
  reminder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: t.space.xl,
    marginBottom: t.space.md,
    paddingVertical: t.space.sm,
    paddingHorizontal: t.space.lg,
  },
  price: { marginTop: t.space.sm },
  legal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: t.space.lg,
  },
}));

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

export interface PaywallScreenProps {
  /** `fullscreen` ends the funnel; `sheet` is the crown button on the feed. */
  presentation: "fullscreen" | "sheet";
  onDismiss: () => void;
  /**
   * Opens the terms or the privacy policy inside the app. The funnel renders
   * this screen with no navigator around it and leaves this out, in which
   * case the in-app browser sheet stands in — still not a tab switch.
   */
  onOpenPage?: (url: string, titleKey: string) => void;
}

/**
 * One screen, two presentations.
 *
 * The content is identical — what changes is whether there is a close button
 * and whether dismissing means "skip" or "go back". Duplicating it as two
 * screens is how v1 ended up with an 814-line subscription file.
 */
export function PaywallScreen({
  presentation,
  onDismiss,
  onOpenPage,
}: PaywallScreenProps) {
  const s = useStyles();
  const { t, i18n } = useTranslation();
  const { offering, purchase, restore, isPurchasing } = usePaywall();
  const [remindMe, setRemindMe] = useState(false);

  const openPage = (url: string, titleKey: string) =>
    onOpenPage ? onOpenPage(url, titleKey) : void WebBrowser.openBrowserAsync(url);

  /**
   * The switch schedules the notification the timeline promises, on the same
   * day it shows — it was local state and nothing else, so the third step of
   * the trial timeline described something that never happened.
   *
   * A refused permission puts the switch back: a reminder that cannot fire
   * should not look armed.
   */
  const onRemindMe = useCallback(
    async (value: boolean) => {
      setRemindMe(value);

      if (!value) {
        await cancelTrialReminder();
        return;
      }

      const { granted } = await requestNotificationPermissions();
      if (!granted) {
        setRemindMe(false);
        return;
      }

      const scheduled = await scheduleTrialReminder(
        addDays(TRIAL_DAYS - 1),
        {
          title: t("paywall.reminderTitle"),
          body: t("paywall.reminderBody"),
        },
      );
      if (!scheduled) setRemindMe(false);
    },
    [t],
  );

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "short" }),
    [i18n.language],
  );

  const steps: TrialStep[] = [
    {
      icon: "checkmark-circle-outline",
      title: t("paywall.step.install.title"),
      subtitle: t("paywall.step.install.subtitle"),
      done: true,
    },
    {
      icon: "lock-open-outline",
      title: t("paywall.step.today.title"),
      subtitle: t("paywall.step.today.subtitle", { days: TRIAL_DAYS }),
    },
    {
      icon: "notifications-outline",
      title: t("paywall.step.reminder.title", {
        date: dateFmt.format(addDays(TRIAL_DAYS - 1)),
      }),
      subtitle: t("paywall.step.reminder.subtitle"),
    },
    {
      icon: "ribbon-outline",
      title: t("paywall.step.member.title", {
        date: dateFmt.format(addDays(TRIAL_DAYS)),
      }),
      subtitle: t("paywall.step.member.subtitle"),
    },
  ];

  return (
    <Screen
      header={
        presentation === "sheet" ? (
          <View style={{ paddingHorizontal: 16 }}>
            <IconCircle
              icon="close"
              label={t("common.close")}
              onPress={onDismiss}
            />
          </View>
        ) : undefined
      }
      footer={
        <>
          <Button
            variant="gradient"
            label={t("paywall.cta", { price: offering?.introPrice ?? "0,00 €" })}
            loading={isPurchasing}
            onPress={() => void purchase()}
          />
          <Text variant="body" tone="dim" align="center" style={s.price}>
            {t("paywall.priceLine", {
              monthly: offering?.monthlyEquivalent ?? "—",
              yearly: offering?.price ?? "—",
            })}
          </Text>
          <View style={s.legal}>
            <LinkButton
              size="small"
              label={t("paywall.restore")}
              onPress={() => void restore()}
            />
            <LinkButton
              size="small"
              label={t("paywall.terms")}
              onPress={() => openPage(LEGAL_TERMS_URL, "settings.terms")}
            />
            <LinkButton
              size="small"
              label={t("paywall.privacy")}
              onPress={() => openPage(LEGAL_PRIVACY_URL, "settings.privacy")}
            />
          </View>
        </>
      }
    >
      <Text variant="display" align="center" style={s.title}>
        {t("paywall.title")}
      </Text>
      <Text variant="body" tone="dim" align="center" style={s.subtitle}>
        {t("paywall.subtitle")}
      </Text>

      <GradientBorderCard>
        <TrialTimeline steps={steps} />
      </GradientBorderCard>

      <Card style={s.reminder}>
        <Text variant="body">{t("paywall.remindMe")}</Text>
        <Toggle
          value={remindMe}
          onChange={(value) => void onRemindMe(value)}
          label={t("paywall.remindMe")}
        />
      </Card>
    </Screen>
  );
}
