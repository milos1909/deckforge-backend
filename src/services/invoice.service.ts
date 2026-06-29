import { IsNull, Not } from "typeorm";
import { AppDataSource } from "../db";
import { Invoice } from "../entities/Invoice";
import { InvoiceItem } from "../entities/InvoiceItem";
import { Set } from "../entities/Set";
import { UserService } from "./user.service";
import { v7 as uuidv7 } from "uuid"
import { AppError } from "../errors/app.error";
import { Card } from "../entities/Card";
import { Deck } from "../entities/Deck";

const invoiceRepo = AppDataSource.getRepository(Invoice)
const invoiceItemRepo = AppDataSource.getRepository(InvoiceItem)
const setRepo = AppDataSource.getRepository(Set)
const cardRepo = AppDataSource.getRepository(Card)

export class InvoiceService {
    static async getInvoices(username: string) {
        const user = await UserService.getUserByUsername(username)

        return await invoiceRepo.find({
            select: {
                id: true,
                pursId: true,
                createdAt: true
            },
            where: {
                pursId: Not(IsNull()),
                userId: user.id
            }
        })
    }

    static async getInvoiceDetails(invoiceId: number, username: string) {
        const data = await invoiceRepo.findOne({
            select: {
                id: true,
                pursId: true,
                pursTime: true,
                pursCounter: true,
                createdAt: true,
                invoiceItems: {
                    id: true,
                    itemType: true,
                    pricePerItem: true,
                    count: true,
                    set: true,
                    card: true
                }
            },
            where: {
                id: invoiceId,
                user: {
                    username,
                    deletedAt: IsNull()
                },
                invoiceItems: {
                    deletedAt: IsNull()
                }
            },
            relations: {
                invoiceItems: {
                    set: true,
                    card: true
                }
            }
        })

        if (data == null)
            throw new AppError(404, 'NOT_FOUND')

        return data
    }

    private static async getUnpaidInvoice(username: string) {
        const user = await UserService.getUserByUsername(username)

        let unpaidInvoice = await invoiceRepo.findOneBy({
            userId: user.id,
            pursId: IsNull()
            
        })

        if (unpaidInvoice == null) {
            unpaidInvoice = await invoiceRepo.save({
                userId: user.id,
                pursId: null,
                pursTime: null,
                pursCounter: null,
                createdAt: new Date()
            })
        }

        return unpaidInvoice
    }

    static async getCartItems(username: string) {
        const unpaidInvoice = await this.getUnpaidInvoice(username) 

        return await invoiceItemRepo.find({
            select: {
                id: true,
                itemType: true,
                pricePerItem: true,
                count: true,
                set: true,
                card: true
            },
            where: {
                invoiceId: unpaidInvoice.id,
                deletedAt: IsNull()
            },
            relations: {
                set: true,
                card: true
            }
        })
    }

    static async addSetToCart(setName: string, username: string) {
        const set = await setRepo.findOneByOrFail({
            setName
        })

        const unpaidInvoice = await this.getUnpaidInvoice(username)

        const existing = await invoiceItemRepo.findOneBy({
            invoiceId: unpaidInvoice.id,
            itemType: "set",
            setId: set.id,
            deletedAt: IsNull()
        })

        if(existing == null) {
            await invoiceItemRepo.save({
                invoiceId: unpaidInvoice.id,
                itemType: "set",
                setId: set.id,
                cardId: null,
                pricePerItem: set.price,
                count: 1,
                createdAt: new Date()
            })
            return
        }

        existing.count = existing.count + 1
        existing.updatedAt = new Date()
        await invoiceItemRepo.save(existing)
    }

    static async addCardToCart(cardId: number, username: string) {
        const card = await cardRepo.findOneByOrFail({
            id: cardId
        })

        const unpaidInvoice = await this.getUnpaidInvoice(username)

        const existing = await invoiceItemRepo.findOneBy({
            invoiceId: unpaidInvoice.id,
            itemType: "card",
            cardId: card.id,
            deletedAt: IsNull()
        })

        if(existing == null) {
            if (Number(card.cardmarketPrice) <= 0) {
                throw new AppError(400, 'CARD_PRICE_MISSING')
            }
            await invoiceItemRepo.save({
                invoiceId: unpaidInvoice.id,
                itemType: "card",
                setId: null,
                cardId: card.id,
                pricePerItem: card.cardmarketPrice,
                count: 1,
                createdAt: new Date()
            })
            return
        }

        existing.count = existing.count + 1
        existing.updatedAt = new Date()

        if (Number(card.cardmarketPrice) <= 0) {
            throw new AppError(400, 'CARD_PRICE_MISSING')
        }

        await invoiceItemRepo.save(existing)
    }

    static async addDeckToCart(deckId: number, username: string) {
        await AppDataSource.transaction(async manager => {
            const user = await UserService.getUserByUsername(username)

            const deck = await manager.findOne(Deck, {
                where: { id: deckId },
                relations: {
                    deckCards: {
                        card: true
                    }
                }
            })

            if (!deck) throw new AppError(404, 'DECK_NOT_FOUND')

            const unpaidInvoice = await this.getUnpaidInvoice(username)

            const cardCounts = new Map<number, { count: number, price: string }>()

            for (const deckCard of deck.deckCards) {
                const card = deckCard.card

                    if (Number(card.cardmarketPrice) <= 0) {
                        continue
                    }

                const existing = cardCounts.get(card.id)

                cardCounts.set(card.id, {
                    count: (existing?.count ?? 0) + 1,
                    price: card.cardmarketPrice
                })
            }

            for (const [cardId, data] of cardCounts) {
                const existingCartItem = await manager.findOne(InvoiceItem, {
                    where: {
                        invoiceId: unpaidInvoice.id,
                        itemType: 'card',
                        cardId,
                        deletedAt: IsNull()
                    }
                })

                if (existingCartItem) {
                    existingCartItem.count += data.count
                    existingCartItem.updatedAt = new Date()
                    await manager.save(InvoiceItem, existingCartItem)
                    continue
                }

                await manager.save(InvoiceItem, {
                    invoiceId: unpaidInvoice.id,
                    itemType: 'card',
                    setId: null,
                    cardId,
                    pricePerItem: data.price,
                    count: data.count,
                    createdAt: new Date()
                })
            }
        })
    }

    static async changeCartItemCount(invoiceItemId: number, username: string, newCount: number) {
        if (newCount < 1) {
            throw new AppError(400, "COUNT_MUST_BE_>=1")
        }

        const unpaidInvoice = await this.getUnpaidInvoice(username) 
        const data = await invoiceItemRepo.findOneByOrFail({
            id: invoiceItemId,
            invoiceId: unpaidInvoice.id,
            deletedAt: IsNull()
        })

        data.count = newCount
        data.updatedAt = new Date()

        await invoiceItemRepo.save(data)
    }
    
    public static async removeCartItem(invoiceItemId: number, username: string) {
        const unpaidInvoice = await this.getUnpaidInvoice(username) 
        const data = await invoiceItemRepo.findOneByOrFail({
            id: invoiceItemId,
            invoiceId: unpaidInvoice.id,
            deletedAt: IsNull()
        })

        data.deletedAt = new Date()

        await invoiceItemRepo.save(data)
    }

   static async pay(username: string) {
        await AppDataSource.transaction(async (manager) => {
            const user = await UserService.getUserByUsername(username)

            const unpaidInvoice = await manager.findOne(Invoice, {
                where: {
                    userId: user.id,
                    pursId: IsNull()
                }
            })

            if (unpaidInvoice == null) {
                throw new AppError(400, 'CART_IS_EMPTY')
            }

            const invoiceItems = await manager.find(InvoiceItem, {
                where: {
                    invoiceId: unpaidInvoice.id,
                    deletedAt: IsNull()
                },
                relations: {
                    set: true,
                    card: true
                }
            })

            if (invoiceItems.length === 0) {
                throw new AppError(400, 'CART_IS_EMPTY')
            }

            for (const item of invoiceItems) {
                if (item.itemType === 'set') {
                    if (!item.set) {
                        throw new AppError(400, 'INVALID_CART_ITEM')
                    }

                    item.pricePerItem = item.set.price
                }

                if (item.itemType === 'card') {
                    if (!item.card || item.card.cardmarketPrice == null) {
                        throw new AppError(400, 'CARD_PRICE_MISSING')
                    }

                    item.pricePerItem = item.card.cardmarketPrice
                }

                await manager.save(InvoiceItem, item)
            }

            unpaidInvoice.pursId = uuidv7()
            unpaidInvoice.pursCounter = `${new Date().getFullYear()}/${Date.now()}`
            unpaidInvoice.pursTime = new Date()

            await manager.save(Invoice, unpaidInvoice)
        })
    }
}