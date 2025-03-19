// 📌 counterSlice.js
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Refrigerator, RefrigeratorItem, RefrigeratorReadyItem } from "@/types";
const initialState = {
  isfreezer: true as boolean,
  freezer: [] as RefrigeratorItem[],
  fridge: [] as RefrigeratorItem[],
  freezerReady: [] as RefrigeratorReadyItem[],
  fridgeReady: [] as RefrigeratorReadyItem[],
};

const storageModeSlice = createSlice({
  name: "storageMode",
  initialState,
  reducers: {
    modeToggle: (state) => {
      state.isfreezer = !state.isfreezer;
    },
    setModeFreezer: (state) => {
      state.isfreezer = true;
    },
    setModeFridge: (state) => {
      state.isfreezer = false;
    },
    setFreezer: (stat, action) => {
      stat.freezer = action.payload;
    },
    setFridge: (stat, action) => {
      stat.fridge = action.payload;
    },
    addFreezer: (stat, action) => {
      stat.freezer.push(action.payload);
    },
    addFridge: (stat, action) => {
      stat.fridge.push(action.payload);
    },
    removeFreezerItemById: (stat, action: PayloadAction<number>) => {
      stat.freezer = stat.freezer.filter((item) => item.id !== action.payload);
    },
    removeFridgeItemById: (stat, action) => {
      stat.fridge = stat.fridge.filter((item) => item.id !== action.payload);
    },

    setFridgeReady: (stat, action) => {
      stat.fridgeReady = action.payload;
    },
    setFreezerReady: (stat, action) => {
      stat.freezerReady = action.payload;
    },
    addFreezerReady: (stat, action) => {
      stat.freezerReady.push(action.payload);
    },
    addFridgeReady: (stat, action) => {
      stat.fridgeReady.push(action.payload);
    },
    removeFreezerReadyItemById: (stat, action: PayloadAction<number>) => {
      stat.freezerReady = stat.freezerReady.filter(
        (item) => item.id !== action.payload
      );
    },
    removeFridgeReadyItemById: (stat, action: PayloadAction<number>) => {
      stat.fridgeReady = stat.fridgeReady.filter(
        (item) => item.id !== action.payload
      );
    },
    toggleFreezerReadyItemById: (stat, action: PayloadAction<number>) => {
      const index = stat.freezerReady.findIndex(
        (obj: RefrigeratorReadyItem) => obj.id === action.payload
      );
      if (index !== -1) {
        stat.fridgeReady.push(stat.freezerReady.splice(index, 1)[0]);
      }
    },
    toggleFridgeReadyItemById: (stat, action: PayloadAction<number>) => {
      const index = stat.fridgeReady.findIndex(
        (obj: RefrigeratorReadyItem) => obj.id === action.payload
      );
      if (index !== -1) {
        stat.freezerReady.push(stat.fridgeReady.splice(index, 1)[0]);
      }
    },
  },
});

export const {
  setModeFreezer,
  setModeFridge,
  setFreezer,
  setFridge,
  addFreezer,
  addFridge,
  removeFreezerItemById,
  removeFridgeItemById,
  setFridgeReady,
  setFreezerReady,
  addFreezerReady,
  addFridgeReady,
  removeFreezerReadyItemById,
  removeFridgeReadyItemById,
  toggleFreezerReadyItemById,
  toggleFridgeReadyItemById,
} = storageModeSlice.actions; // 액션 export
export default storageModeSlice.reducer; // 리듀서 export
