import { Router } from "express";
import { defineRequest, parseId } from "../utils";
import { InvoiceService } from "../services/invoice.service";

export const InvoiceRoute = Router() 

InvoiceRoute.get('/', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        return await InvoiceService.getInvoices(username)
    })   
})

InvoiceRoute.get('/cart', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        return await InvoiceService.getCartItems(username)
    })   
})

InvoiceRoute.put('/cart/set/:setName', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const setName = req.params.setName
        return await InvoiceService.addSetToCart(setName, username)
    })   
})

InvoiceRoute.put('/cart/card/:cardId', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const cardId = parseId(req.params.cardId)
        return await InvoiceService.addCardToCart(cardId, username)
    })   
})

InvoiceRoute.put('/cart/deck/:deckId', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const deckId = parseId(req.params.deckId)
        return await InvoiceService.addDeckToCart(deckId, username)
    })   
})

InvoiceRoute.put('/cart/:id/count/:count', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const invoiceItemId = parseId(req.params.id)
        const count = Number(req.params.count)

        return await InvoiceService.changeCartItemCount(invoiceItemId, username, count)
    })   
})

InvoiceRoute.put('/pay', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        return await InvoiceService.pay(username)
    })   
})

InvoiceRoute.delete('/cart/:id', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const invoiceItemId = parseId(req.params.id)

        return await InvoiceService.removeCartItem(invoiceItemId, username)
    })   
})

InvoiceRoute.get('/:id', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const id = parseId(req.params.id)
        return await InvoiceService.getInvoiceDetails(id, username)
    })
})