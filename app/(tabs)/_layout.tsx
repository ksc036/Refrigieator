import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFreezer, setFridge } from "@/store/storageModeSlice";
import { getDb } from "@/services/database";
export default function TabsLayout() {
  // const dispatch = useDispatch();
  return (
    <Tabs
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
        name="ready"
        options={{
          title: "ready",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
