import { Router } from "express";
import { SetService } from "../services/set.service";
import { defineRequest } from "../utils";

export const SetRoute = Router()

SetRoute.get('/', async (req, res) => {
    await defineRequest(res, async () => {
        const name = String(req.query.name)
        const skip = Number(req.query.offset) || 0

        return await SetService.getSets(name, skip)
    })
})

SetRoute.get('/:set_name', async (req, res) => {
    await defineRequest(res, async () => {
        const set_name = String(req.params.set_name)
        return await SetService.getSetByName(set_name)
    })
})