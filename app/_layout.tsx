// RootLayout.tsx
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { getDb } from "@/services/database";
import ReduxProvider from "@/store/ReduxProvider";

export default function RootLayout() {
  useEffect(() => {
    // 앱 실행 시 한 번 DB 셋업
    async function setupDatabase() {
      const db = await getDb();
      try {
        // await db.execAsync(`
        //   drop TABLE Refrigerator;
        //   drop TABLE  FOODITEMS;
        //   drop TABLE  Freezer;
        //   drop TABLE  Ready;
        //   drop TABLE  FRIDGE;
        //   drop TABLE  PRESTORAGE;
        // `);
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
        console.log("3 PRESTORAGE setting");
        await db.withTransactionAsync(async () => {
          const result = await db.getFirstAsync(
            "SELECT COUNT(*) FROM FOODITEMS"
          );
          console.log("Count:", result["COUNT(*)"]);
          if (result["COUNT(*)"] == 0) {
            await db.execAsync(`
              INSERT INTO FOODITEMS (name, refrigerated_shelf_life, frozen_shelf_life, category) 
              VALUES ('우유', 7, 30 , '유제품'),
            ('목전지', 10 , 100 , '고기'),
            ('마늘' , 20, 25 , '야채');
            `);
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
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#007AFF",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="+not-found"
          options={{ title: "페이지를 찾을 수 없음" }}
        />
      </Stack>
    </ReduxProvider>
  );
}
