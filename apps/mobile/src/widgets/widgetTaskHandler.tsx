import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FocusQuoteWidget, FocusQuoteWidgetLarge } from "./FocusQuoteWidget";

// Default quote when no data is available
const DEFAULT_QUOTE = {
  content: "Ouvrez l'app Focus pour découvrir une citation inspirante.",
  author: "Focus",
  topicName: undefined,
};

/**
 * Get quote data from SharedPreferences
 */
async function getQuoteFromStorage(): Promise<{
  content: string;
  author: string;
  topicName?: string;
}> {
  try {
    const { SharedGroupPreferences } = await import(
      "react-native-android-widget"
    );
    const data = await SharedGroupPreferences.getItem(
      "widgetQuote",
      "com.focus.quotes.widget"
    );

    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[WidgetTaskHandler] Failed to get quote:", error);
  }

  return DEFAULT_QUOTE;
}

/**
 * Widget Task Handler
 * Called by Android when widget needs to be rendered or updated
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetName, widgetAction } = props;

  console.log(`[WidgetTaskHandler] ${widgetAction} for ${widgetName}`);

  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      // Get current quote data
      const quote = await getQuoteFromStorage();

      // Return appropriate widget based on name
      if (widgetName === "FocusQuoteWidgetLarge") {
        return (
          <FocusQuoteWidgetLarge
            content={quote.content}
            author={quote.author}
            topicName={quote.topicName}
          />
        );
      }

      return (
        <FocusQuoteWidget
          content={quote.content}
          author={quote.author}
          topicName={quote.topicName}
        />
      );

    case "WIDGET_DELETED":
      console.log(`[WidgetTaskHandler] Widget ${widgetName} deleted`);
      return null;

    case "WIDGET_CLICK":
      // Handle click - open app
      console.log(`[WidgetTaskHandler] Widget ${widgetName} clicked`);
      return null;

    default:
      console.log(`[WidgetTaskHandler] Unknown action: ${widgetAction}`);
      return null;
  }
}

