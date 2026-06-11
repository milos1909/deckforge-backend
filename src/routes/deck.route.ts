import { Router } from "express";
import { defineRequest } from "../utils";
import { DeckService } from "../services/deck.service";

export const DeckRoute = Router()

DeckRoute.post('/create', async (req: any, res) => {
    await defineRequest(res, async () => {
        const userId = req.user.id

        await DeckService.create(userId, req.body)
    })
})

DeckRoute.put('/update/:id', async (req, res) => {
    await defineRequest(res, async () => {
        const id = Number(req.params.id)
        await DeckService.update(id, req.body)
    })
})
