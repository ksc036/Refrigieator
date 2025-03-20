import { FoodItems } from "./foodItem.types";

export interface Refrigerator {
  id: number;
  food_item_id: number;
  status: "FREEZER" | "FRIDGE";
  create_date: string;
  food_item: FoodItems;
}

export interface RefrigeratorItem {
  id: number;
  status: "FREEZER" | "FRIDGE";
  create_date: string;
  name: string;
  refrigerated_shelf_life: number;
  frozen_shelf_life: number;
  category?: string;
}
