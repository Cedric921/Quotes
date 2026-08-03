import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { markSeen, persistStreak, setTracking, toastShown } from "./streakSlice";

/**
 * Seven short weekday labels starting today, in the active locale.
 * The design shows today first, not Monday first.
 */
const weekLabels = (locale: string): string[] => {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return fmt.format(d).replace(/\.$/, "");
  });
};

export function useStreak() {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const streak = useAppSelector((s) => s.streak);

  const labels = useMemo(() => weekLabels(i18n.language), [i18n.language]);

  // Only today is lit on a fresh week; past days sit before the window.
  const completed = useMemo(
    () => (streak.count > 0 ? [0] : []),
    [streak.count],
  );

  const recordVisit = useCallback(() => {
    if (!streak.tracking) return;
    dispatch(markSeen(undefined));
    void dispatch(persistStreak());
  }, [dispatch, streak.tracking]);

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
    justAdvanced: streak.justAdvanced,
    labels,
    completed,
    recordVisit,
    dismissToast,
    setTrackingEnabled,
  };
}
