import { Card } from "../entities/Card";
import { AppDataSource } from "../db";
import { CardSet } from "../entities/CardSet";
import { AppError } from "../errors/app.error";

const cardRepo = AppDataSource.getRepository(Card)
const cardSetRepo = AppDataSource.getRepository(CardSet)

const SORT_COLUMNS = {
  name: "card.name",
  releaseDate: "card.tcgDate",
  atk: "card.atk",
  def: "card.def"
} as const

const RARITY_ORDER = [
    "Quarter Century Secret Rare",
    "Starlight Rare",
    "Ghost Rare",
    "Collector's Rare",
    "Ultimate Rare",
    "Ultra Rare (Pharaoh's Rare)",
    "10000 Secret Rare",
    "Prismatic Secret Rare",
    "Extra Secret Rare",
    "Platinum Secret Rare",
    "Gold Secret Rare",
    "Secret Rare",
    "Ghost/Gold Rare",
    "Grand Master Rare",
    "Ultra Secret Rare",
    "Platinum Rare",
    "Premium Gold Rare",
    "Gold Rare",
    "Mosaic Rare",
    "Ultra Parallel Rare",
    "Ultra Rare",
    "Super Parallel Rare",
    "Super Rare",
    "Duel Terminal Ultra Parallel Rare",
    "Duel Terminal Super Parallel Rare",
    "Duel Terminal Rare Parallel Rare",
    "Duel Terminal Normal Rare Parallel Rare",
    "Duel Terminal Normal Parallel Rare",
    "Starfoil Rare",
    "Shatterfoil Rare",
    "Starfoil",
    "Rare",
    "Normal Parallel Rare",
    "Common",
    "Super Short Print",
    "Short Print",
    "New artwork",
    "New",
    "Reprint",
    "European & Oceanian debut",
    "European debut",
    "Oceanian debut",
    "force-SMW",
    "Cr",
    "3",
    "2",
]

function rarityRank(rarity: string) {
    const index = RARITY_ORDER.indexOf(rarity)

    return index === -1 ? RARITY_ORDER.length : index
}

export class CardService {
    static async getCards(
        name: string, 
        limit: number, 
        offset: number, 
        type?: string, 
        archetype?: string, 
        race?: string, 
        attribute?: string,
        level?: number, 
        scale?: number, 
        linkval?: number, 
        sortBy?: string,
        sortDirection?: "DESC" | "ASC"
    ) {
        const query = cardRepo.createQueryBuilder("card").where(
            "(card.name LIKE :name OR card.description LIKE :name)",
            { name: `%${name}%` }
        )

        if (type) query.andWhere("card.type = :type", { type })
        if (archetype) query.andWhere("card.archetype = :archetype", { archetype })
        if (race) query.andWhere("card.race = :race", { race })
        if (attribute) query.andWhere("card.attribute = :attribute", { attribute })
        if (level !== undefined) query.andWhere("card.level = :level", { level })
        if (scale !== undefined) query.andWhere("card.scale = :scale", { scale })
        if (linkval !== undefined) query.andWhere("card.linkval = :linkval", { linkval })

        const sortColumn = sortBy ? SORT_COLUMNS[sortBy as keyof typeof SORT_COLUMNS] : undefined

        if (sortBy && !sortColumn) {
            throw new AppError(400, "INVALID_SORT")
        }

        if (sortColumn) {
            query.orderBy(`${sortColumn} IS NULL`, "ASC")
            query.addOrderBy(sortColumn, sortDirection ?? "DESC") 
            query.addOrderBy("card.id", "ASC")
        }
        
        query.take(limit).skip(offset)

        const [cards, total] = await query.getManyAndCount()

        return { cards, total }
    }

    static async getCardsBySet(setName: string) {
        const rows = await cardSetRepo.find({
            where: {
                set: {
                    setName
                }
            },
            relations: {
                card: true,
                set: true
            },
            order: {
                card: {
                    name: "ASC"
                }
            }
        })

        const groups = new Map<string, {
            rarity: string
            rarityCode: string | null
            cards: any[]
        }>()

        for (const row of rows) {
            const rarity = row.setRarity || 'Unknown'
            const rarityCode = row.setRarityCode || null

            if (!groups.has(rarity)) {
                groups.set(rarity, {
                    rarity,
                    rarityCode,
                    cards: []
                })
            }

            groups.get(rarity)!.cards.push({
                ...row.card,
                setRarity: row.setRarity,
                setRarityCode: row.setRarityCode
            })
        }

        return [...groups.values()].sort((a, b) => {
            return rarityRank(a.rarity) - rarityRank(b.rarity)
        })
    }

    static async getCardById(id: number){
        const data = await cardRepo.findOne({
            where: {
                id
            }
        })

        if(data == null){
            throw new AppError(404, 'NOT_FOUND')
        }

        return data
    }

    static async getCardTypes() {
        const rows = await cardRepo
            .createQueryBuilder("card")
            .select("DISTINCT card.type", "type")
            .where("card.type IS NOT NULL")
            .andWhere("TRIM(card.type) != ''")
            .orderBy("card.type", "ASC")
            .getRawMany();

        return rows.map(row => row.type);
    }

    static async getCardArchetypes() {
        const rows = await cardRepo
            .createQueryBuilder("card")
            .select("DISTINCT card.archetype", "archetype")
            .where("card.archetype IS NOT NULL")
            .andWhere("TRIM(card.archetype) != ''")
            .orderBy("card.archetype", "ASC")
            .getRawMany();

        return rows.map(row => row.archetype);
    }

    static async getCardRaces(type: string) {
        const rows = await cardRepo
            .createQueryBuilder("card")
            .select("DISTINCT card.race", "race")
            .where("card.type = :type", { type })
            .andWhere("card.race IS NOT NULL")
            .andWhere("TRIM(card.race) != ''")
            .orderBy("card.race", "ASC")
            .getRawMany();

        return rows.map(row => row.race);
    }

    static async getCardAttributes() {
        const rows = await cardRepo
            .createQueryBuilder("card")
            .select("DISTINCT card.attribute", "attribute")
            .where("card.attribute IS NOT NULL")
            .andWhere("TRIM(card.attribute) != ''")
            .orderBy("card.attribute", "ASC")
            .getRawMany();

        return rows.map(row => row.attribute);
    }
}