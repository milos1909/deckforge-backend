import { Router } from "express";
import { defineRequest } from "../utils";
import { DeckService } from "../services/deck.service";

export const DeckRoute = Router()

DeckRoute.post('/create', async (req: any, res) => {
    await defineRequest(res, async () => {
        const userId = req.user.id

        return await DeckService.create(req.body, userId)
    })
})

DeckRoute.put('/update/:id', async (req: any, res) => {
    await defineRequest(res, async () => {
        const id = Number(req.params.id)
        const userId = req.user.id

        await DeckService.update(id, userId, req.body)
    })
})
