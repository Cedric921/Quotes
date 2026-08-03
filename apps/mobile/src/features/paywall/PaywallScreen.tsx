import React, { useMemo, useState } from "react";
import { Linking, View } from "react-native";
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
}

/**
 * One screen, two presentations.
 *
 * The content is identical — what changes is whether there is a close button
 * and whether dismissing means "skip" or "go back". Duplicating it as two
 * screens is how v1 ended up with an 814-line subscription file.
 */
export function PaywallScreen({ presentation, onDismiss }: PaywallScreenProps) {
  const s = useStyles();
  const { t, i18n } = useTranslation();
  const { offering, purchase, restore, isPurchasing } = usePaywall();
  const [remindMe, setRemindMe] = useState(false);

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
            <LinkButton label={t("paywall.restore")} onPress={() => void restore()} />
            <LinkButton
              label={t("paywall.terms")}
              onPress={() => void Linking.openURL(LEGAL_TERMS_URL)}
            />
            <LinkButton
              label={t("paywall.privacy")}
              onPress={() => void Linking.openURL(LEGAL_PRIVACY_URL)}
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
          onChange={setRemindMe}
          label={t("paywall.remindMe")}
        />
      </Card>
    </Screen>
  );
}
