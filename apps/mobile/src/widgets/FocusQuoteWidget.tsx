import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { widgetSurface as w } from "../theme/tokens";

interface QuoteWidgetProps {
  content: string;
  author: string;
  topicName?: string;
  size?: "small" | "medium" | "large";
}

/**
 * Android home-screen widget.
 *
 * The same card the design's widget preview shows, and the same one the iOS
 * widget draws: ink, a gradient hairline around it, the quote centred in
 * white with the author under it. `react-native-android-widget` has no
 * gradient border, so the contour is a gradient box holding a solid one,
 * inset by the contour's width.
 */
export function FocusQuoteWidget({
  content,
  author,
  topicName,
  size = "medium",
}: QuoteWidgetProps) {
  const isSmall = size === "small";
  const isLarge = size === "large";

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        padding: w.contour,
        borderRadius: 22,
        backgroundGradient: {
          from: w.gradientFrom,
          to: w.gradientTo,
          orientation: "TL_BR",
        },
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget
        style={{
          height: "match_parent",
          width: "match_parent",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: isSmall ? 14 : isLarge ? 24 : 20,
          paddingVertical: isSmall ? 14 : isLarge ? 20 : 16,
          borderRadius: 22 - w.contour,
          backgroundColor: w.card,
        }}
      >
        {isLarge && topicName ? (
          <TextWidget
            text={topicName.toUpperCase()}
            style={{
              fontSize: 11,
              color: w.textDim,
              fontWeight: "600",
              marginBottom: 12,
            }}
            maxLines={1}
          />
        ) : null}

        <TextWidget
          text={content}
          style={{
            fontSize: isSmall ? 14 : isLarge ? 22 : 16,
            color: w.text,
            fontWeight: "500",
            textAlign: "center",
          }}
          maxLines={isSmall ? 5 : isLarge ? 7 : 4}
          truncate="END"
        />

        {isSmall ? null : (
          <TextWidget
            text={author}
            style={{
              fontSize: isLarge ? 14 : 12,
              color: w.textDim,
              fontWeight: "600",
              marginTop: isLarge ? 14 : 8,
            }}
            maxLines={1}
          />
        )}
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * Large variant of the widget
 */
export function FocusQuoteWidgetLarge(props: Omit<QuoteWidgetProps, "size">) {
  return <FocusQuoteWidget {...props} size="large" />;
}

/**
 * Small variant of the widget
 */
export function FocusQuoteWidgetSmall(props: Omit<QuoteWidgetProps, "size">) {
  return <FocusQuoteWidget {...props} size="small" />;
}

/**
 * The widget as `requestWidgetUpdate` wants it: a function of the quote.
 *
 * It lives here rather than in `widgetService` because that file is `.ts` —
 * and because the service has no business knowing which variant renders.
 */
export const renderFocusQuoteWidget = (quote: QuoteWidgetProps) => (
  <FocusQuoteWidget {...quote} />
);
