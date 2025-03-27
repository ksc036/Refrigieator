// RootLayout.tsx
import { router, Stack, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { getDb } from "@/services/database";
import ReduxProvider from "@/store/ReduxProvider";
// 아래 2개는 “오른쪽→왼쪽” 전환을 위해 필요
import { CardStyleInterpolators } from "@react-navigation/stack";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FOOD_ITEMS_QUERY } from "@/services/itemQueries";

export default function RootLayout() {
  const segments = useSegments();
  const activeSegment = segments[segments.length - 1] ?? "Loading...";
  useEffect(() => {
    // 앱 실행 시 한 번 DB 셋업
    async function setupDatabase() {
      try {
        const db = await getDb();
        // await db.execAsync(`
        //   drop TABLE Refrigerator;
        //   drop TABLE  FOODITEMS;
        //   drop TABLE  Freezer;
        //   drop TABLE  Ready;
        //   drop TABLE  FRIDGE;
        //   drop TABLE  PRESTORAGE;
        // `);
        await db.withTransactionAsync(async () => {
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS REFRIGERATOR (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              food_item_id Integer NOT NULL,
              status TEXT NOT NULL,
              created_date TEXT NOT NULL
            );
          `);

          console.log("1 REFRIGERATOR setting");
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS FOODITEMS (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              refrigerated_shelf_life INTEGER NOT NULL,
              frozen_shelf_life INTEGER NOT NULL,
              category TEXT
            );
          `);
          console.log("2 FOODITEMS setting");
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS PRESTORAGE (
              id INTEGER PRIMARY KEY,
              food_item_id INTEGER  NOT NULL,
              status TEXT NOT NULL
            );
          `);
          const result = await db.getFirstAsync(
            "SELECT COUNT(*) FROM FOODITEMS"
          );
          console.log("Count:", result["COUNT(*)"]);
          if (result["COUNT(*)"] == 0) {
            await db.execAsync(FOOD_ITEMS_QUERY);
          }
        });
      } catch (err) {
        console.log("err occure in Root_layour", err);
      } finally {
      }
    }
    setupDatabase();
  }, []);

  return (
    <ReduxProvider>
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          title: activeSegment,
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#007AFF",
          animation: "slide_from_right",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/search")}>
              <View style={{ marginRight: 16 }}>
                <Ionicons name="search" size={24} color="#007AFF" />
              </View>
            </TouchableOpacity>
          ),
        }}
      >
        <Stack.Screen
          name="(tabs)"
          // options={{ headerShown: false }}
        />
        <Stack.Screen
          name="search"
          options={{ title: "검색" }} // 검색 화면
        />
        <Stack.Screen
          name="+not-found"
          options={{ title: "페이지를 찾을 수 없음" }}
        />
      </Stack>
    </ReduxProvider>
  );
}
