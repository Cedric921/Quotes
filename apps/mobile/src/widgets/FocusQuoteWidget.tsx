import React from "react";
import {
  FlexWidget,
  TextWidget,
  ImageWidget,
} from "react-native-android-widget";

interface QuoteWidgetProps {
  content: string;
  author: string;
  topicName?: string;
  size?: "small" | "medium" | "large";
}

/**
 * Android Widget Component for Focus Quote
 * Uses react-native-android-widget for rendering
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
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isSmall ? 12 : 16,
        borderRadius: 16,
        backgroundGradient: {
          colors: ["#6366f1", "#a855f7"],
          orientation: "TOP_BOTTOM",
        },
      }}
      clickAction="OPEN_APP"
    >
      {/* Header with quote icon and topic */}
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "match_parent",
        }}
      >
        <TextWidget
          text="❝"
          style={{
            fontSize: isSmall ? 20 : isLarge ? 32 : 24,
            color: "rgba(255, 255, 255, 0.8)",
          }}
        />
        {topicName && !isSmall && (
          <FlexWidget
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <TextWidget
              text={topicName}
              style={{
                fontSize: 10,
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: "600",
              }}
            />
          </FlexWidget>
        )}
      </FlexWidget>

      {/* Quote content */}
      <FlexWidget
        style={{
          flex: 1,
          justifyContent: "center",
          paddingVertical: 8,
        }}
      >
        <TextWidget
          text={content}
          style={{
            fontSize: isSmall ? 12 : isLarge ? 18 : 14,
            color: "#ffffff",
            fontWeight: "500",
            lineHeight: isSmall ? 16 : isLarge ? 24 : 20,
          }}
          maxLines={isSmall ? 3 : isLarge ? 6 : 4}
          truncate="END"
        />
      </FlexWidget>

      {/* Author */}
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "match_parent",
        }}
      >
        <TextWidget
          text={`— ${author}`}
          style={{
            fontSize: isSmall ? 10 : isLarge ? 14 : 12,
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: "600",
          }}
        />
        {isLarge && (
          <TextWidget
            text="Focus"
            style={{
              fontSize: 10,
              color: "rgba(255, 255, 255, 0.6)",
            }}
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

