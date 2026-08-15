import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, Screen, Text, TileGrid, type Tile } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppDispatch } from "../../../store/hooks";
import { setAppIcon } from "../store/onboardingSlice";
import {
  APP_MARK,
  appIcons,
  setAlternateIcon,
} from "../../../services/appIconService";

const useStyles = makeStyles((t) => ({
  title: { marginTop: t.space.xl },
  scroll: { flex: 1 },
  grid: { flexGrow: 1, justifyContent: "center" },
}));

const toTiles = (): Tile[] =>
  appIcons.map((icon) => ({
    id: icon.id,
    imageUri: icon.previewUri,
    backdrop: icon.previewUri ? undefined : icon.backdrop,
    logo: icon.previewUri
      ? undefined
      : { source: APP_MARK, tint: icon.markTint },
  }));

export interface AppIconScreenProps {
  /** Called by the CTA. The funnel advances; settings closes the screen. */
  onDone: () => void;
  ctaLabelKey?: string;
}

/**
 * Alternate app icons. Reached from the onboarding funnel and from the
 * profile grid, so it owns no navigation of its own. The system shows its own confirmation alert after the
 * swap, which is why there is no success state of our own here.
 */
export function AppIconScreen({
  onDone,
  ctaLabelKey = "common.continue",
}: AppIconScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<string>(
    appIcons[0]?.id ?? "default",
  );

  const choose = async (id: string) => {
    setSelected(id);
    dispatch(setAppIcon(id));
    try {
      await setAlternateIcon(id);
    } catch {
      Alert.alert(t("appIcon.errorTitle"), t("appIcon.errorBody"));
    }
  };

  return (
    <Screen footer={<Button label={t(ctaLabelKey)} onPress={onDone} />}>
      <Text variant="display" align="center" style={s.title}>
        {t("onboarding.appIcon.title")}
      </Text>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
      >
        <TileGrid
          shape="icon"
          tiles={toTiles()}
          selectedId={selected}
          onSelect={(id) => void choose(id)}
        />
      </ScrollView>
    </Screen>
  );
}
