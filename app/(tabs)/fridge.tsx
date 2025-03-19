// Fridger.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import FloatingButton from "../../components/FloatingButton";
import dayjs from "dayjs";
import { getDb } from "@/services/database";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFridgeItemById,
  setFridge,
  setModeFridge,
} from "@/store/storageModeSlice";
import { useFocusEffect } from "@react-navigation/native";
import { RefrigeratorItem } from "@/types";
export default function FridgerScreen() {
  // const router = useRouter();
  const fridge = useSelector((stat: any) => stat.storageMode.fridge);
  // const isFreezer = useSelector((stat: any) => stat.storageMode.isfreezer);
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      // console.log("dispatch setMode fridge!!");
      dispatch(setModeFridge()); // 페이지에 들어왔을 때만 true 설정
      // console.log("냉장고", isFreezer);
    }, [])
  );

  useEffect(() => {
    // console.log("fridge UseEffect 실행  :", isFreezer);
    // fetchFridgerItems();
  }, []);

  // 냉장고 아이템 불러오기
  // const fetchFridgerItems = async () => {
  //   const db = await getDb();
  //   const Fridge = await db.getAllAsync(
  //     "select REFRIGERATOR.id id, * from REFRIGERATOR LEFT JOIN FOODITEMS on REFRIGERATOR.food_item_id = FOODITEMS.id where status = 'FRIDGE'"
  //   );
  //   console.log("냉장고 불러오기 : ", Fridge);
  //   dispatch(setFridge(Fridge));
  // };

  // 냉장고 아이템 삭제
  const handleDelete = async (id: number) => {
    const db = await getDb();
    const statement = await db.prepareAsync(
      "DELETE FROM REFRIGERATOR WHERE id = $id"
    );
    try {
      await statement.executeAsync({ $id: id });
      dispatch(removeFridgeItemById(id));
    } catch (err) {
      console.log("냉장고 삭제에러", err);
    } finally {
      await statement.finalizeAsync();
    }
    // fetchFridgerItems();
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
      <View style={styles.content}>
        <FlatList
          data={fridge}
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
    flex: 1,
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
