import { LessThanOrEqual, Like } from "typeorm"
import { AppDataSource } from "../db"
import { Set } from "../entities/Set"
import { CardService } from "./card.service"
import { AppError } from "../errors/app.error"

const repo = AppDataSource.getRepository(Set)

export class SetService {
    static async getSets(name: string, sortDirection: "DESC" | "ASC", maxPrice: number, limit: number, offset: number){
        const [sets, total] = await repo.findAndCount({
            where: {
                ...({ setName: Like(`%${name}%`) }),
                ...({ price: LessThanOrEqual(maxPrice.toString())}),
            },
            order: {
                tcgDate: sortDirection
            },
            take: limit,
            skip: offset
        })

        return {sets, total}
    }

    static async getSetByName(setName: string){
        const data = await repo.findOne({
            where: {
                setName
            }
        })

        if(data == null){
            throw new AppError(404, 'NOT_FOUND')
        }

        const rsp = await CardService.getCardsBySet(String(setName))
        
        return {
            set_details: data,
            rarity_groups: rsp
        }
    }
}