import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import {
  HomeScreen,
  SettingsScreen,
  ProfileScreen,
  TopicScreen,
  TopicsListScreen,
  LoginScreen,
  SignupScreen,
  NotificationsScreen,
  SubscriptionScreen,
} from "../screens";
import { navigationRef } from "../services/navigationService";

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Profile: undefined;
  Topics: undefined;
  Topic: {
    topicId: number;
    topicName: string;
  };
  Login: undefined;
  Signup: undefined;
  Notifications: undefined;
  Subscription: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Topics" component={TopicsListScreen} />
          <Stack.Screen name="Topic" component={TopicScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
