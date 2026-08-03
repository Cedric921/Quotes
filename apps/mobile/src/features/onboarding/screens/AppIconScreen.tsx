import React, { useState } from "react";
import { Alert, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, Screen, Text, TileGrid, type Tile } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppDispatch } from "../../../store/hooks";
import { next, setAppIcon } from "../store/onboardingSlice";
import { appIcons, setAlternateIcon } from "../../../services/appIconService";

const useStyles = makeStyles((t) => ({
  title: { marginTop: t.space.xl },
  grid: { flex: 1, justifyContent: "center" },
}));

const toTiles = (): Tile[] =>
  appIcons.map((icon) => ({
    id: icon.id,
    imageUri: icon.previewUri,
    sample: icon.previewUri ? undefined : "”",
  }));

/**
 * Alternate app icons. The system shows its own confirmation alert after the
 * swap, which is why there is no success state of our own here.
 */
export function AppIconScreen() {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<string>(appIcons[0]?.id ?? "default");

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
    <Screen
      footer={
        <Button label={t("common.continue")} onPress={() => dispatch(next())} />
      }
    >
      <Text variant="display" align="center" style={s.title}>
        {t("onboarding.appIcon.title")}
      </Text>

      <View style={s.grid}>
        <TileGrid
          shape="icon"
          tiles={toTiles()}
          selectedId={selected}
          onSelect={(id) => void choose(id)}
        />
      </View>
    </Screen>
  );
}
