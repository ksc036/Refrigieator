export interface FoodItems {
  id?: number; //없어도 되어야 생성후에 받아올때는 쓰고 안받아올떄는 안씀
  name: string;
  refrigerated_shelf_life: number;
  frozen_shelf_life: number;
  category?: string;
}
