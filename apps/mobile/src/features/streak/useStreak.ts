import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  localIsoDate,
  markSeen,
  persistStreak,
  setTracking,
  toastShown,
} from "./streakSlice";

/** Monday-first, the way the week is read where the app is sold. */
const WEEK_STARTS_ON = 1;

/** The seven dates of the current week, Monday to Sunday, as local ISO. */
const currentWeek = (): string[] => {
  const today = new Date();
  const offset = (today.getDay() - WEEK_STARTS_ON + 7) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return localIsoDate(d);
  });
};

/** Seven short weekday labels for `week`, in the active locale. */
const weekLabels = (locale: string, week: string[]): string[] => {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return week.map((iso) => fmt.format(new Date(`${iso}T12:00:00`)).replace(/\.$/, ""));
};

export function useStreak() {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const streak = useAppSelector((s) => s.streak);

  // Recomputed per render on purpose: the week rolls over at midnight and
  // the hook has no clock of its own. Seven short strings is nothing.
  const week = currentWeek();
  const today = localIsoDate(new Date());
  const todayIndex = week.indexOf(today);

  const labels = useMemo(
    () => weekLabels(i18n.language, week),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, week.join()],
  );

  /** Days of this week the app was opened on. */
  const completed = useMemo(
    () =>
      week.reduce<number[]>((acc, iso, i) => {
        if (streak.days.includes(iso)) acc.push(i);
        return acc;
      }, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [streak.days, week.join()],
  );

  /** Days of this week already behind us that the app was not opened on. */
  const missed = useMemo(
    () =>
      week.reduce<number[]>((acc, iso, i) => {
        if (iso < today && !streak.days.includes(iso)) acc.push(i);
        return acc;
      }, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [streak.days, week.join(), today],
  );

  const recordVisit = useCallback(() => {
    if (!streak.tracking || !streak.hydrated) return;
    dispatch(markSeen(undefined));
    void dispatch(persistStreak());
  }, [dispatch, streak.tracking, streak.hydrated]);

  const dismissToast = useCallback(() => {
    dispatch(toastShown());
  }, [dispatch]);

  const setTrackingEnabled = useCallback(
    (value: boolean) => {
      dispatch(setTracking(value));
      void dispatch(persistStreak());
    },
    [dispatch],
  );

  return {
    count: streak.count,
    tracking: streak.tracking,
    hydrated: streak.hydrated,
    justAdvanced: streak.justAdvanced,
    labels,
    completed,
    missed,
    todayIndex,
    recordVisit,
    dismissToast,
    setTrackingEnabled,
  };
}
