import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { navigationRef } from "../services/navigationService";
import { loadOnboarding } from "../features/onboarding/store/onboardingSlice";
import { loadStreak } from "../features/streak/streakSlice";
import { loadLikeQuota } from "../features/quotes/likeQuotaSlice";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow";
import { QuoteFeedScreen } from "../features/quotes/QuoteFeedScreen";
import { ProfileSheet } from "../features/profile/ProfileSheet";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { StreakSettingsScreen } from "../features/settings/screens/StreakSettingsScreen";
import { ThemePickerScreen } from "../features/theme/ThemePickerScreen";
import { PaywallScreen } from "../features/paywall/PaywallScreen";
import { ShareSheet } from "../features/share/ShareSheet";
import type { Quote } from "../types";

export type RootStackParamList = {
  Feed: undefined;
  Profile: undefined;
  Settings: undefined;
  StreakSettings: undefined;
  ThemePicker: undefined;
  Topics: undefined;
  Paywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type ScreenProps<K extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  K
>;

/**
 * Two levels, not twenty screens in a row.
 *
 * `Feed` is permanent; everything else is a modal presented on top of it.
 * v1 pushed all twenty screens onto one stack with a horizontal slide, which
 * is why closing Settings walked you back through Profile, Home and the quote
 * you were reading.
 */
export function RootNavigator() {
  const dispatch = useAppDispatch();
  const onboardingDone = useAppSelector((s) => s.onboarding.done);
  const hydrated = useAppSelector((s) => s.onboarding.hydrated);
  const isSubscribed = useAppSelector(
    (s) => s.auth.user?.isSubscribed ?? false,
  );
  const backgroundTheme = useAppSelector((s) => s.theme.backgroundTheme);

  // The share sheet sits outside the navigator: it can be opened from the
  // feed and from the profile, and it must survive a navigation in between.
  const [sharing, setSharing] = useState<Quote | null>(null);

  useEffect(() => {
    void dispatch(loadOnboarding());
    void dispatch(loadStreak());
    void dispatch(loadLikeQuota());
  }, [dispatch]);

  const renderFeed = useCallback(
    ({ navigation }: ScreenProps<"Feed">) => (
      <QuoteFeedScreen
        onOpenTopics={() => navigation.navigate("Topics")}
        onOpenTheme={() => navigation.navigate("ThemePicker")}
        onOpenProfile={() => navigation.navigate("Profile")}
        onOpenPaywall={() => navigation.navigate("Paywall")}
        onShare={setSharing}
      />
    ),
    [],
  );

  if (!hydrated) return null;

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!onboardingDone ? (
            <Stack.Screen name="Feed" component={OnboardingFlow} />
          ) : (
            <>
              <Stack.Screen name="Feed">{renderFeed}</Stack.Screen>

              <Stack.Group screenOptions={{ presentation: "modal" }}>
                <Stack.Screen name="Profile">
                  {({ navigation }: ScreenProps<"Profile">) => (
                    <ProfileSheet
                      onClose={() => navigation.goBack()}
                      onOpenSettings={() => navigation.navigate("Settings")}
                      onOpenPaywall={() => navigation.navigate("Paywall")}
                      onOpenStreakSettings={() =>
                        navigation.navigate("StreakSettings")
                      }
                      onShareStreak={() => undefined}
                      onOpen={(route) =>
                        navigation.navigate(
                          route as keyof RootStackParamList,
                        )
                      }
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen name="Settings">
                  {({ navigation }: ScreenProps<"Settings">) => (
                    <SettingsScreen
                      onBack={() => navigation.goBack()}
                      onOpen={(route) =>
                        navigation.navigate(
                          route as keyof RootStackParamList,
                        )
                      }
                      analyticsEnabled
                      onAnalyticsChange={() => undefined}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen name="StreakSettings">
                  {({ navigation }: ScreenProps<"StreakSettings">) => (
                    <StreakSettingsScreen onBack={() => navigation.goBack()} />
                  )}
                </Stack.Screen>

                <Stack.Screen name="ThemePicker">
                  {({ navigation }: ScreenProps<"ThemePicker">) => (
                    <ThemePickerScreen
                      ctaLabelKey="common.done"
                      onDone={() => navigation.goBack()}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen name="Paywall">
                  {({ navigation }: ScreenProps<"Paywall">) => (
                    <PaywallScreen
                      presentation="sheet"
                      onDismiss={() => navigation.goBack()}
                    />
                  )}
                </Stack.Screen>
              </Stack.Group>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      <ShareSheet
        visible={!!sharing}
        quote={sharing}
        imageUri={backgroundTheme?.imageUrl}
        isPremium={isSubscribed}
        onClose={() => setSharing(null)}
        onEditTheme={() => {
          setSharing(null);
          navigationRef.current?.navigate("ThemePicker");
        }}
        onAddToCollection={() => setSharing(null)}
        onRequestPremium={() => {
          setSharing(null);
          navigationRef.current?.navigate("Paywall");
        }}
      />

      <Toast />
    </>
  );
}
