// services/database.ts
import * as SQLite from "expo-sqlite";

let dbInstance = null;
/**
 * 앱 시작 시 한 번 실행하여 테이블을 만들어두는 함수
 */
export async function getDb() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("local.db");
  }
  return dbInstance;
}
export async function setupDatabase() {
  dbInstance = await SQLite.openDatabaseAsync("local.db");
}
