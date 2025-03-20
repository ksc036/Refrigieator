import { getDb } from "@/services/database";
import { Dispatch } from "@reduxjs/toolkit";
import {
  setFridge,
  setFreezer,
  setFridgeReady,
  setFreezerReady,
} from "@/store/storageModeSlice";
import { RefrigeratorItem, RefrigeratorReadyItem } from "@/types";

export const readReFrigerator = async (dispatch: Dispatch) => {
  const db = await getDb();

  const fridege: RefrigeratorItem[] = [];
  const freezer: RefrigeratorItem[] = [];
  for await (const row of await db.getAllAsync(
    "select REFRIGERATOR.id id, REFRIGERATOR.status status,REFRIGERATOR.created_date created_date,FOODITEMS.name name , FOODITEMS.refrigerated_shelf_life refrigerated_shelf_life,FOODITEMS.frozen_shelf_life frozen_shelf_life from REFRIGERATOR LEFT JOIN FOODITEMS on REFRIGERATOR.food_item_id = FOODITEMS.id"
  )) {
    const instance: RefrigeratorItem = {
      id: row.id,
      status: row.status,
      create_date: row.created_date,
      name: row.name,
      refrigerated_shelf_life: row.refrigerated_shelf_life,
      frozen_shelf_life: row.frozen_shelf_life,
    };
    if (row.status === "FREEZER") {
      freezer.push(instance);
    } else {
      fridege.push(instance);
    }
  }
  dispatch(setFridge(fridege));
  dispatch(setFreezer(freezer));
};

export const readReadyItem = async (dispatch: Dispatch) => {
  try {
    const freezerReady: RefrigeratorReadyItem[] = [];
    const fridgeReady: RefrigeratorReadyItem[] = [];
    const db = await getDb();
    //db옮기고
    let query = `SELECT PRESTORAGE.id id, PRESTORAGE.status status, FOODITEMS.name name FROM PRESTORAGE LEFT JOIN FOODITEMS on PRESTORAGE.food_item_id = FOODITEMS.id
    `;
    for await (const row of await db.getAllAsync(query)) {
      if (row.status === "FREEZER") {
        freezerReady.push({ id: row.id, name: row.name, status: row.status });
      } else {
        fridgeReady.push({ id: row.id, name: row.name, status: row.status });
      }
    }
    console.log("readReadyItem========");
    dispatch(setFridgeReady(fridgeReady));
    dispatch(setFreezerReady(freezerReady));
  } catch (err) {
    console.log("err발생 in readReadyItem", err);
  } finally {
  }
};
