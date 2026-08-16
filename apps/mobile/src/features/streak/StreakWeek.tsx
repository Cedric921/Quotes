import React from "react";
import { Image, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../../theme";
import { Text } from "../../ui";

const DOT = 34;

const useStyles = makeStyles((t) => ({
  row: { flexDirection: "row", alignItems: "center", gap: t.space.sm },
  days: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  day: { alignItems: "center", gap: t.space.xxs },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.base.control,
    overflow: "hidden",
  },
  dotFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  /** Today, not yet read: an ink ring around the empty dot. */
  dotToday: {
    borderWidth: t.border.selected,
    borderColor: t.base.borderStrong,
  },
  flame: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  /** The drawn flame is taller than it is wide, and reads bigger. */
  flameArt: { width: 54, height: 66 },
  flameCount: { position: "absolute", bottom: 6 },
  flameCountArt: { position: "absolute", bottom: 12 },
}));

export interface StreakWeekProps {
  /** The reference's drawn flame. Without it, a gradient stands in. */
  illustration?: number;
  /** Current streak length, shown inside the flame. */
  count: number;
  /** Locale-short weekday labels, starting today. */
  labels: string[];
  /** Index into `labels` for each completed day. */
  completed: number[];
  /** Days already behind us with no visit: drawn frozen, not empty. */
  missed?: number[];
  /** Which label is today; it gets a ring until it is completed. */
  todayIndex?: number;
}

/**
 * The flame and the seven days. Appears in three places — the onboarding
 * streak step, the toast on the feed, and the profile card — so it owns no
 * layout of its own beyond the row.
 */
export function StreakWeek({
  illustration,
  count,
  labels,
  completed,
  missed = [],
  todayIndex,
}: StreakWeekProps) {
  const s = useStyles();
  const t = useTheme();

  return (
    <View style={s.row}>
      <View style={s.flame}>
        {illustration ? (
          <Image
            source={illustration}
            style={s.flameArt}
            resizeMode="contain"
            accessible={false}
          />
        ) : (
          <LinearGradient
            colors={[...t.gradient.colors]}
            start={t.gradient.vertical.start}
            end={t.gradient.vertical.end}
            style={{ width: 44, height: 52, borderRadius: 22 }}
          />
        )}
        <View style={illustration ? s.flameCountArt : s.flameCount}>
          <Text variant="label" weight="700">
            {count}
          </Text>
        </View>
      </View>

      <View style={s.days}>
        {labels.map((label, i) => {
          const done = completed.includes(i);
          const frozen = !done && missed.includes(i);
          const today = i === todayIndex;
          return (
            <View key={`${label}-${i}`} style={s.day}>
              <Text
                variant="caption"
                tone={done || today ? "primary" : "tertiary"}
                weight={today ? "700" : undefined}
              >
                {label}
              </Text>
              <View style={[s.dot, today && !done ? s.dotToday : null]}>
                {frozen ? (
                  // A day that went by unread is frozen, not blank: the
                  // week shows where the streak was lost.
                  <Ionicons
                    name="snow-outline"
                    size={18}
                    color={t.base.textSecondary}
                  />
                ) : done ? (
                  <>
                    <LinearGradient
                      colors={[...t.gradient.colors]}
                      start={t.gradient.horizontal.start}
                      end={t.gradient.horizontal.end}
                      style={s.dotFill}
                    />
                    <Ionicons
                      name="checkmark"
                      size={18}
                      // Ink, like every glyph on the accent: white sank
                      // into the sky end of the dot.
                      color={t.base.onAccent}
                    />
                  </>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
