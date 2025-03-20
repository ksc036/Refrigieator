import React, { useEffect, useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
import FloatingButtonInReady from "../../components/FloatingButtonInReady";
import { useDispatch, useSelector } from "react-redux";
import {
  setModeFridge,
  setModeFreezer,
  removeFreezerReadyItemById,
  removeFridgeReadyItemById,
  toggleFreezerReadyItemById,
  toggleFridgeReadyItemById,
  setText,
  setFreezerReady,
  setFridge,
  setFridgeReady,
} from "@/store/storageModeSlice";
import { RefrigeratorReadyItem } from "@/types";
import { getDb } from "@/services/database";
import { insertAllReadyItemToRefridge, insertReadyItem } from "@/utils/insert";
import FloatingButton from "@/components/FloatingButton";
import { Ionicons } from "@expo/vector-icons";

export default function SmartSelectScreen() {
  const { imageUri } = useLocalSearchParams();
  // const [extractedText, setExtractedText] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  //   const isfreezer = useSelector((stat: any) => stat.storageModeSlice.isfreezer);
  const isfreezer = useSelector((stat: any) => stat.storageMode.isfreezer);
  const fridgeReady = useSelector((stat: any) => stat.storageMode.fridgeReady);
  const freezerReady = useSelector(
    (stat: any) => stat.storageMode.freezerReady
  );
  const text = useSelector((stat: any) => stat.storageMode.text);

  useEffect(() => {
    console.log("text 확인 +===================================", text);
    const processImage = async () => {
      try {
        const db = await getDb();
        for await (const row of db.getEachAsync("select * FROM FOODITEMS")) {
          if (text.includes(row.name)) {
            // console.log(row.id);
            insertReadyItem(row.id, isfreezer, dispatch);
          }
        }
      } catch (error) {
        console.error("OCR 에러:", error);
        // setExtractedText("텍스트 추출 실패");
      } finally {
        // setLoading(false);
        dispatch(setText(""));
      }
    };

    processImage();
  }, [text]);

  const modeChange = (isFreezer: boolean) => {
    if (isFreezer) {
      dispatch(setModeFreezer());
    } else {
      dispatch(setModeFridge());
    }
  };
  const handleDelete = async (item: RefrigeratorReadyItem) => {
    const db = await getDb();
    const statement = await db.prepareAsync(
      "DELETE FROM PRESTORAGE WHERE id = $id"
    );
    console.log(item);
    let status = item.status;
    try {
      await statement.executeAsync({ $id: item.id });
      if (status === "FREEZER") {
        dispatch(setModeFreezer());
        dispatch(removeFreezerReadyItemById(item.id));
      } else {
        dispatch(setModeFridge());
        dispatch(removeFridgeReadyItemById(item.id));
      }
    } catch (err) {
      console.log("냉동실 삭제에러", err);
    } finally {
      await statement.finalizeAsync();
    }
  };
  const toggle = async (item: RefrigeratorReadyItem) => {
    //1. db변경
    try {
      const db = await getDb();
      let status = item.status;
      const statement = await db.prepareAsync(
        "update PRESTORAGE set status = $status where id = $id"
      );
      await statement.executeAsync({
        $status: status === "FRIDGE" ? "FREEZER" : "FRIDGE",
        $id: item.id,
      });

      if (status === "FREEZER") {
        dispatch(setModeFreezer());
        dispatch(toggleFreezerReadyItemById(item.id));
      } else {
        dispatch(setModeFridge());
        dispatch(toggleFridgeReadyItemById(item.id));
      }
    } catch (err) {
      console.log("toggle에러", err);
    }
  };
  const resetButton = async (isFreezer: boolean) => {
    const db = await getDb();
    if (isFreezer) {
      await db.runAsync("delete from PRESTORAGE where status = 'FREEZER'");
      dispatch(setFreezerReady([]));
    } else {
      await db.runAsync("delete from PRESTORAGE where status = 'FRIDGE'");
      dispatch(setFridgeReady([]));
    }
    // console.log(await db.getAllAsync("select * from PRESTORAGE"));
  };
  const renderItem = ({ item }: { item: RefrigeratorReadyItem }) => (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Text>{item.id} </Text>
      <Text style={{ fontSize: 14 }}>{item.name}</Text>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation(); // 터치 이벤트가 부모로 전달되지 않도록 차단
          handleDelete(item);
        }}
        onPressOut={() => modeChange(isfreezer)} // 부모 Pressable의 onPress 수동 실행
      >
        <Text style={{ color: "blue", fontSize: 14 }}>삭제</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={(e) => {
          // e.stopPropagation(); // 터치 이벤트가 부모로 전달되지 않도록 차단
          toggle(item);
        }}
        onPressOut={() => modeChange(isfreezer)} // 부모 Pressable의 onPress 수동 실행
      >
        <Text style={{ fontSize: 14 }}>토글</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.content, isfreezer ? styles.inactive : styles.active]}
        onPress={() => modeChange(false)}
      >
        <View style={styles.row}>
          <Text>냉장 </Text>
          {fridgeReady.length != 0 && (
            <Pressable onPress={() => resetButton(false)}>
              <Text style={styles.reset}>리셋</Text>
            </Pressable>
          )}
        </View>
        <FlatList
          data={fridgeReady}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          style={{ width: "100%" }}
        />
      </Pressable>
      <Pressable
        style={[styles.content, isfreezer ? styles.active : styles.inactive]}
        onPress={() => modeChange(true)}
      >
        <View style={styles.row}>
          <Text>냉동</Text>
          {freezerReady.length != 0 && (
            <Pressable onPress={() => resetButton(true)}>
              <Text style={styles.reset}>리셋</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={freezerReady}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          style={{ width: "100%" }}
        />
      </Pressable>
      <FloatingButton />
      {fridgeReady.length + freezerReady.length > 0 && (
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => {
            insertAllReadyItemToRefridge(dispatch);
            if (fridgeReady.length > freezerReady.length) {
              router.push("/fridge");
            } else {
              router.push("/freezer");
            }
          }}
        >
          <Ionicons name={"sync-outline"} size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  syncButton: {
    backgroundColor: "#007AFF",
    borderRadius: 30,
    position: "absolute",
    bottom: 40,
    right: 35,
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 400,
    resizeMode: "contain",
    marginBottom: 20,
  },
  content: {
    flex: 1,
    // borderWidth: 1,
    width: "100%",
  },
  active: {
    backgroundColor: "lightblue",
  },
  inactive: {
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
  },
  reset: {
    backgroundColor: "red",
    color: "white",
    borderRadius: 3,
  },
});
