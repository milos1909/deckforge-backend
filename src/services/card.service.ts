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

        return rows.map(row => ({
            ...row.card,
            setRarity: row.setRarity,
            setRarityCode: row.setRarityCode
        }))
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