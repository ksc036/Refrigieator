// app/search.tsx
import { getDb } from "@/services/database";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { insertSearchItemToRefridge } from "@/utils/insert";
import { useRouter } from "expo-router";
type selectedComponent = {
  name: string;
  id: number;
  isFreezer: boolean;
  category: string;
};
type unSelectedComponent = {
  name: string;
  id: number;
  category: string;
};
export default function SearchScreen() {
  const [keyword, setKeyword] = useState("");
  const [unSelectedComponent, setUnSelectedComponent] = useState<
    unSelectedComponent[]
  >([]);
  const [selectedComponent, setSelectedComponent] = useState<
    selectedComponent[]
  >([]);
  const filtered = unSelectedComponent.filter((item) =>
    item.name.includes(keyword)
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const syncData = () => {
    insertSearchItemToRefridge(dispatch, selectedComponent);
    let freezerCnt: number = selectedComponent.filter(
      (item) => item.isFreezer === true
    ).length;
    if (selectedComponent.length - freezerCnt <= freezerCnt) {
      router.push("./(tabs)/freezer"); //freezer
    } else {
      router.push("./(tabs)/fridge");
    }
  };
  const handleSelect = (item: unSelectedComponent) => {
    // unSelectedComponent에서 제거
    setUnSelectedComponent((prev) => prev.filter((obj) => obj.id !== item.id));
    // selectedComponent에 추가 (여기서는 isFreezer 값을 true로 고정했지만, 필요에 따라 변경)
    setSelectedComponent((prev) => [...prev, { ...item, isFreezer: true }]);
  };

  // 이미 선택된 항목을 해제하는 함수 (예시)
  const handleUnselect = (item: selectedComponent) => {
    setSelectedComponent((prev) => prev.filter((obj) => obj.id !== item.id));
    setUnSelectedComponent((prev) => [
      ...prev,
      { id: item.id, name: item.name, category: item.category },
    ]);
  };
  const mkFridge = (id) => {
    setSelectedComponent((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFreezer: false } : item
      )
    );
  };
  const mkFreezer = (id) => {
    setSelectedComponent((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFreezer: true } : item))
    );
  };
  const combinedData = [...selectedComponent, ...unSelectedComponent];
  const renderItem = ({
    item,
  }: {
    item: selectedComponent | unSelectedComponent;
  }) => {
    // selectedComponent와 unSelectedComponent는 구조가 조금 다르므로
    // isFreezer 속성이 있는지 여부로 선택 여부를 판단할 수 있음
    const isSelected = (item as selectedComponent).isFreezer !== undefined;
    return (
      <Pressable
        style={styles.item}
        onPress={() => {
          console.log("item Check", item);
          if (!isSelected) {
            handleSelect(item as unSelectedComponent);
          }
        }}
      >
        {isSelected ? (
          <View style={styles.select}>
            <Text>{item.name}</Text>
            <Pressable onPress={() => handleUnselect(item)}>
              <Text>삭제</Text>
            </Pressable>
            <Pressable onPress={() => mkFridge(item.id)}>
              <Text
                style={
                  item.isFreezer ? styles.normalText : styles.highlightText
                }
              >
                냉장
              </Text>
            </Pressable>
            <Pressable onPress={() => mkFreezer(item.id)}>
              <Text
                style={
                  item.isFreezer ? styles.highlightText : styles.normalText
                }
              >
                {" "}
                냉동
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text>{item.name} "미선택"</Text>
        )}
      </Pressable>
    );
  };
  useEffect(() => {
    console.log("init");
    async function getItems() {
      const unSeleted: unSelectedComponent[] = [];
      const db = await getDb();
      try {
        for await (const row of await db.getAllAsync(
          "select * from FOODITEMS"
        )) {
          // console.log(row);
          unSeleted.push({
            name: row.name,
            id: row.id,
            category: row.category,
          });
        }
        setUnSelectedComponent(unSeleted);
        // console.log(items);
      } catch (err) {
        console.log("error occur", err);
      } finally {
      }
    }
    if (selectedComponent.length == 0) {
      console.log("hu");
      getItems();
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>검색 화면</Text>
      <TextInput
        style={styles.input}
        placeholder="검색어를 입력하세요"
        value={keyword}
        onChangeText={setKeyword}
      />
      {keyword ? (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <FlatList
          data={combinedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          extraData={{ selectedComponent, unSelectedComponent }}
        />
      )}

      {selectedComponent.length > 0 && (
        <TouchableOpacity style={styles.button} onPress={() => syncData()}>
          <Ionicons name={"add"} size={30} color="white" />
          <Text style={styles.countText}>{selectedComponent.length}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  countText: {
    color: "#fff",
    fontSize: 27,
  },
  select: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  fab: {
    color: "#fff",
    fontSize: 16,
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    flexDirection: "row",
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  normalText: {
    color: "#000",
  },
  highlightText: {
    color: "#007AFF", // 선택된 경우 흰색 텍스트
    fontWeight: "bold",
  },
});
