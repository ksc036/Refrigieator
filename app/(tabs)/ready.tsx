import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
import FloatingButton from "../../components/FloatingButton";

export default function SmartSelectScreen() {
  const { imageUri } = useLocalSearchParams();
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("받은 이미지 URI:", imageUri); // 🚀 콘솔 로그 추가

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
        console.log(result);
        setExtractedText(result.text || "텍스트를 추출할 수 없습니다.");
      } catch (error) {
        console.error("OCR 에러:", error);
        setExtractedText("텍스트 추출 실패");
      } finally {
        setLoading(false);
      }
    };

    processImage();
  }, [imageUri]);

  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <Text>이미지가 없습니다.</Text>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView>
          <Text style={styles.text}>{extractedText}</Text>
        </ScrollView>
      )}
      <FloatingButton />
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
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginTop: 10,
  },
});
