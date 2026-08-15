import React, { useMemo } from "react";
import { ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, Screen, Text, TileGrid, type Tile } from "../../ui";
import { makeStyles } from "../../theme";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { changeBackgroundTheme } from "../../store/slices/themeSlice";
import { useActiveThemes } from "../../api/hooks/useThemes";

const useStyles = makeStyles((t) => ({
  title: { marginTop: t.space.xl },
  scroll: { flex: 1 },
  // Few themes sit at the foot of the screen, as designed; many scroll,
  // instead of climbing over the title as they did.
  grid: { flexGrow: 1, justifyContent: "flex-end", paddingBottom: t.space.xl },
}));

export interface ThemePickerScreenProps {
  /** Called once a theme is picked and persisted. */
  onDone: () => void;
  ctaLabelKey?: string;
}

/**
 * Reached from three places: the onboarding funnel, the brush button on the
 * feed, and "Modifier thème" in the share sheet. It is therefore a modal
 * screen, not a settings page — it never assumes a parent.
 */
export function ThemePickerScreen({
  onDone,
  ctaLabelKey = "common.continue",
}: ThemePickerScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: themes = [] } = useActiveThemes();
  const current = useAppSelector((st) => st.theme.backgroundTheme);

  const tiles = useMemo<Tile[]>(
    () =>
      themes.map((theme) => ({
        id: theme.id,
        imageUri: theme.thumbnailUrl ?? theme.imageUrl,
        // "Aa" previews the font the theme carries, not just the photo.
        sample: "Aa",
        // `animated` stays unset: the admin panel doesn't publish the flag
        // yet, and guessing it would badge every theme. TileGrid already
        // draws the badge the day the API serves it.
      })),
    [themes],
  );

  const select = (id: string) => {
    const picked = themes.find((x) => x.id === id);
    if (!picked) return;
    void dispatch(
      changeBackgroundTheme({
        id: picked.id,
        name: picked.name,
        imageUrl: picked.imageUrl,
        thumbnailUrl: picked.thumbnailUrl,
        fontName: picked.fontName,
        fontFamily: picked.fontFamily,
        isPremium: picked.isPremium,
      }),
    );
  };

  return (
    <Screen footer={<Button label={t(ctaLabelKey)} onPress={onDone} />}>
      <Text variant="display" align="center" style={s.title}>
        {t("theme.picker.title")}
      </Text>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
      >
        <TileGrid
          shape="theme"
          tiles={tiles}
          selectedId={current?.id}
          onSelect={select}
        />
      </ScrollView>
    </Screen>
  );
}
