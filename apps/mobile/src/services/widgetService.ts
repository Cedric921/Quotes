import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
interface QuoteData {
  content: string;
  author: string;
  topicName?: string;
}

// Constants
const WIDGET_QUOTE_KEY = "@focus_widget_quote";
const WIDGET_QUOTES_ARRAY_KEY = "@focus_widget_quotes_array";
const IOS_APP_GROUP = "group.com.mindset.focus.widget";
const MAX_WIDGET_QUOTES = 30;

/**
 * Widget Service
 * Manages data sharing between the main app and widgets (iOS/Android)
 */
class WidgetService {
  private extensionStorage: typeof ExtensionStorage | null = null;

  constructor() {
    this.initializeExtensionStorage();
  }

  /**
   * Initialize iOS Extension Storage (lazy load)
   */
  private async initializeExtensionStorage() {
    if (Platform.OS === "ios") {
      try {
        // Dynamic import to avoid errors on Android
        const { ExtensionStorage } = await import("@bacons/apple-targets");
        this.extensionStorage = new ExtensionStorage(IOS_APP_GROUP);
      } catch (error) {
        console.log("[WidgetService] ExtensionStorage not available:", error);
      }
    }
  }

  /**
   * Update the quote displayed in widgets
   */
  async updateWidgetQuote(quote: QuoteData): Promise<void> {
    try {
      // Store locally for persistence
      await AsyncStorage.setItem(WIDGET_QUOTE_KEY, JSON.stringify(quote));

      if (Platform.OS === "ios" && this.extensionStorage) {
        // iOS: Use App Groups shared storage
        await this.updateiOSWidget(quote);
      } else if (Platform.OS === "android") {
        // Android: Use SharedPreferences via native module
        await this.updateAndroidWidget(quote);
      }
    } catch (error) {
      console.error("[WidgetService] Failed to update widget:", error);
    }
  }

  /**
   * Push a list of quotes to the widget. The widget rotates through them,
   * showing a different one each day (refreshed at midnight).
   */
  async updateWidgetQuotes(quotes: QuoteData[]): Promise<void> {
    try {
      const limited = quotes.slice(0, MAX_WIDGET_QUOTES).map((q) => ({
        content: q.content,
        author: q.author,
        topicName: q.topicName ?? null,
      }));

      await AsyncStorage.setItem(
        WIDGET_QUOTES_ARRAY_KEY,
        JSON.stringify(limited),
      );

      if (Platform.OS === "ios") {
        const { ExtensionStorage } = await import("@bacons/apple-targets");
        const storage = new ExtensionStorage(IOS_APP_GROUP);
        storage.set("quotesArray", JSON.stringify(limited));
        ExtensionStorage.reloadWidget("FocusWidget");
      }
    } catch (error) {
      console.error("[WidgetService] Failed to update widget quotes:", error);
    }
  }

  /**
   * Update iOS widget via App Groups
   */
  private async updateiOSWidget(quote: QuoteData): Promise<void> {
    try {
      const { ExtensionStorage } = await import("@bacons/apple-targets");
      const storage = new ExtensionStorage(IOS_APP_GROUP);

      // Store as JSON string
      const quoteJson = JSON.stringify({
        content: quote.content,
        author: quote.author,
        topicName: quote.topicName || null,
      });

      storage.set("currentQuote", quoteJson);

      // Reload widget timeline
      ExtensionStorage.reloadWidget("FocusWidget");

      console.log("[WidgetService] iOS widget updated");
    } catch (error) {
      console.error("[WidgetService] iOS widget update failed:", error);
    }
  }

  /**
   * Update Android widget via SharedPreferences
   */
  private async updateAndroidWidget(quote: QuoteData): Promise<void> {
    try {
      const { SharedGroupPreferences } =
        await import("react-native-android-widget");

      // Store quote data
      await SharedGroupPreferences.setItem(
        "widgetQuote",
        JSON.stringify({
          content: quote.content,
          author: quote.author,
          topicName: quote.topicName || null,
        }),
        "com.mindset.focus.widget",
      );

      // Request widget update
      const { requestWidgetUpdate } =
        await import("react-native-android-widget");
      await requestWidgetUpdate({
        widgetName: "FocusQuoteWidget",
        renderWidget: () => null, // Will be handled by native code
        widgetNotFound: () => {
          console.log("[WidgetService] Widget not found on home screen");
        },
      });

      console.log("[WidgetService] Android widget updated");
    } catch (error) {
      console.error("[WidgetService] Android widget update failed:", error);
    }
  }

  /**
   * Get the last quote stored for widget
   */
  async getStoredQuote(): Promise<QuoteData | null> {
    try {
      const stored = await AsyncStorage.getItem(WIDGET_QUOTE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("[WidgetService] Failed to get stored quote:", error);
      return null;
    }
  }

  /**
   * Clear widget data
   */
  async clearWidgetData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WIDGET_QUOTE_KEY);

      if (Platform.OS === "ios" && this.extensionStorage) {
        const { ExtensionStorage } = await import("@bacons/apple-targets");
        const storage = new ExtensionStorage(IOS_APP_GROUP);
        storage.remove("currentQuote");
      }
    } catch (error) {
      console.error("[WidgetService] Failed to clear widget data:", error);
    }
  }
}

// Singleton instance
export const widgetService = new WidgetService();

// Type declaration for ExtensionStorage
declare class ExtensionStorage {
  constructor(appGroup: string);
  set(key: string, value: string): void;
  get(key: string): string | null;
  remove(key: string): void;
  static reloadWidget(name?: string): void;
  static reloadControls(name?: string): void;
}
