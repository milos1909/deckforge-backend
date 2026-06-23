import { Router } from "express";
import { defineRequest, parseId } from "../utils";
import { DeckService } from "../services/deck.service";
import { UserService } from "../services/user.service";

export const DeckRoute = Router()

DeckRoute.get('/', async (req: any, res) => {
    await defineRequest(res, async () => {
        const name = String(req.query.name)
        const sortBy = String(req.query.sortBy)
        const limit = Number(req.query.limit)
        const offset = Number(req.query.offset) || 0
        return await DeckService.getDecks(name, sortBy, limit, offset)
    })
})

DeckRoute.get('/:id', UserService.optionalAuth, async (req: any, res) => {
    await defineRequest(res, async () => {
        const id = parseId(req.params.id)
        const requestingUserId = req.user?.id
        return await DeckService.getDeckById(id, requestingUserId)
    })
})

DeckRoute.use(UserService.requireAuth)

DeckRoute.post('/create', async (req: any, res) => {
    await defineRequest(res, async () => {
        const userId = req.user.id
        return await DeckService.create(req.body, userId)
    })
})

DeckRoute.put('/update/:id', async (req: any, res) => {
    await defineRequest(res, async () => {
        const id = parseId(req.params.id)
        const userId = req.user.id
        return await DeckService.update(id, userId, req.body)
    })
})

DeckRoute.patch('/update-metadata/:id', async (req: any, res) => {
  await defineRequest(res, async () => {
    const id = parseId(req.params.id)
    const userId = req.user.id
    return await DeckService.updateMetadata(id, userId, req.body)
  })
})




