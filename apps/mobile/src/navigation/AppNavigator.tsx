import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  HomeScreen,
  SettingsScreen,
  ProfileScreen,
  TopicScreen,
} from "../screens";

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Profile: undefined;
  Topic: {
    topicId: number;
    topicName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Topic" component={TopicScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
