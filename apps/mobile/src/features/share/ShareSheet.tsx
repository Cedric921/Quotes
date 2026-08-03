import React, { useCallback, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "../../theme";
import { IconCircle, Text } from "../../ui";
import { ShareCard } from "./ShareCard";
import type { Quote } from "../../types";

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.base.bg },
  close: { margin: t.gutter },
  preview: { alignItems: "center" },
  actions: {
    flexDirection: "row",
    gap: t.space.lg,
    paddingHorizontal: t.gutter,
    paddingTop: t.space.xl,
  },
  action: { width: 84, alignItems: "center", gap: t.space.xs },
  actionDisabled: { opacity: 0.4 },
  actionLabel: { textAlign: "center" },
  busy: { opacity: 0.5 },
}));

export interface ShareSheetProps {
  visible: boolean;
  quote: Quote | null;
  imageUri?: string;
  isPremium: boolean;
  onClose: () => void;
  onEditTheme: () => void;
  onAddToCollection: () => void;
  onRequestPremium: () => void;
}

interface Action {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  run: () => void | Promise<void>;
  locked?: boolean;
}

/**
 * The app's own share surface, in front of the OS sheet.
 *
 * It exists because three of the five actions are ours, not the system's:
 * changing the theme behind the quote, saving to a collection, and hiding the
 * watermark. Handing straight to the OS sheet would lose all three.
 */
export function ShareSheet({
  visible,
  quote,
  imageUri,
  isPremium,
  onClose,
  onEditTheme,
  onAddToCollection,
  onRequestPremium,
}: ShareSheetProps) {
  const s = useStyles();
  const t2 = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cardRef = useRef<View>(null);
  const [watermark, setWatermark] = useState(true);
  const [busy, setBusy] = useState(false);

  const previewWidth = Math.min(width - t2.gutter * 4, 300);

  const capture = useCallback(async () => {
    if (!cardRef.current) return null;
    return captureRef(cardRef, { format: "png", quality: 1 });
  }, []);

  const shareImage = useCallback(async () => {
    setBusy(true);
    try {
      const uri = await capture();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, { mimeType: "image/png" });
      }
    } finally {
      setBusy(false);
    }
  }, [capture]);

  if (!quote) return null;

  const actions: Action[] = [
    {
      id: "theme",
      icon: "color-fill-outline",
      labelKey: "share.editTheme",
      run: onEditTheme,
    },
    {
      id: "save",
      icon: "download-outline",
      labelKey: "share.saveImage",
      run: shareImage,
    },
    {
      id: "collection",
      icon: "bookmark-outline",
      labelKey: "share.addToCollection",
      run: onAddToCollection,
    },
    {
      id: "copy",
      icon: "copy-outline",
      labelKey: "share.copyText",
      run: () => void Clipboard.setStringAsync(quote.text),
    },
    {
      id: "watermark",
      icon: "eye-off-outline",
      labelKey: "share.hideWatermark",
      locked: !isPremium,
      run: () =>
        isPremium ? setWatermark((w) => !w) : onRequestPremium(),
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <View style={s.close}>
          <IconCircle icon="close" label={t("common.close")} onPress={onClose} />
        </View>

        <View style={s.preview}>
          <ShareCard
            ref={cardRef}
            quote={quote}
            imageUri={imageUri}
            width={previewWidth}
            showWatermark={watermark}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.actions}
        >
          {actions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={t(action.labelKey)}
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={() => void action.run()}
              style={[
                s.action,
                action.locked ? s.actionDisabled : null,
                busy ? s.busy : null,
              ]}
            >
              <IconCircle
                icon={action.icon}
                label={t(action.labelKey)}
                size={64}
                onPress={() => void action.run()}
              />
              <Text variant="caption" tone="dim" style={s.actionLabel}>
                {t(action.labelKey)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
