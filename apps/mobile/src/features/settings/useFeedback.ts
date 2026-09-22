import { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { useAppSelector } from "../../store/hooks";

/**
 * The "Son" setting, applied.
 *
 * Its own copy promises "un léger retour sonore quand vous aimez ou partagez
 * une citation" — and until now it promised it to nobody: the value was
 * stored, read back by its own settings page, and never consulted anywhere
 * else. The switch gates the feedback the app actually has, which is haptic;
 * the audio half plugs in here the day there is a sound asset to play.
 */
export function useFeedback() {
  const enabled = useAppSelector((s) => s.settings.sound);

  return useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      if (!enabled) return;
      void Haptics.impactAsync(style);
    },
    [enabled],
  );
}

export { ImpactFeedbackStyle } from "expo-haptics";
