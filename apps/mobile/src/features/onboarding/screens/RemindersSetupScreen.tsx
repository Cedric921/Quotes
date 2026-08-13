import React, { useEffect, useState } from "react";
import { Image, Platform, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  IconCircle,
  LinkButton,
  Screen,
  Stepper,
  Text,
  TimeRow,
} from "../../../ui";
import { makeStyles } from "../../../theme";
import { remindersService } from "../../../services/remindersService";
import { useSyncReminders } from "../../../api/hooks/useRemindersSync";
import { useAppSelector } from "../../../store/hooks";
import {
  FREE_REMINDERS_PER_DAY,
  MAX_REMINDERS_PER_DAY,
} from "../../../constants/appConfig";

const useStyles = makeStyles((t) => ({
  title: { marginTop: t.space.xl },
  subtitle: { marginTop: t.space.sm, marginBottom: t.space.xl },
  preview: { flexDirection: "row", gap: t.space.sm, alignItems: "center" },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: t.radius.sm,
    backgroundColor: t.palette.ink900,
    alignItems: "center",
    justifyContent: "center",
  },
  // The preview is a notification, and a notification shows the app's own
  // icon — this one showed a quotation mark, the reference app's mark.
  previewLogo: { width: 30, height: 30, tintColor: t.base.textPrimary },
  previewBody: { flex: 1 },
  rows: { gap: t.space.sm, marginTop: t.space.xl },
  top: { paddingHorizontal: t.gutter, minHeight: 56, justifyContent: "center" },
  limit: { marginTop: t.space.md, alignItems: "center", gap: t.space.xxs },
}));

const LOGO = require("../../../../assets/images/source-icon-transparent.png");

const fmt = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const at = (h: number) => {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d;
};

/**
 * Count, start, end — then one prompt.
 *
 * The system permission dialog fires on "Autoriser et enregistrer", never on
 * screen entry: asking before the user has seen what they'd be agreeing to is
 * how apps lose the permission for good.
 */
export interface RemindersSetupScreenProps {
  /** Called once the schedule is saved — advances the funnel, or closes. */
  onDone: () => void;
  ctaLabelKey?: string;
  /**
   * Shows a back chevron. Absent in the funnel, which only moves forward;
   * set from the profile, where the screen is a page you can leave unsaved.
   */
  onBack?: () => void;
  /** Where the free-tier note sends people who want more. */
  onOpenPaywall?: () => void;
}

export function RemindersSetupScreen({
  onDone,
  ctaLabelKey = "onboarding.reminders.cta",
  onBack,
  onOpenPaywall,
}: RemindersSetupScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const syncReminders = useSyncReminders();
  const isSubscribed = useAppSelector(
    (st) => st.auth.user?.isSubscribed ?? false,
  );

  // The stepper stops where the tier stops. Letting a free account pick
  // twenty and quietly delivering ten is the kind of gap that reads as a
  // broken app, not as a plan limit.
  const maxCount = isSubscribed ? MAX_REMINDERS_PER_DAY : FREE_REMINDERS_PER_DAY;

  const [count, setCount] = useState(10);
  const [start, setStart] = useState(at(9));
  const [end, setEnd] = useState(at(22));

  // Reopened from the profile, the screen shows what is actually scheduled
  // rather than the funnel's defaults.
  useEffect(() => {
    void remindersService.loadSchedule().then((saved) => {
      if (!saved) return;
      setCount(saved.count);
      setStart(at(saved.startHour));
      setEnd(at(saved.endHour));
    });
  }, []);

  // A schedule saved under premium, reopened after it lapsed, gets pulled
  // back inside the free ceiling the moment the screen knows it.
  useEffect(() => {
    setCount((current) => Math.min(current, maxCount));
  }, [maxCount]);
  const [editing, setEditing] = useState<"start" | "end" | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { granted } = await remindersService.requestAndSchedule({
        count,
        startHour: start.getHours(),
        endHour: end.getHours(),
      });

      // The device is scheduled; tell the server too, so its own sends land in
      // the same window. No-op without an account, and never fatal.
      if (granted) {
        await syncReminders({
          startTime: fmt(start),
          endTime: fmt(end),
          count,
        });
      }
    } finally {
      setSaving(false);
      onDone();
    }
  };

  return (
    <Screen
      header={
        onBack ? (
          <View style={s.top}>
            <IconCircle
              icon="chevron-back"
              label={t("common.back")}
              onPress={onBack}
            />
          </View>
        ) : undefined
      }
      footer={
        <Button
          label={t(ctaLabelKey)}
          loading={saving}
          onPress={() => void save()}
        />
      }
    >
      <Text variant="display" align="center" style={s.title}>
        {t("onboarding.reminders.title")}
      </Text>
      <Text variant="body" tone="dim" align="center" style={s.subtitle}>
        {t("onboarding.reminders.subtitle")}
      </Text>

      <Card variant="overlay">
        <View style={s.preview}>
          <View style={s.previewIcon}>
            <Image source={LOGO} style={s.previewLogo} resizeMode="contain" />
          </View>
          <View style={s.previewBody}>
            <Text variant="label">{t("app.name")}</Text>
            <Text variant="body" tone="dim" numberOfLines={2}>
              {t("onboarding.reminders.sample")}
            </Text>
          </View>
          <Text variant="caption" tone="tertiary">
            {t("common.now")}
          </Text>
        </View>
      </Card>

      <View style={s.rows}>
        <Stepper
          label={t("onboarding.reminders.howMany")}
          value={count}
          min={1}
          max={maxCount}
          onChange={setCount}
        />
        <TimeRow
          label={t("onboarding.reminders.startAt")}
          value={fmt(start)}
          onPress={() => setEditing("start")}
        />
        <TimeRow
          label={t("onboarding.reminders.endAt")}
          value={fmt(end)}
          onPress={() => setEditing("end")}
        />
      </View>

      {!isSubscribed ? (
        <View style={s.limit}>
          <Text variant="caption" tone="tertiary" align="center">
            {t("onboarding.reminders.freeLimit", { count: FREE_REMINDERS_PER_DAY })}
          </Text>
          {onOpenPaywall ? (
            <LinkButton
              label={t("notifications.upgradeForMore")}
              icon="ribbon-outline"
              onPress={onOpenPaywall}
            />
          ) : null}
        </View>
      ) : null}

      {editing ? (
        <DateTimePicker
          value={editing === "start" ? start : end}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "clock"}
          onChange={(_, date) => {
            if (Platform.OS !== "ios") setEditing(null);
            if (!date) return;
            if (editing === "start") setStart(date);
            else setEnd(date);
          }}
        />
      ) : null}
    </Screen>
  );
}
