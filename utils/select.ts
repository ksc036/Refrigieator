import { getDb } from "@/services/database";
import { Dispatch } from "@reduxjs/toolkit";
import { setFridge, setFreezer } from "@/store/storageModeSlice";
import { RefrigeratorItem } from "@/types";

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
