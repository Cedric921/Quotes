import React from "react";
import { Image, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../../theme";
import { GradientCard, Text } from "../../../ui";

const useStyles = makeStyles((t) => ({
  row: { flexDirection: "row", alignItems: "center", gap: t.space.md },
  copy: { flex: 1, gap: t.space.xxs },
  art: { width: 110, height: 78 },
}));

/**
 * The one place the gradient is a fill rather than an accent.
 *
 * Its text is dark on purpose: the gradient is light enough that white would
 * fail contrast, and the inversion is what makes the banner the loudest thing
 * on a screen otherwise made of dark cards.
 */
export function UnlockBanner({
  onPress,
  illustration,
}: {
  onPress: () => void;
  illustration?: number;
}) {
  const s = useStyles();
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("profile.unlock.title")}
      onPress={onPress}
    >
      <GradientCard>
        <View style={s.row}>
          <View style={s.copy}>
            <Text variant="title" tone="onAccent">
              {t("profile.unlock.title")}
            </Text>
            <Text variant="body" tone="onAccent">
              {t("profile.unlock.subtitle")}
            </Text>
          </View>
          {illustration ? (
            // Decorative: the banner's own label already says what it does,
            // and an empty `accessibilityLabel` still takes VoiceOver focus
            // to announce nothing.
            <Image
              source={illustration}
              style={s.art}
              resizeMode="contain"
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            />
          ) : null}
        </View>
      </GradientCard>
    </Pressable>
  );
}
