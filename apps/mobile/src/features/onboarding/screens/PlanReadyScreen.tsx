import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Button, GradientBorderCard, Screen, Text } from "../../../ui";
import { makeStyles, useTheme } from "../../../theme";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { next } from "../store/onboardingSlice";
import { useTopics } from "../../../api/hooks/useTopics";
import {
  remindersService,
  type ReminderSchedule,
} from "../../../services/remindersService";
import type { Topic } from "../../../types";

/** What the reminders step starts on, and what the card shows if it was skipped. */
const DEFAULT_SCHEDULE: ReminderSchedule = {
  count: 10,
  startHour: 9,
  endHour: 22,
};

const hh = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

const useStyles = makeStyles((t) => ({
  title: { marginTop: t.space.xl },
  subtitle: { marginTop: t.space.sm, marginBottom: t.space.xl },
  row: { flexDirection: "row", gap: t.space.md, marginBottom: t.space.lg },
  rowLast: { marginBottom: 0 },
  rowBody: { flex: 1, gap: t.space.xxs },
}));

interface SummaryRow {
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  value: string;
}

/**
 * Reflects the funnel back at the user right before the paywall.
 *
 * Everything on this card is something they typed or tapped — that is the
 * whole persuasive mechanism, so the values must come from state and never
 * from placeholder copy.
 */
export function PlanReadyScreen() {
  const s = useStyles();
  const t2 = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const answers = useAppSelector((st) => st.onboarding.answers);
  const topicIds = useAppSelector((st) => st.onboarding.topicIds);
  const { data: topics = [] } = useTopics();

  // The reminders step runs before this one, so what it scheduled is what the
  // card should quote back. It was hardcoded to the reference screenshot's
  // "11 per day, 9 AM to 10 PM" — numbers the user had never chosen.
  const [schedule, setSchedule] = useState<ReminderSchedule>(DEFAULT_SCHEDULE);
  useEffect(() => {
    void remindersService
      .loadSchedule()
      .then((saved) => saved && setSchedule(saved));
  }, []);

  // Topics are ids in state and names on screen: the card used to print the
  // raw ids, which on this API are UUIDs.
  const topicNames = topicIds.map(
    (id) => (topics as Topic[]).find((topic) => topic.id === id)?.name ?? id,
  );

  const achieve = (answers.achieve ?? []).map((id) =>
    t(`onboarding.q.achieve.opt.${id}`),
  );

  const summarise = (items: string[], max = 2) =>
    items.length <= max
      ? items.join(", ")
      : `${items.slice(0, max).join(", ")}${t("common.andMore", {
          count: items.length - max,
        })}`;

  // With the questionnaire off there are no goals and no topics to show;
  // an empty row would read as a bug, so the card keeps only what it has.
  const rows: SummaryRow[] = ([
    {
      icon: "disc-outline",
      labelKey: "onboarding.plan.goals",
      value: summarise(achieve),
    },
    {
      icon: "grid-outline",
      labelKey: "onboarding.plan.interests",
      value: summarise(topicNames),
    },
    {
      icon: "notifications-outline",
      labelKey: "onboarding.plan.reminders",
      value: t("onboarding.plan.remindersValue", {
        count: schedule.count,
        from: hh(schedule.startHour),
        to: hh(schedule.endHour),
      }),
    },
  ] satisfies SummaryRow[]).filter((row) => row.value.length > 0);

  return (
    <Screen
      footer={
        <Button
          variant="gradient"
          label={t("common.continue")}
          onPress={() => dispatch(next())}
        />
      }
    >
      <Text variant="display" align="center" style={s.title}>
        {t("onboarding.plan.title")}
      </Text>
      <Text variant="body" tone="dim" align="center" style={s.subtitle}>
        {t("onboarding.plan.subtitle")}
      </Text>

      <GradientBorderCard>
        {rows.map((row, i) => (
          <View
            key={row.labelKey}
            style={[s.row, i === rows.length - 1 ? s.rowLast : null]}
          >
            <Ionicons
              name={row.icon}
              size={28}
              color={t2.base.textSecondary}
            />
            <View style={s.rowBody}>
              <Text variant="body" tone="dim">
                {t(row.labelKey)}
              </Text>
              <Text variant="body">{row.value}</Text>
            </View>
          </View>
        ))}
      </GradientBorderCard>
    </Screen>
  );
}
