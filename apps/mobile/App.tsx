import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { HomeScreen } from "./src/screens";
import { ThemeProvider } from "./src/contexts/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <HomeScreen />
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
