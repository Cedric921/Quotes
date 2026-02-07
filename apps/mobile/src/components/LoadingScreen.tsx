import { View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

