// freezer.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import FloatingButton from "../../components/FloatingButton";
import dayjs from "dayjs";
import { getDb } from "@/services/database";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import {
  removeFreezerItemById,
  setModeFreezer,
} from "@/store/storageModeSlice";
import { useFocusEffect } from "@react-navigation/native";
import { setFreezer, setFridge } from "@/store/storageModeSlice";
import { Refrigerator, RefrigeratorItem } from "@/types";
import { readReFrigerator } from "@/utils/select";

export default function FreezerScreen() {
  const router = useRouter();
  const freezer = useSelector((stat: any) => stat.storageMode.freezer);
  const fridge = useSelector((stat: any) => stat.storageMode.fridge); //test
  const isFreezer = useSelector((stat: any) => stat.storageMode.isfreezer);
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      // console.log("dispatch setMode FREEZER!!");
      dispatch(setModeFreezer());
      // console.log(isFreezer); // 페이지에 들어왔을 때만 true 설정
    }, [])
  );
  useEffect(() => {
    // console.log("isFreezer : ", isFreezer);
    // fetchFreezerItems();
  }, []);

  // 냉동실 아이템 불러오기
  // const fetchFreezerItems = async () => {
  //   const db = await getDb();
  //   const freeze = await db.getAllAsync(
  //     "select * from REFRIGERATOR where status = 'FREEZER'"
  //   );
  //   dispatch(setFreezer(freeze));
  // };

  // 냉동실 아이템 삭제
  const handleDelete = async (id: number) => {
    const db = await getDb();
    const statement = await db.prepareAsync(
      "DELETE FROM REFRIGERATOR WHERE id = $id"
    );
    try {
      await statement.executeAsync({ $id: id });
      dispatch(removeFreezerItemById(id));
    } catch (err) {
      console.log("냉동실 삭제에러", err);
    } finally {
      await statement.finalizeAsync();
    }
    console.log("냉동실 삭제");
  };

  // 남은일 계산
  const calculateDday = (
    create_date,
    status,
    refrigerated_shelf_life,
    frozen_shelf_life
  ) => {
    const today = dayjs().startOf(create_date);
    const end = dayjs().add(
      status === "FREEZER" ? frozen_shelf_life : refrigerated_shelf_life,
      "day"
    );
    const diff = end.diff(today, "day");
    return diff >= 0 ? `D-${diff}` : `유통기한 지남`;
  };

  // 냉동실 아이템 추가
  // const handleAdd = async () => {
  //   const name = "냉동 테스트 식품";
  //   const createdDate = dayjs().format("YYYY-MM-DD");
  //   const endDate = dayjs(createdDate).add(30, "day").format("YYYY-MM-DD");

  //   const db = await getDb();
  //   const statement = await db.prepareAsync(
  //     `INSERT INTO REFRIGERATOR (name, status, created_date, end_date) VALUES ($name, $status, $created_date, $end_date)`
  //   );
  //   try {
  //     await statement.executeAsync({
  //       $name: name,
  //       $status: "냉동",
  //       $created_date: createdDate,
  //       $end_date: endDate,
  //     });
  //   } catch (err) {
  //     console.log("냉동실 아이템 추가 에러:", err);
  //   } finally {
  //     await statement.finalizeAsync();
  //   }
  // };

  const test = async () => {
    const db = await getDb();
    try {
      await db.runAsync("delete from REFRIGERATOR");
      await db.runAsync("delete from PRESTORAGE");
      // await db.runAsync("delete from FOODITEMS");
      // dispatch(setFridge([]));
      // dispatch(setFreezer([]));
      console.log(await db.getAllAsync("SELECT * from REFRIGERATOR"));
      console.log(await db.getAllAsync("SELECT * from PRESTORAGE"));
      // console.log(await db.getAllAsync("SELECT * from FOODITEMS"));
      // console.log("fridge======================", fridge);
      // console.log("freezer======================", freezer);
      // console.log("====================================");
    } catch (err) {
      console.log("test 에러 ", err);
    } finally {
      // await statement.finalizeAsync();
    }

    // `getFirstAsync()` is useful when you want to get a single row from the database.
  };

  const renderItem = ({ item }: { item: RefrigeratorItem }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.id} </Text>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.ddayText}>
        {calculateDday(
          item.create_date,
          item.status,
          item.refrigerated_shelf_life,
          item.frozen_shelf_life
        )}
      </Text>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteButton}>삭제</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="test" onPress={test}></Button>
      <View style={styles.content}>
        <FlatList
          data={freezer}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          style={{ width: "100%" }}
        />
      </View>
      <FloatingButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, alignItems: "center" },
  title: { fontSize: 24, marginVertical: 16 },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  content: {
    flex: 1,
    position: "relative",
  },
  itemName: { fontSize: 16 },
  ddayText: { fontSize: 14, color: "red", marginRight: 8 },
  deleteButton: { color: "blue", fontSize: 14 },
  addComponent: {
    flex: 1,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontSize: 30 },
});
