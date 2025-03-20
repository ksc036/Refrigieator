import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Router, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { addFreezer, addFridge, setText } from "@/store/storageModeSlice";
import { Dispatch } from "@reduxjs/toolkit";
import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
export const pickImage = async (
  dispatch: Dispatch,
  router: Router,
  setIsOpen
) => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"], // ✅ 변경된 방식
    // mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
    allowsMultipleSelection: true,
  });

  if (!result.canceled) {
    const localUri = result.assets[0].uri;
    const formData = new FormData();

    formData.append("file", {
      uri: localUri,
      name: "upload.jpg", // 파일 이름 (아무거나)
      type: "image/jpeg", // MIME 타입
    });
    try {
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

      // const data = await TextRecognition.recognize(
      //   result.assets[0].uri,
      //   TextRecognitionScript.KOREAN
      // );
      console.log(
        "========================================================= 인식률 차이: ",
        data
      );
      dispatch(setText(data["text"]));
      console.log("set Text====================");
      router.push({
        pathname: "/ready",
      });
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
    } finally {
      setIsOpen(false);
    }
  }
};
