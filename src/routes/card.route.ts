import { Router } from "express";
import { defineRequest, parseId } from "../utils";
import { CardService } from "../services/card.service";
import { DeckService } from "../services/deck.service";
import { SetService } from "../services/set.service";

export const CardRoute = Router()

CardRoute.get('/', async (req, res) => {
    await defineRequest(res, async () => {
        const name = String(req.query.name)
        const type = req.query.type as string | undefined
        const archetype = req.query.archetype as string | undefined
        const race = req.query.race as  string | undefined
        const attribute = req.query.attribute as string | undefined
        const level = req.query.level !== undefined ? Number(req.query.level) : undefined
        const scale = req.query.scale !== undefined ? Number(req.query.scale) : undefined
        const linkval = req.query.linkval !== undefined ? Number(req.query.linkval) : undefined
        const sortBy = req.query.sortBy as string | undefined
        const sortDirection = req.query.sortDirection as "DESC" | "ASC" | undefined
        const limit = Number(req.query.limit)
        const offset = Number(req.query.offset) || 0
        return await CardService.getCards(name, limit, offset, type, archetype, race, attribute,level, scale, linkval, sortBy, sortDirection)
    })
})

CardRoute.get('/types', async (req,res) => {
    await defineRequest(res, async () => {
        return await CardService.getCardTypes()
    })
})

CardRoute.get('/archetypes', async (req,res) => {
    await defineRequest(res, async () => {
        return await CardService.getCardArchetypes()
    })
})

CardRoute.get('/races', async (req,res) => {
    await defineRequest(res, async () => {
        const type = String(req.query.type)
        return await CardService.getCardRaces(type)
    })
})

CardRoute.get('/attributes', async (req,res) => {
    await defineRequest(res, async () => {
        return await CardService.getCardAttributes()
    })
})

CardRoute.get('/:id', async (req, res) => {
    await defineRequest(res, async () => {
        const id = parseId(req.params.id)
        return await CardService.getCardById(id)
    })
})

CardRoute.get('/:id/decks', async (req, res) => {
    await defineRequest(res, async () => {
        const id = parseId(req.params.id)
        const limit = Number(req.query.limit)
        return await DeckService.getDecksByCard(id, limit)
    })
})

CardRoute.get('/:id/sets', async (req, res) => {
    await defineRequest(res, async () => {
        const id = parseId(req.params.id)
        const limit = Number(req.query.limit)
        const offset = Number(req.query.offset) || 0
        return await SetService.getSetsByCard(id, limit, offset)
    })
})

