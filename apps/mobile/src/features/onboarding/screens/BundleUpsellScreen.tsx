import React from "react";
import { Image, Linking, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, LinkButton, Screen, Text } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppDispatch } from "../../../store/hooks";
import { next } from "../store/onboardingSlice";
import { BUNDLE_URL } from "../../../constants/appConfig";

const useStyles = makeStyles((t) => ({
  top: { minHeight: 36, justifyContent: "center" },
  title: { marginTop: t.space.lg },
  subtitle: { marginTop: t.space.sm },
  art: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: 240, height: 240 },
  link: { marginTop: t.space.lg },
}));

/**
 * Cross-sell for the publisher's other apps. It sits before the theme picker
 * so that a decline costs nothing — the user has not yet seen the product.
 */
export function BundleUpsellScreen({ illustration }: { illustration?: number }) {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Screen
      header={
        <View style={s.top}>
          <LinkButton
            label={t("common.skip")}
            align="end"
            onPress={() => dispatch(next())}
          />
        </View>
      }
      footer={
        <Button label={t("common.continue")} onPress={() => dispatch(next())} />
      }
    >
      <Text variant="display" align="center" style={s.title}>
        {t("onboarding.bundle.title")}
      </Text>
      <Text variant="body" tone="dim" align="center" style={s.subtitle}>
        {t("onboarding.bundle.subtitle")}
      </Text>

      <View style={s.art}>
        {illustration ? (
          <Image
            source={illustration}
            style={s.image}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={t("onboarding.bundle.title")}
          />
        ) : null}
        <View style={s.link}>
          <LinkButton
            icon="download-outline"
            label={t("onboarding.bundle.getBundle")}
            onPress={() => void Linking.openURL(BUNDLE_URL)}
          />
        </View>
      </View>
    </Screen>
  );
}
