import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FocusQuoteWidget, FocusQuoteWidgetLarge } from "./FocusQuoteWidget";

/** The key `widgetService` writes to. One store, both readers. */
const WIDGET_QUOTE_KEY = "@focus_widget_quote";

// Default quote when no data is available
const DEFAULT_QUOTE = {
  content: "Ouvrez l'app Focus pour découvrir une citation inspirante.",
  author: "Focus",
  topicName: undefined,
};

/**
 * Read the quote the app last stored.
 *
 * This used to pull a `SharedGroupPreferences` export out of
 * `react-native-android-widget`, which the library does not have: the
 * destructured value was `undefined`, the call threw, the catch swallowed it
 * and the widget rendered the fallback text forever. The handler runs in a
 * headless JS context where AsyncStorage works, so it reads the same key the
 * app writes.
 */
async function getQuoteFromStorage(): Promise<{
  content: string;
  author: string;
  topicName?: string;
}> {
  try {
    const data = await AsyncStorage.getItem(WIDGET_QUOTE_KEY);
    if (data) return JSON.parse(data);
  } catch (error) {
    console.error("[WidgetTaskHandler] Failed to get quote:", error);
  }

  return DEFAULT_QUOTE;
}

/**
 * Widget Task Handler
 * Called by Android when widget needs to be rendered or updated.
 *
 * The widget is handed to `renderWidget`, not returned: the handler's return
 * value is ignored by the native side.
 */
export async function widgetTaskHandler({
  widgetInfo,
  widgetAction,
  renderWidget,
}: WidgetTaskHandlerProps): Promise<void> {
  const { widgetName } = widgetInfo;

  console.log(`[WidgetTaskHandler] ${widgetAction} for ${widgetName}`);

  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      const quote = await getQuoteFromStorage();

      renderWidget(
        widgetName === "FocusQuoteWidgetLarge" ? (
          <FocusQuoteWidgetLarge
            content={quote.content}
            author={quote.author}
            topicName={quote.topicName}
          />
        ) : (
          <FocusQuoteWidget
            content={quote.content}
            author={quote.author}
            topicName={quote.topicName}
          />
        ),
      );
      return;
    }

    case "WIDGET_DELETED":
      console.log(`[WidgetTaskHandler] Widget ${widgetName} deleted`);
      return;

    case "WIDGET_CLICK":
      // The widget's own `clickAction="OPEN_APP"` opens the app; nothing to do.
      console.log(`[WidgetTaskHandler] Widget ${widgetName} clicked`);
      return;

    default:
      console.log(`[WidgetTaskHandler] Unknown action: ${widgetAction}`);
      return;
  }
}
