import React, { useEffect, useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
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
} from "@/store/storageModeSlice";
import { RefrigeratorReadyItem } from "@/types";
import { getDb } from "@/services/database";
import { insertReadyItem } from "@/utils/insert";

export default function SmartSelectScreen() {
  const { imageUri } = useLocalSearchParams();
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  //   const isfreezer = useSelector((stat: any) => stat.storageModeSlice.isfreezer);
  const isfreezer = useSelector((stat: any) => stat.storageMode.isfreezer);
  const fridgeReady = useSelector((stat: any) => stat.storageMode.fridgeReady);
  const freezerReady = useSelector(
    (stat: any) => stat.storageMode.freezerReady
  );
  useEffect(() => {
    const processImage = async () => {
      try {
        if (!imageUri) {
          setExtractedText("이미지를 찾을 수 없습니다.");
          setLoading(false);
          return;
        }

        // 📌 OCR 실행
        const result = await TextRecognition.recognize(
          imageUri,
          TextRecognitionScript.KOREAN
        );
        // console.log(result);
        // setExtractedText(result.text || "텍스트를 추출할 수 없습니다.");
        // console.log(extractedText);
        const db = await getDb();
        for await (const row of db.getEachAsync("select * FROM FOODITEMS")) {
          if (result.text.includes(row.name)) {
            console.log(row.id);
            insertReadyItem(row.id, isfreezer, dispatch);
          }
        }
      } catch (error) {
        console.error("OCR 에러:", error);
        setExtractedText("텍스트 추출 실패");
      } finally {
        setLoading(false);
      }
    };

    processImage();
  }, [imageUri]);

  const modeChange = (isFreezer: boolean) => {
    if (isFreezer) {
      dispatch(setModeFreezer());
    } else {
      dispatch(setModeFridge());
    }
  };
  const handleDelete = async (id: number) => {
    const db = await getDb();
    const statement = await db.prepareAsync(
      "DELETE FROM PRESTORAGE WHERE id = $id"
    );
    try {
      await statement.executeAsync({ $id: id });
      if (isfreezer) {
        dispatch(removeFreezerReadyItemById(id));
      } else {
        dispatch(removeFridgeReadyItemById(id));
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
      const statement = await db.prepareAsync(
        "update PRESTORAGE set status = $status where id = $id"
      );
      await statement.executeAsync({
        $status: isfreezer ? "FREEZER" : "FRIDGE",
        $id: item.id,
      });

      if (isfreezer) {
        dispatch(toggleFreezerReadyItemById(item.id));
      } else {
        dispatch(toggleFridgeReadyItemById(item.id));
      }
    } catch (err) {
      console.log("toggle에러", err);
    }
  };
  const renderItem = ({ item }: { item: RefrigeratorReadyItem }) => (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Text>{item.id} </Text>
      <Text style={{ fontSize: 14 }}>{item.name}</Text>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation(); // 터치 이벤트가 부모로 전달되지 않도록 차단
          handleDelete(item.id);
        }}
        onPressOut={() => modeChange(isfreezer)} // 부모 Pressable의 onPress 수동 실행
      >
        <Text style={{ color: "blue", fontSize: 14 }}>삭제</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation(); // 터치 이벤트가 부모로 전달되지 않도록 차단
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
        onStartShouldSetResponder={() => true} // 이벤트 버블링 활성화
        onPressIn={() => modeChange(false)} // 터치가 감지되었을 때 실행
      >
        <Text>냉장</Text>
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
        onStartShouldSetResponder={() => true} // 이벤트 버블링 활성화
        onPressIn={() => modeChange(true)} // 터치가 감지되었을 때 실행
      >
        <Text>냉동</Text>
        <FlatList
          data={freezerReady}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          style={{ width: "100%" }}
        />
      </Pressable>
      <FloatingButtonInReady />
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
  image: {
    width: 300,
    height: 400,
    resizeMode: "contain",
    marginBottom: 20,
  },
  content: {
    flex: 1,
    borderWidth: 1,
    width: "100%",
  },
  active: {
    backgroundColor: "lightblue",
  },
  inactive: {
    backgroundColor: "transparent",
  },
});
