import {
  createNavigationContainerRef,
  CommonActions,
} from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";

// Create a navigation reference that can be used outside of React components
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen from anywhere in the app
 */
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params as any);
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

