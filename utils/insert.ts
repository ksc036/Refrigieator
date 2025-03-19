import { getDb } from "@/services/database";
import {
  addFreezer,
  addFreezerReady,
  addFridge,
  addFridgeReady,
  setFreezerReady,
  setFridgeReady,
} from "@/store/storageModeSlice";
import { RefrigeratorItem, RefrigeratorReadyItem } from "@/types";
import { Dispatch } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { readReFrigerator } from "./select";

export const insertItemToRefridge = async (
  food_item_id: number,
  isFreezer: boolean,
  dispatch: Dispatch
) => {
  // const food_item_id: number = 4;
  const status = isFreezer ? "FREEZER" : "FRIDGE";
  const createdDate = dayjs().format("YYYY-MM-DD");
  const db = await getDb();

  let statement; // 블록 바깥에서 선언
  if (isFreezer) {
    statement = await db.prepareAsync(
      `INSERT INTO REFRIGERATOR (food_item_id, status, created_date) VALUES ($food_item_id, $status, $created_date)`
    );
  } else {
    statement = await db.prepareAsync(
      `INSERT INTO REFRIGERATOR (food_item_id, status, created_date) VALUES ($food_item_id, $status, $created_date)`
    );
  }
  try {
    const result = await statement.executeAsync({
      $food_item_id: food_item_id,
      $status: status,
      $created_date: createdDate,
    });
    // console.log("result 아이템 확인", result.lastInsertRowId);
    // const result2 = await db.getAllAsync("SELECT * FROM REFRIGERATOR");
    // console.log(result2);
    const item = await db.getFirstAsync(
      "select REFRIGERATOR.id id, * from REFRIGERATOR LEFT JOIN FOODITEMS on REFRIGERATOR.food_item_id = FOODITEMS.id where REFRIGERATOR.id = $id",
      result.lastInsertRowId
    );
    // console.log("item log 출력 ", item);

    const instance: RefrigeratorItem = {
      id: result.lastInsertRowId,
      status: isFreezer ? "freezer" : "fridge",
      create_date: item.created_date,
      name: item.name,
      refrigerated_shelf_life: item.refrigerated_shelf_life,
      frozen_shelf_life: item.frozen_shelf_life,
    };
    // console.log("--------------------- instance", instance);
    if (isFreezer) {
      dispatch(addFreezer(instance));
    } else {
      dispatch(addFridge(instance));
    }
  } catch (err) {
    console.log("냉동실 아이템 추가 에러:", err);
  } finally {
    await statement.finalizeAsync();
  }
};

export const insertReadyItem = async (
  food_item_id: number,
  isFreezer: boolean,
  dispatch: Dispatch
) => {
  const status = isFreezer ? "FREEZER" : "FRIDGE";
  const db = await getDb();

  let statement; // 블록 바깥에서 선언
  if (isFreezer) {
    statement = await db.prepareAsync(
      `INSERT INTO PRESTORAGE (food_item_id, status) VALUES ($food_item_id, $status)`
    );
  } else {
    statement = await db.prepareAsync(
      `INSERT INTO PRESTORAGE (food_item_id, status) VALUES ($food_item_id, $status)`
    );
  }

  try {
    const result = await statement.executeAsync({
      $food_item_id: food_item_id,
      $status: status,
    });
    console.log("item출력 : " + result.lastInsertRowId);
    const item = await db.getFirstAsync(
      "select PRESTORAGE.id id,* from PRESTORAGE LEFT JOIN FOODITEMS on PRESTORAGE.food_item_id = FOODITEMS.id where PRESTORAGE.id = $id",
      result.lastInsertRowId
    );
    console.log("item출력 : " + item.id);

    const instance: RefrigeratorReadyItem = {
      id: result.lastInsertRowId,
      name: item.name,
      status: isFreezer ? "freezer" : "fridge",
    };
    console.log("--------------------- instance", instance);
    if (isFreezer) {
      dispatch(addFreezerReady(instance));
    } else {
      dispatch(addFridgeReady(instance));
    }
  } catch (err) {
    console.log("냉동실 아이템 추가 에러:", err);
  } finally {
    await statement.finalizeAsync();
  }
};
export const insertAllReadyItemToRefridge = async (dispatch: Dispatch) => {
  try {
    const db = await getDb();
    //db옮기고
    let query = `INSERT INTO REFRIGERATOR (food_item_id, status, created_date)
SELECT food_item_id, status, $created_date created_date FROM PRESTORAGE
`;
    await db.withTransactionAsync(async () => {
      await db.runAsync(query, dayjs().format("YYYY-MM-DD"));
      await db.runAsync("delete from PRESTORAGE");
    });
    //redux옮기기
    readReFrigerator(dispatch);
    dispatch(setFridgeReady([]));
    dispatch(setFreezerReady([]));
  } catch (err) {
    console.log("err발생 in insertReadyItemToRefridge", err);
  } finally {
  }
};
