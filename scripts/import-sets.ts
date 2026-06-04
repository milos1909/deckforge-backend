import axios from "axios";
import { AppDataSource } from "../src/db";
import { Set } from "../src/entities/Set";

await AppDataSource.initialize()

try {
  const rsp = await axios.get(
    "https://db.ygoprodeck.com/api/v7/cardsets.php"
  )

  const repo = AppDataSource.getRepository(Set)

  const cardSets = rsp.data;

  const entities = cardSets.map((set: any) => ({
    set_code: set.set_code,
    set_name: set.set_name,
    num_of_cards: set.num_of_cards,
    tcg_date: set.tcg_date || null
  }))

  const BATCH_SIZE = 500

  for (let i = 0; i < entities.length; i += BATCH_SIZE) {
    const batch = entities.slice(i, i + BATCH_SIZE)

    await repo
      .createQueryBuilder()
      .insert()
      .into(Set)
      .values(batch)
      .orIgnore()
      .updateEntity(false)
      .execute()

    console.log(`Checked ${Math.min(i + BATCH_SIZE, entities.length)}/${entities.length}`)
  }
  
  console.log("Sets imported successfully")
} catch (e) {
  console.error("Failed to import sets")
  console.error(e)
} finally {
    await AppDataSource.destroy()
}