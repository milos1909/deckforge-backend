import axios from "axios";
import { AppDataSource } from "../src/db";
import { Card } from "../src/entities/Card";

await AppDataSource.initialize()

try {
    const rsp = await axios.get(
        "https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes" 
    )

    const repo = AppDataSource.getRepository(Card)

    const cards = rsp.data.data

    const entities = cards.map((card: any) => ({
        id: card.id,
        name: card.name,
        type: card.type,
        description: card.desc,
        atk: card.atk ?? null,
        def: card.def ?? null,
        level: card.level ?? null,
        race: card.race,
        attribute: card.attribute ?? null,
        archetype: card.archetype ?? null,
        scale: card.scale ?? null,
        linkval: card.linkval ?? null,
        tcgDate: card.misc_info[0].tcg_date ?? null,
        cardmarket_price: card.card_prices[0].cardmarket_price ?? null
    }))

    const BATCH_SIZE = 500

    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
        const batch = entities.slice(i, i + BATCH_SIZE)

        await repo.upsert(batch, ["id"])

        console.log(`Checked ${Math.min(i + BATCH_SIZE, entities.length)}/${entities.length}`)
    }

    console.log("Cards imported/updated successfully")
} catch (e) {
    console.error("Failed to import cards")
    console.error(e)
} finally {
    await AppDataSource.destroy()
}

