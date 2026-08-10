import React, { useCallback, useState, type ReactNode } from "react";
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { SurfaceProvider, makeStyles, useTheme } from "../theme";
import { IconCircle } from "./IconCircle";
import { Text } from "./Text";

/** Scroll offset past which the large title collapses into the centred header. */
const COLLAPSE_AT = 48;

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    backgroundColor: t.base.bg,
    borderTopLeftRadius: t.radius.xl,
    borderTopRightRadius: t.radius.xl,
    overflow: "hidden",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: t.gutter,
    paddingBottom: t.space.sm,
    minHeight: 56,
  },
  barTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  spacer: { width: 52 },
  content: { paddingHorizontal: t.gutter, paddingBottom: t.space.xxxl },
  largeTitle: { marginTop: t.space.sm, marginBottom: t.space.lg },
}));

export interface SheetProps {
  title: string;
  onClose?: () => void;
  onBack?: () => void;
  /** Rendered as a round button on the right of the bar — usually settings. */
  action?: { icon: Parameters<typeof IconCircle>[0]["icon"]; label: string; onPress: () => void };
  children: ReactNode;
  /** Sub-pages use a back chevron and keep the title in the bar only. */
  collapsedOnly?: boolean;
}

/**
 * Modal surface for Profile, Settings and their sub-pages.
 *
 * The title starts large under the bar and collapses into a centred header
 * as you scroll. Sub-pages (`collapsedOnly`) skip the large title entirely —
 * they're reached by a back chevron and need the vertical room.
 */
export function Sheet({
  title,
  onClose,
  onBack,
  action,
  children,
  collapsedOnly,
}: SheetProps) {
  const s = useStyles();
  const t = useTheme();
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();
  const [collapsed, setCollapsed] = useState(!!collapsedOnly);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (collapsedOnly) return;
      const next = e.nativeEvent.contentOffset.y > COLLAPSE_AT;
      setCollapsed((prev) => (prev === next ? prev : next));
    },
    [collapsedOnly],
  );

  return (
    <SurfaceProvider surface="base">
      <View style={[s.root, { paddingTop: insets.top + t.space.xs }]}>
        <View style={s.bar}>
          {onBack ? (
            <IconCircle
              icon="chevron-back"
              label={translate("common.back")}
              onPress={onBack}
            />
          ) : onClose ? (
            <IconCircle
              icon="close"
              label={translate("common.close")}
              onPress={onClose}
            />
          ) : (
            <View style={s.spacer} />
          )}

          {collapsed ? (
            <Text variant="title" style={s.barTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : null}

          {action ? (
            <IconCircle
              icon={action.icon}
              label={action.label}
              onPress={action.onPress}
            />
          ) : (
            <View style={s.spacer} />
          )}
        </View>

        <ScrollView
          onScroll={onScroll}
          scrollEventThrottle={32}
          // Sub-pages carry forms — the name, the six auth fields, a promo
          // code — and the sheet is what scrolls them. Without these, the
          // field the keyboard covers stays covered, and a tap on the CTA
          // only dismisses the keyboard.
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            s.content,
            { paddingBottom: insets.bottom + t.space.xxxl },
          ]}
        >
          {collapsedOnly ? null : (
            <Text variant="display" style={s.largeTitle}>
              {title}
            </Text>
          )}
          {children}
        </ScrollView>
      </View>
    </SurfaceProvider>
  );
}
