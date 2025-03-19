import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getDb } from "@/services/database";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { addFreezerReady, addFridgeReady } from "@/store/storageModeSlice";
import { useFocusEffect } from "@react-navigation/native";
import { RefrigeratorReadyItem } from "@/types";
import { insertReadyItem, insertAllReadyItemToRefridge } from "@/utils/insert";

export default function FloatingButton() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isFreezer = useSelector((stat) => stat.storageMode.isfreezer);
  const freezer = useSelector((stat) => stat.storageMode.freezer);
  const fridge = useSelector((stat) => stat.storageMode.fridge);
  const [isOpen, setIsOpen] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log("isFreezer 상태 체크 ", isFreezer);
    }, [isFreezer])
  );
  // 📌 갤러리에서 이미지 선택
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/ready",
        params: { imageUri: result.assets[0].uri },
      });
      setIsOpen(false); // 메뉴 닫기
    }
  };

  // 📌 카메라로 사진 촬영
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/ready",
        params: { imageUri: result.assets[0].uri },
      });
      setIsOpen(false); // 메뉴 닫기
    }
  };

  // const insert = async () => {
  //   const food_item_id: number = 1;
  //   const status = isFreezer ? "FREEZER" : "FRIDGE";
  //   const db = await getDb();

  //   let statement; // 블록 바깥에서 선언
  //   if (isFreezer) {
  //     statement = await db.prepareAsync(
  //       `INSERT INTO PRESTORAGE (food_item_id, status) VALUES ($food_item_id, $status)`
  //     );
  //   } else {
  //     statement = await db.prepareAsync(
  //       `INSERT INTO PRESTORAGE (food_item_id, status) VALUES ($food_item_id, $status)`
  //     );
  //   }

  //   try {
  //     const result = await statement.executeAsync({
  //       $food_item_id: food_item_id,
  //       $status: status,
  //     });

  //     const item = await db.getFirstAsync(
  //       "select PRESTORAGE.id id,* from PRESTORAGE LEFT JOIN FOODITEMS on PRESTORAGE.food_item_id = FOODITEMS.id where PRESTORAGE.id = $id",
  //       result.lastInsertRowId
  //     );
  //     console.log("item출력 : " + item);

  //     const instance: RefrigeratorReadyItem = {
  //       id: result.lastInsertRowId,
  //       status: isFreezer ? "freezer" : "fridge",
  //       name: item.name,
  //     };
  //     console.log("--------------------- instance", instance);
  //     if (isFreezer) {
  //       dispatch(addFreezerReady(instance));
  //     } else {
  //       dispatch(addFridgeReady(instance));
  //     }
  //   } catch (err) {
  //     console.log("냉동실 아이템 추가 에러:", err);
  //   } finally {
  //     await statement.finalizeAsync();
  //   }
  // };
  return (
    <View style={styles.container}>
      {isOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.menuText}>사진 촬영</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={pickImage}>
            <Ionicons name="images" size={24} color="white" />
            <Text style={styles.menuText}>갤러리 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              insertReadyItem(4, isFreezer, dispatch);
            }}
          >
            <Ionicons name="search-outline" size={24} color="white" />
            <Text style={styles.menuText}>검색</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              insertAllReadyItemToRefridge(dispatch);
            }}
          >
            <Ionicons name="search-outline" size={24} color="white" />
            <Text style={styles.menuText}>동기화</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 플로팅 버튼 */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Ionicons name={isOpen ? "close" : "add"} size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    right: 20,
    alignItems: "center",
  },
  menu: {
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  menuText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
  },
  button: {
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
});
