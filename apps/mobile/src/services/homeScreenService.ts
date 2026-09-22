import { Linking, Platform } from "react-native";

/**
 * Sends the user to their home screen so they can add the widget.
 *
 * There is no API for "open the widget gallery", so this is the closest thing:
 * iOS shows a confirmation alert and then backgrounds us. Because that ends
 * the session, the widget step is deliberately the last one in the funnel.
 */
export const openHomeScreen = async (): Promise<void> => {
  if (Platform.OS === "ios") {
    // Opening a non-existent scheme backgrounds the app without a crash.
    await Linking.openURL("App-prefs:").catch(() => undefined);
    return;
  }
  await Linking.sendIntent?.("android.intent.action.MAIN", [
    { key: "android.intent.category.HOME", value: "" },
  ]).catch(() => undefined);
};

export const homeScreenService = { openHomeScreen };
