import { Router } from "express";
import { defineRequest, getAccessToken } from "../utils";
import { UserService } from "../services/user.service";
import { AppError } from "../errors/app.error";

export const UserRoute = Router()

UserRoute.post('/signup', async (req, res) => {
    await defineRequest(res, async () => {
        return await UserService.createAccount(req.body)
    })
})

UserRoute.put('/verify/:code', async (req, res) => {
    await defineRequest(res, async () => {
        const code = Number(req.params.code)
        return await UserService.verifyAccount(code)
    })
})

UserRoute.post('/login', async (req, res) => {
    await defineRequest(res, async () => {
        return await UserService.login(req.body)
    })  
})

UserRoute.post('/refresh', async (req, res) => {
    await defineRequest(res, async () => {
        const token = getAccessToken(req)

        if(!token) throw new AppError(401, "REFRESH_TOKEN_MISSING")

        return await UserService.refreshToken(token)
    })  
})

UserRoute.use(UserService.requireAuth)

UserRoute.get('/profile', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        return await UserService.getUserProfile(username)
    })
})