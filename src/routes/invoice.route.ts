import { Router } from "express";
import { defineRequest } from "../utils";
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

InvoiceRoute.put('/pay', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        return await InvoiceService.pay(username)
    })   
})

InvoiceRoute.put('/cart/add/:set_name', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const set_name = req.params.set_name
        return await InvoiceService.addItemToCart(set_name, username)
    })   
})

InvoiceRoute.put('/cart/:id/count/:count', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const invoiceItemId = Number(req.params.id)
        const count = Number(req.params.count)

        return await InvoiceService.changeCartItemCount(invoiceItemId, username, count)
    })   
})

InvoiceRoute.delete('/cart/:id', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const invoiceItemId = Number(req.params.id)

        return await InvoiceService.removeCartItem(invoiceItemId, username)
    })   
})

InvoiceRoute.get('/:id', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        const id = Number(req.params.id)
        return await InvoiceService.getInvoiceDetails(id, username)
    })
})