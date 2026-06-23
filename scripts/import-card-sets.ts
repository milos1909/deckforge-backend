import axios from "axios"
import { AppDataSource } from "../src/db"
import { CardSet } from "../src/entities/CardSet"
import { Set } from "../src/entities/Set"

function normalizeName(value: string) {
    return value.trim().toLowerCase()
}

await AppDataSource.initialize()

try {
    const rsp = await axios.get(
        "https://db.ygoprodeck.com/api/v7/cardinfo.php"
    )

    const cardSetRepo = AppDataSource.getRepository(CardSet)
    const setRepo = AppDataSource.getRepository(Set)

    const cards = rsp.data.data

    const dbSets = await setRepo.find()
    const setMap = new Map(
        dbSets.map(set => [normalizeName(set.setName!), set.id])
    )

    const entities = []

    for (const card of cards) {
        if (!card.card_sets) continue

        for (const apiSet of card.card_sets) {
            const setId = setMap.get(normalizeName(apiSet.set_name))

            if (!setId) {
                console.log(`Set not found: ${apiSet.set_name}`)
                continue
            }

            entities.push({
                cardId: card.id,
                setId,
                setRarity: apiSet.set_rarity ?? null,
                setRarityCode: apiSet.set_rarity_code ?? null
            })
        }
    }

    const BATCH_SIZE = 500

    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
        const batch = entities.slice(i, i + BATCH_SIZE)

        await cardSetRepo.upsert(batch, [
            "cardId",
            "setId",
            "setRarity"
        ])

        console.log(
            `Checked ${Math.min(i + BATCH_SIZE, entities.length)}/${entities.length}`
        )
    }

    console.log("Card-set relations imported successfully")
} catch (e) {
    console.error("Failed to import card-set relations")
    console.error(e)
} finally {
    await AppDataSource.destroy()
}