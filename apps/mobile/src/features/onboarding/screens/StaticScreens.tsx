import React from "react";
import { Image, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, Screen, Text } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppDispatch } from "../../../store/hooks";
import { next } from "../store/onboardingSlice";

const useStyles = makeStyles((t) => ({
  illustrationWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: { width: "100%", height: 260 },
  introTitle: { marginBottom: t.space.xxl },
  heroTitle: { marginTop: t.space.xxl, marginBottom: t.space.md },
  manifesto: { flex: 1, justifyContent: "center" },
}));

export interface CopyScreenProps {
  copyKey: string;
  /** Present only on the opening screen, which also flips the layout. */
  subtitleKey?: string;
  illustration?: number;
}

/**
 * Illustration on top, promise underneath. Used at the three moments the
 * funnel needs to re-state why the next block of questions is worth answering.
 */
export function IntroScreen({
  copyKey,
  subtitleKey,
  illustration,
}: CopyScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const art = (
    <View style={s.illustrationWrap}>
      {illustration ? (
        <Image
          source={illustration}
          style={s.illustration}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={t(copyKey)}
        />
      ) : null}
    </View>
  );

  const copy = (
    <View>
      <Text
        variant="display"
        align="center"
        style={subtitleKey ? s.heroTitle : s.introTitle}
      >
        {t(copyKey)}
      </Text>
      {subtitleKey ? (
        <Text variant="body" tone="dim" align="center">
          {t(subtitleKey)}
        </Text>
      ) : null}
    </View>
  );

  // The opening screen leads with its promise and illustrates it underneath;
  // the three later ones show the picture first and land the line at the end.
  return (
    <Screen
      footer={
        <Button label={t("common.continue")} onPress={() => dispatch(next())} />
      }
    >
      {subtitleKey ? (
        <>
          {copy}
          {art}
        </>
      ) : (
        <>
          {art}
          {copy}
        </>
      )}
    </Screen>
  );
}

/**
 * Text alone, vertically centred, no illustration and no subtitle.
 * The two conversion beats right before the paywall use this: the claim has
 * to carry the screen by itself.
 */
export function ManifestoScreen({ copyKey }: CopyScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Screen
      footer={
        <Button label={t("common.continue")} onPress={() => dispatch(next())} />
      }
    >
      <View style={s.manifesto}>
        <Text variant="display" align="center">
          {t(copyKey)}
        </Text>
      </View>
    </Screen>
  );
}
