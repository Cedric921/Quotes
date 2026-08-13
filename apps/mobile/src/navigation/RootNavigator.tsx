import React, { useCallback, useEffect, useState } from "react";
import { Linking, Share } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack";
import * as StoreReview from "expo-store-review";
import Toast from "react-native-toast-message";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { navigationRef } from "../services/navigationService";
import { loadOnboarding } from "../features/onboarding/store/onboardingSlice";
import { loadStreak } from "../features/streak/streakSlice";
import { loadLikeQuota } from "../features/quotes/likeQuotaSlice";
import {
  persistSettings,
  setAnalytics,
} from "../features/settings/settingsSlice";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow";
import { QuoteFeedScreen } from "../features/quotes/QuoteFeedScreen";
import { LikedQuotesScreen } from "../features/quotes/LikedQuotesScreen";
import { ProfileSheet } from "../features/profile/ProfileSheet";
import { WidgetsHelpScreen } from "../features/profile/screens/WidgetsHelpScreen";
import { WebPageScreen } from "../features/settings/screens/WebPageScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { StreakSettingsScreen } from "../features/settings/screens/StreakSettingsScreen";
import { NameEditScreen } from "../features/settings/screens/NameEditScreen";
import {
  AgeScreen,
  BeliefsScreen,
  ContentPreferencesScreen,
  GenderScreen,
  LanguageScreen,
  MutedContentScreen,
  RelationshipScreen,
  SoundScreen,
} from "../features/settings/screens/ProfileFieldScreens";
import { AppIconScreen } from "../features/onboarding/screens/AppIconScreen";
import { RemindersSetupScreen } from "../features/onboarding/screens/RemindersSetupScreen";
import { ThemePickerScreen } from "../features/theme/ThemePickerScreen";
import { PaywallScreen } from "../features/paywall/PaywallScreen";
import { ManageSubscriptionScreen } from "../features/paywall/screens/ManageSubscriptionScreen";
import { SignInScreen } from "../features/auth/SignInScreen";
import { SignUpScreen } from "../features/auth/SignUpScreen";
import { ForgotPasswordScreen } from "../features/auth/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../features/auth/ResetPasswordScreen";
import { AccountScreen } from "../features/auth/AccountScreen";
import { DeleteAccountScreen } from "../features/auth/DeleteAccountScreen";
import { ShareSheet } from "../features/share/ShareSheet";
import {
  BUNDLE_URL,
  MORE_APPS_URL,
  SHARE_APP_URL,
} from "../constants/appConfig";
import type { Quote } from "../types";

export type RootStackParamList = {
  Feed: undefined;
  Profile: undefined;
  Settings: undefined;
  StreakSettings: undefined;
  ThemePicker: undefined;
  Paywall: undefined;
  Reminders: undefined;
  AppIcon: undefined;
  HomeWidgets: undefined;
  LockWidgets: undefined;
  Name: undefined;
  Gender: undefined;
  Age: undefined;
  Relationship: undefined;
  Beliefs: undefined;
  Language: undefined;
  Sound: undefined;
  ContentPreferences: undefined;
  MutedContent: undefined;
  ManageSubscription: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  /** Prefilled with the address the code was sent to. */
  ResetPassword: { email?: string } | undefined;
  Account: undefined;
  DeleteAccount: undefined;
  LikedQuotes: undefined;
  /** A URL read inside the app: the terms, the privacy policy. */
  WebPage: { url: string; titleKey: string };
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
  const analytics = useAppSelector((s) => s.settings.analytics);

  // The share sheet sits outside the navigator: it can be opened from the
  // feed and from the profile, and it must survive a navigation in between.
  const [sharing, setSharing] = useState<Quote | null>(null);

  useEffect(() => {
    void dispatch(loadOnboarding());
    void dispatch(loadStreak());
    void dispatch(loadLikeQuota());
  }, [dispatch]);

  const back = () => navigationRef.current?.goBack();
  const openPage = (url: string, titleKey: string) =>
    navigationRef.current?.navigate("WebPage", { url, titleKey });

  /**
   * Three settings rows are actions, not destinations. Routing them through
   * `onOpen` keeps `SettingsScreen` free of any platform API.
   */
  const runAction = useCallback((route: string): boolean => {
    switch (route) {
      case "ShareApp":
        void Share.share({ message: SHARE_APP_URL });
        return true;
      case "MoreApps":
        void Linking.openURL(MORE_APPS_URL);
        return true;
      case "Review":
        void StoreReview.requestReview();
        return true;
      default:
        return false;
    }
  }, []);

  const open = useCallback(
    (route: string) => {
      if (runAction(route)) return;
      // Every route a settings row can open is paramless, but TypeScript
      // cannot pick an overload from a union of route names — `as never` is
      // React Navigation's own escape hatch for a name known at runtime.
      navigationRef.current?.navigate(route as never);
    },
    [runAction],
  );

  const renderFeed = useCallback(
    ({ navigation }: ScreenProps<"Feed">) => (
      <QuoteFeedScreen
        onOpenTopics={() => navigation.navigate("ContentPreferences")}
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

              {/*
                * No drag-to-dismiss: a pull at the top of a settings list is a
                * bounce, not a way out. Every screen here has its own close or
                * back button, which is what the design shows.
                */}
              <Stack.Group
                screenOptions={{ presentation: "modal", gestureEnabled: false }}
              >
                <Stack.Screen name="Profile">
                  {({ navigation }: ScreenProps<"Profile">) => (
                    <ProfileSheet
                      onClose={() => navigation.goBack()}
                      onOpenSettings={() => navigation.navigate("Settings")}
                      onOpenLikedQuotes={() =>
                        navigation.navigate("LikedQuotes")
                      }
                      onOpenPaywall={() => navigation.navigate("Paywall")}
                      onOpenStreakSettings={() =>
                        navigation.navigate("StreakSettings")
                      }
                      onShareStreak={() =>
                        void Share.share({ message: SHARE_APP_URL })
                      }
                      onOpenBundle={() => void Linking.openURL(BUNDLE_URL)}
                      onOpen={open}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen name="LikedQuotes">
                  {() => (
                    <LikedQuotesScreen onBack={back} onShare={setSharing} />
                  )}
                </Stack.Screen>

                <Stack.Screen name="Settings">
                  {() => (
                    <SettingsScreen
                      onBack={back}
                      onOpen={open}
                      onOpenPage={openPage}
                      analyticsEnabled={analytics}
                      onAnalyticsChange={(value) => {
                        dispatch(setAnalytics(value));
                        void dispatch(persistSettings());
                      }}
                    />
                  )}
                </Stack.Screen>

                {/* About you */}
                <Stack.Screen name="Name">
                  {() => <NameEditScreen onBack={back} />}
                </Stack.Screen>
                <Stack.Screen name="Gender">
                  {() => <GenderScreen onBack={back} />}
                </Stack.Screen>
                <Stack.Screen name="Age">
                  {() => <AgeScreen onBack={back} />}
                </Stack.Screen>
                <Stack.Screen name="Relationship">
                  {() => <RelationshipScreen onBack={back} />}
                </Stack.Screen>
                <Stack.Screen name="Beliefs">
                  {() => <BeliefsScreen onBack={back} />}
                </Stack.Screen>

                {/* Personalise */}
                <Stack.Screen name="ContentPreferences">
                  {() => <ContentPreferencesScreen onBack={back} />}
                </Stack.Screen>
                <Stack.Screen name="MutedContent">
                  {() => <MutedContentScreen onBack={back} />}
                </Stack.Screen>
                <Stack.Screen name="Language">
                  {() => <LanguageScreen onBack={back} />}
                </Stack.Screen>
                <Stack.Screen name="Sound">
                  {() => <SoundScreen onBack={back} />}
                </Stack.Screen>
                <Stack.Screen name="StreakSettings">
                  {() => <StreakSettingsScreen onBack={back} />}
                </Stack.Screen>

                {/* Customise the app */}
                <Stack.Screen name="ThemePicker">
                  {() => (
                    <ThemePickerScreen
                      ctaLabelKey="common.done"
                      onDone={back}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Reminders">
                  {({ navigation }: ScreenProps<"Reminders">) => (
                    <RemindersSetupScreen
                      ctaLabelKey="common.save"
                      onDone={back}
                      onBack={back}
                      onOpenPaywall={() => navigation.navigate("Paywall")}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="AppIcon">
                  {() => (
                    <AppIconScreen ctaLabelKey="common.done" onDone={back} />
                  )}
                </Stack.Screen>
                <Stack.Screen name="HomeWidgets">
                  {() => <WidgetsHelpScreen surface="home" onBack={back} />}
                </Stack.Screen>
                <Stack.Screen name="LockWidgets">
                  {() => <WidgetsHelpScreen surface="lock" onBack={back} />}
                </Stack.Screen>

                <Stack.Screen name="Paywall">
                  {() => (
                    <PaywallScreen
                      presentation="sheet"
                      onDismiss={back}
                      onOpenPage={openPage}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="WebPage">
                  {({ route }: ScreenProps<"WebPage">) => (
                    <WebPageScreen
                      url={route.params.url}
                      titleKey={route.params.titleKey}
                      onBack={back}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="ManageSubscription">
                  {({ navigation }: ScreenProps<"ManageSubscription">) => (
                    <ManageSubscriptionScreen
                      onBack={back}
                      onOpenPaywall={() => navigation.navigate("Paywall")}
                    />
                  )}
                </Stack.Screen>

                {/*
                 * Account. Signing in is optional in v2 — the feed never asks
                 * for it — so this whole branch hangs off one settings row.
                 */}
                <Stack.Screen name="SignIn">
                  {({ navigation }: ScreenProps<"SignIn">) => (
                    <SignInScreen
                      onBack={back}
                      onSignUp={() => navigation.navigate("SignUp")}
                      onForgotPassword={() =>
                        navigation.navigate("ForgotPassword")
                      }
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="SignUp">
                  {({ navigation }: ScreenProps<"SignUp">) => (
                    <SignUpScreen
                      onBack={back}
                      onSignIn={() => navigation.navigate("SignIn")}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="ForgotPassword">
                  {({ navigation }: ScreenProps<"ForgotPassword">) => (
                    <ForgotPasswordScreen
                      onBack={back}
                      onCodeSent={(email) =>
                        navigation.navigate("ResetPassword", { email })
                      }
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="ResetPassword">
                  {({ navigation, route }: ScreenProps<"ResetPassword">) => (
                    <ResetPasswordScreen
                      onBack={back}
                      email={route.params?.email}
                      onReset={() => navigation.navigate("SignIn")}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Account">
                  {({ navigation }: ScreenProps<"Account">) => (
                    <AccountScreen
                      onBack={back}
                      onDeleteAccount={() =>
                        navigation.navigate("DeleteAccount")
                      }
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="DeleteAccount">
                  {({ navigation }: ScreenProps<"DeleteAccount">) => (
                    <DeleteAccountScreen
                      onBack={back}
                      // The account is gone: there is nothing left to go back
                      // to in the settings stack.
                      onDeleted={() => navigation.popToTop()}
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
        onRequestPremium={() => {
          setSharing(null);
          navigationRef.current?.navigate("Paywall");
        }}
      />

      <Toast />
    </>
  );
}
