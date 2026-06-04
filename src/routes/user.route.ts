import { Router } from "express";
import { defineRequest } from "../utils";
import { UserService } from "../services/user.service";

export const UserRoute = Router()

UserRoute.get('/profile', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        return await UserService.getUserProfile(username)
    })
})

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
        const auth = req.headers['authorization']
        const token = auth && auth.split(' ')[1]

        if(token == undefined) throw new Error("REFRESH_TOKEN_MISSING")

        return await UserService.refreshToken(token)
    })  
})

UserRoute.put('/password', async (req: any, res) => {
    await defineRequest(res, async () => {
        const username = req.user.username
        return await UserService.updateUserPassword(req.body, username)
    })
})