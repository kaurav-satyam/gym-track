import { beforeEach } from "vitest";
import { db } from "@/data/db";

/** Fresh, empty GymTrack database (fake-indexeddb) before every test in the file. */
export function resetDatabaseBeforeEach() {
  beforeEach(async () => {
    db.close();
    await db.delete();
    await db.open();
  });
}
