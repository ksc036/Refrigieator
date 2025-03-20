import { FoodItems } from "./foodItem.types";
export interface PreStorage {
  food_item_id?: number;
  status: "FREEZER" | "FRIDGE";
  food_item?: FoodItems;
}

export interface RefrigeratorReadyItem {
  id: number;
  name: string;
  status: "FREEZER" | "FRIDGE";
}
