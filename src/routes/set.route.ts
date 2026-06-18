import { Router } from "express";
import { SetService } from "../services/set.service";
import { defineRequest } from "../utils";

export const SetRoute = Router()

SetRoute.get('/', async (req, res) => {
    await defineRequest(res, async () => {
        const name = String(req.query.name)
        const sortDirection = req.query.sortDirection === "DESC" ? "DESC" : "ASC"
        const maxPrice = Number(req.query.maxPrice)
        const limit = Number(req.query.limit)
        const skip = Number(req.query.offset) || 0

        return await SetService.getSets(name, sortDirection, maxPrice, limit, skip)
    })
})

SetRoute.get('/:setName', async (req, res) => {
    await defineRequest(res, async () => {
        const setName = String(req.params.setName)
        return await SetService.getSetByName(setName)
    })
})