import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      // 앱이 처음 실행될 때 "(tabs)" 폴더를 기본 라우트로 사용
      initialRouteName="(tabs)"
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#007AFF",
      }}
    >
      {/* (tabs) 폴더를 스크린처럼 등록 */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* 404 페이지 등록 (잘못된 URL 접근 시) */}
      <Stack.Screen
        name="+not-found"
        options={{ title: "페이지를 찾을 수 없음" }}
      />
    </Stack>
  );
}
