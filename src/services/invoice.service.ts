import { IsNull, Not } from "typeorm";
import { AppDataSource } from "../db";
import { Invoice } from "../entities/Invoice";
import { InvoiceItem } from "../entities/InvoiceItem";
import { Set } from "../entities/Set";
import { UserService } from "./user.service";
import { v7 as uuidv7 } from "uuid"

const invoiceRepo = AppDataSource.getRepository(Invoice)
const invoiceItemRepo = AppDataSource.getRepository(InvoiceItem)
const setRepo = AppDataSource.getRepository(Set)

export class InvoiceService {
    static async addItemToCart(setName: string, username: string) {
        const set = await setRepo.findOneByOrFail({
            setName
        })

        const unpaidInvoice = await this.getUnpaidInvoice(username)

        const existing = await invoiceItemRepo.findOneBy({
            invoiceId: unpaidInvoice.id,
            setId: set.id,
            deletedAt: IsNull()
        })

        if(existing == null) {
            await invoiceItemRepo.save({
                invoiceId: unpaidInvoice.id,
                setId: set.id,
                pricePerItem: Number(set.price),
                count: 1,
                createdAt: new Date()
            })
            return
        }

        existing.count = existing.count + 1
        existing.updatedAt = new Date()
        await invoiceItemRepo.save(existing)
    }

    static async getCartItems(username: string) {
        const unpaidInvoice = await this.getUnpaidInvoice(username) 

        return await invoiceItemRepo.find({
            select: {
                id: true,
                count: true,
                set: true
            },
            where: {
                invoiceId: unpaidInvoice.id,
                deletedAt: IsNull()
            },
            relations: {
                set: true
            }
        })
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

    static async changeCartItemCount(invoiceItemId: number, username: string, newCount: number) {
        if (newCount < 1) {
            throw new Error("COUNT_MUST_BE_>=1")
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

    static async pay(username: string) {
        const unpaidInvoice = await this.getUnpaidInvoice(username)

        const invoiceItems = await invoiceItemRepo.find({
            where: {
                invoiceId: unpaidInvoice.id,
                deletedAt: IsNull()
            },
            relations: {
                set: true
            }
        })

        if (invoiceItems.length == 0){
            throw new Error ('CART_IS_EMPTY')
        }

        for (let item of invoiceItems) {
            item.pricePerItem = Number(item.set.set_price)
            await invoiceItemRepo.save(item)
        }

        unpaidInvoice.pursId = uuidv7()
        unpaidInvoice.pursCounter = `${new Date().getFullYear()}/${Date.now()}`
        unpaidInvoice.pursTime = new Date()

        await invoiceRepo.save(unpaidInvoice)
    }

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
                    pricePerItem: true,
                    count: true,
                    set: true
                }
            },
            where: {
                invoiceItems: {
                    invoiceId,
                    deletedAt: IsNull(),
                },
                user: {
                    deletedAt: IsNull(),
                    username
                }
            },
            relations: {
                invoiceItems: {
                    set: true
                }
            }
        })

        if (data == null)
            throw new Error('NOT_FOUND')

        return data
    }
}