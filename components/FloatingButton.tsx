import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getDb } from "@/services/database";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { addFreezer, addFridge, setText } from "@/store/storageModeSlice";
import { useFocusEffect } from "@react-navigation/native";
import { Refrigerator, RefrigeratorItem } from "@/types";
import { insertItemToRefridge } from "@/utils/insert";
import { pickImage } from "@/utils/image";
import { Alert } from "react-native";
export default function FloatingButton() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isFreezer = useSelector((stat) => stat.storageMode.isfreezer);
  const freezer = useSelector((stat) => stat.storageMode.freezer);
  const fridge = useSelector((stat) => stat.storageMode.fridge);
  const text = useSelector((stat) => stat.storageMode.text);
  const [isOpen, setIsOpen] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // console.log("isFreezer 상태 체크 ", isFreezer);
    }, [isFreezer])
  );
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("카메라 권한이 필요합니다.");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      const formData = new FormData();

      formData.append("file", {
        uri: localUri,
        name: "upload.jpg", // 파일 이름 (아무거나)
        type: "image/jpeg", // MIME 타입
      });
      // Flask 서버에 POST 요청
      const response = await fetch("https://ocr.ksc036.store/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      // 응답 수신
      const data = await response.json();
      dispatch(setText(data["text"]));

      router.push({
        pathname: "/ready",
      });
      setIsOpen(false); // 메뉴 닫기
    }
  };
  return (
    <View style={styles.container}>
      {isOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.menuText}>사진 촬영</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              pickImage(dispatch, router, setIsOpen);
            }}
          >
            <Ionicons name="images" size={24} color="white" />
            <Text style={styles.menuText}>갤러리 선택</Text>
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
    // borderWidth: 2,
    // borderColor: "black",
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
