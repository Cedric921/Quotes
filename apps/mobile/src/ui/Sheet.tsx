import React, { useCallback, useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { SurfaceProvider, makeStyles, useTheme } from "../theme";
import { Ground } from "./Ground";
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
   * Floats over the bottom of the scroll, inset from the edges, on a blurred
   * pane: the rows slide under it and stay legible through it. A bar that
   * touched the screen edges would read as part of the device, not of the
   * sheet.
   */
  footer: {
    position: "absolute",
    left: t.gutter,
    right: t.gutter,
    borderRadius: t.radius.pill,
    overflow: "hidden",
    borderWidth: t.border.hairline,
    borderColor: t.base.glassBorder,
    backgroundColor: t.base.glass,
  },
  footerBlur: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
}));

/** Room the scroll leaves under its last row so the footer never covers it. */
const FOOTER_CLEARANCE = 60 + 24;

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
  const footerBottom = Math.max(insets.bottom, t.space.md) + t.space.xs;
  const bottomInset = footer
    ? footerBottom + FOOTER_CLEARANCE
    : insets.bottom + t.space.xxxl;

  return (
    <SurfaceProvider surface="base">
      <KeyboardAvoidingView
        style={[s.root, { paddingTop: insets.top + t.space.xs }]}
        // `automaticallyAdjustKeyboardInsets` on the ScrollView was the wrong
        // tool once a field lived outside it: it left a phantom bottom inset
        // behind after any scroll, and the rows went off the top of the view
        // — the list looked empty. Padding the whole sheet moves the footer
        // and the content together.
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Ground />
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
            // Sub-pages carry forms; a tap on the CTA must submit, not just
            // dismiss the keyboard.
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
          <View style={[s.footer, { bottom: footerBottom }]}>
            <BlurView
              intensity={t.image.blurIntensity}
              tint="light"
              style={s.footerBlur}
            />
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SurfaceProvider>
  );
}
