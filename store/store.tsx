// 📌 store.js
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice"; // 리듀서 import
import setModeReducer from "./storageModeSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer, // 스토어에 리듀서 등록
    storageMode: setModeReducer,
  },
});

export default store;
