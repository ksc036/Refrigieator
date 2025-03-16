import { View, Text, StyleSheet } from "react-native";
import FloatingButton from "../../components/FloatingButton";

export default function FridgeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>냉동실</Text>
      <FloatingButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18 },
});
