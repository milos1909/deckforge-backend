import { LessThanOrEqual, Like } from "typeorm"
import { AppDataSource } from "../db"
import { Set } from "../entities/Set"
import { CardService } from "./card.service"

const repo = AppDataSource.getRepository(Set)

export class SetService {
    static async getSets(name: string, sortDirection: "DESC" | "ASC", maxPrice: number, limit: number, offset: number){
        const [sets, total] = await repo.findAndCount({
            where: {
                ...({ set_name: Like(`%${name}%`) }),
                ...({ set_price: LessThanOrEqual(maxPrice.toString())}),
            },
            order: {
                tcg_date: sortDirection
            },
            take: limit,
            skip: offset
        })

        return {sets, total}
    }

    static async getSetByName(set_name: string){
        const data = await repo.findOne({
            where: {
                set_name
            }
        })

        if(data == null){
            throw new Error('NOT_FOUND')
        }

        const rsp = await CardService.getCardsBySet(String(set_name))
        
        return {
            set_details: data,
            rarity_groups: rsp
        }
    }
}