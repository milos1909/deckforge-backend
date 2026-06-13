import axios from "axios";
import { Card } from "../entities/Card";
import { AppDataSource } from "../db";
import { Like } from "typeorm";
import { CardSet } from "../entities/CardSet";

const client = axios.create({
    baseURL: 'https://db.ygoprodeck.com/api/v7',
    headers: {
        'Accept': 'application/json',
        'X-Name': 'DECKFORGE'
    },
    validateStatus: (status) => {
        return status === 200
    }
})

const cardRepo = AppDataSource.getRepository(Card)
const cardSetRepo = AppDataSource.getRepository(CardSet)

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
    static async getCards(name: string, limit: number, offset: number) {
        const [cards, total] = await cardRepo.findAndCount({
            where: name
                ? [
                    { name: Like(`%${name}%`) },
                    { description: Like(`%${name}%`) }
                ]
                : {},
            take: limit,
            skip: offset
        })

        return { cards, total }
    }

    static async getCardsBySet(set_name: string) {
        const rows = await cardSetRepo.find({
            where: {
                set: {
                    set_name
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

    static async getCardDetails(id: number){
        const data = await cardRepo.findOne({
            where: {
                id
            }
        })

        if(data == null){
            throw new Error('NOT_FOUND')
        }

        return data
    }
}