import {
  createNavigationContainerRef,
  CommonActions,
} from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/RootNavigator";

// Create a navigation reference that can be used outside of React components
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * `navigate` is a union of one overload per route, so a name only known at
 * runtime never matches any of them. Widening it once here keeps the cast out
 * of every caller.
 */
const navigateTo = (name: keyof RootStackParamList, params?: unknown): void =>
  (
    navigationRef.navigate as unknown as (
      name: keyof RootStackParamList,
      params?: unknown,
    ) => void
  )(name, params);

/**
 * Navigate to a screen from anywhere in the app
 */
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (navigationRef.isReady()) {
    navigateTo(name, params);
  } else {
    console.warn("Navigation not ready yet");
  }
}

/**
 * Reset navigation stack and navigate to a screen
 */
export function resetAndNavigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params: params as any }],
      }),
    );
  } else {
    console.warn("Navigation not ready yet");
  }
}

/**
 * Go back to the previous screen
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

