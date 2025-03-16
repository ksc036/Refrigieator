import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      // 탭의 첫 화면을 "freezer" 스크린으로 지정
      initialRouteName="fridge"
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#007AFF",
        tabBarStyle: { backgroundColor: "#fff", paddingBottom: 10 },
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      <Tabs.Screen
        name="fridge"
        options={{
          title: "냉장고",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="freezer"
        options={{
          title: "냉동실",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="snow" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="smartScan"
        options={{
          title: "Smart Scan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
