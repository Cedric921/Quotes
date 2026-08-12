import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "../../../theme";
import { Sheet } from "../../../ui";

const useStyles = makeStyles((t) => ({
  web: { flex: 1, backgroundColor: t.base.bg },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
}));

export interface WebPageScreenProps {
  url: string;
  /** i18n key for the bar title — "settings.privacy", "settings.terms". */
  titleKey: string;
  onBack: () => void;
}

/**
 * The legal pages, read without leaving the app.
 *
 * They used to hand off to Safari, which is a tab switch and a lost place in
 * the settings for a paragraph of terms. Inside the sheet the back chevron
 * returns to the row that opened them.
 */
export function WebPageScreen({ url, titleKey, onBack }: WebPageScreenProps) {
  const s = useStyles();
  const t2 = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  return (
    <Sheet title={t(titleKey)} onBack={onBack} collapsedOnly scrollable={false}>
      <WebView
        source={{ uri: url }}
        style={s.web}
        onLoadEnd={() => setLoading(false)}
        // The pages are ours; nothing in them needs the app's cookies.
        incognito
      />
      {loading ? (
        <View style={s.loading} pointerEvents="none">
          <ActivityIndicator color={t2.base.textSecondary} />
        </View>
      ) : null}
    </Sheet>
  );
}
