import { Router } from "express";
import { defineRequest } from "../utils";
import { CardService } from "../services/card.service";

export const CardRoute = Router()

CardRoute.get('/', async (req, res) => {
    await defineRequest(res, async () => {
        const name = String(req.query.name)
        const offset = Number(req.query.offset) || 0

        return await CardService.getCards(name, offset)
    })
})

CardRoute.get('/:id', async (req, res) => {
    await defineRequest(res, async () => {
        const id = Number(req.params.id)
        return await CardService.getCardDetails(id)
    })
})

