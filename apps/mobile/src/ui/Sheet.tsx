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
  /**
   * A flex child between the two round buttons, never absolute. Positioned
   * absolutely it spanned the whole bar and sat on top of the back button, so
   * every tap on the chevron landed on a line of text and went nowhere —
   * "back" was dead on every collapsed sheet in the app.
   */
  barTitle: { flex: 1, textAlign: "center", marginHorizontal: t.space.xs },
  spacer: { width: 52 },
  content: { paddingHorizontal: t.gutter, paddingBottom: t.space.xxxl },
  body: { flex: 1 },
  largeTitle: { marginTop: t.space.sm, marginBottom: t.space.lg },
  /**
   * Pinned under the scroll, inset from the edges. A bar that touched the
   * screen edges would read as part of the device, not of the sheet.
   */
  footer: { paddingHorizontal: t.gutter, paddingTop: t.space.sm },
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
  /** Pinned below the content, above the home indicator — a search field, a CTA. */
  footer?: ReactNode;
  /**
   * Off for children that scroll on their own, such as a web view. Inside a
   * ScrollView they would need a fixed height and fight it for the gesture.
   */
  scrollable?: boolean;
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
  footer,
  scrollable = true,
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

  // Space the scroll content leaves for the footer, when there is one.
  const bottomInset = insets.bottom + (footer ? t.space.md : t.space.xxxl);

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
          ) : (
            <View style={s.body} />
          )}

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

        {scrollable ? (
          <ScrollView
            onScroll={onScroll}
            scrollEventThrottle={32}
            // Sub-pages carry forms — the name, the six auth fields, a promo
            // code — and the sheet is what scrolls them. Without these, the
            // field the keyboard covers stays covered, and a tap on the CTA
            // only dismisses the keyboard.
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[s.content, { paddingBottom: bottomInset }]}
          >
            {collapsedOnly ? null : (
              <Text variant="display" style={s.largeTitle}>
                {title}
              </Text>
            )}
            {children}
          </ScrollView>
        ) : (
          <View style={s.body}>{children}</View>
        )}

        {footer ? (
          <View
            style={[
              s.footer,
              { paddingBottom: Math.max(insets.bottom, t.space.md) + t.space.xs },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </View>
    </SurfaceProvider>
  );
}
