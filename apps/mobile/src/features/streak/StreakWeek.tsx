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
  flame: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  /** The drawn flame is taller than it is wide, and reads bigger. */
  flameArt: { width: 64, height: 78 },
  flameCount: { position: "absolute", bottom: 6 },
  flameCountArt: { position: "absolute", bottom: 14 },
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
          return (
            <View key={`${label}-${i}`} style={s.day}>
              <Text variant="caption" tone={done ? "primary" : "tertiary"}>
                {label}
              </Text>
              <View style={s.dot}>
                {done ? (
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
                      color={t.palette.white}
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
