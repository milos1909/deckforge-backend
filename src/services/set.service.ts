import { LessThanOrEqual, Like } from "typeorm"
import { AppDataSource } from "../db"
import { Set } from "../entities/Set"
import { CardService } from "./card.service"
import { AppError } from "../errors/app.error"
import { CardSet } from "../entities/CardSet"

const setRepo = AppDataSource.getRepository(Set)
const cardSetRepo = AppDataSource.getRepository(CardSet)

export class SetService {
    static async getSets(name: string, sortDirection: "DESC" | "ASC", maxPrice: number, limit: number, offset: number){
        const [sets, count] = await setRepo.findAndCount({
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

        return {sets, count}
    }
    
    static async getSetsByCard(cardId: number, limit: number, offset: number) {
        if (!Number.isInteger(limit) || limit <= 0) {
            throw new AppError(400, 'INVALID_LIMIT')
        }

        if (!Number.isInteger(offset) || offset < 0) {
            throw new AppError(400, 'INVALID_OFFSET')
        }

        const [sets, count] = await setRepo
            .createQueryBuilder('set')
            .distinct(true)
            .innerJoin('set.cardSets', 'cardSet')
            .where('cardSet.cardId = :cardId', { cardId })
            .select([
                'set.id',
                'set.setName',
                'set.setCode',
                'set.tcgDate'
            ])
            .orderBy('set.tcgDate', 'DESC')
            .take(limit)
            .skip(offset)
            .getManyAndCount()

        return { sets, count }
    }

    static async getSetByName(setName: string){
        const data = await setRepo.findOne({
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