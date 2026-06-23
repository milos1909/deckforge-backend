import { AppDataSource } from "../db";
import { User } from "../entities/User";
import bcrypt from "bcrypt"
import { MailService } from "./mail.service";
import { generateVerificationCode, getAccessToken } from "../utils";
import { IsNull, Not } from "typeorm";
import jwt from "jsonwebtoken"
import type { Response } from "express";
import { AppError } from "../errors/app.error";

const repo = AppDataSource.getRepository(User)
const JWT_SECRET = process.env.JWT_SECRET ?? ''

export class UserService {
    static async createAccount(obj: any){
        if(await repo.existsBy({email: obj.email}) || await repo.existsBy({username: obj.username})){
            throw Error()
        }

        const hashed = bcrypt.hashSync(obj.password, 12)
        const code = generateVerificationCode()

        MailService.send(obj.email, 'Email verification code', `
            <h3>Hi ${obj.username}, welcome to our app</h3>
            <p>Your verification code is: <strong>${code}</strong</p>
        `)

        await repo.save({
            username: obj.username,
            email: obj.email,
            emailCode: code,
            password: hashed,
            createdAt: new Date()
        })
    }

    static async verifyAccount(code: number){
        const acc = await repo.findOneBy({
            emailCode: code,
            verifiedAt: IsNull(),
            deletedAt: IsNull() 
        })

        if (acc == null) throw new AppError(404, 'NOT_FOUND')

        acc.verifiedAt = new Date()
        await repo.save(acc)
    }

    static async login(obj: any){
        const user = await this.getUserByUsername(obj.username)
        
        if(!bcrypt.compareSync(obj.password, user.password)) throw new AppError(401, 'USER_NOT_FOUND')

        return {
            access: jwt.sign({id: user.id, username: user.username}, JWT_SECRET, { expiresIn:  '7d' }),
            refresh: jwt.sign({id: user.id, username: user.username}, JWT_SECRET, { expiresIn:  '7d' }),
            username: user.username
        }
    }

    static async refreshToken(token: string){
        const decoded: any = jwt.verify(token, JWT_SECRET)
        const user = await this.getUserByUsername(decoded.username)

        return {
            access: jwt.sign({id: user.id, username: user.username}, JWT_SECRET, {expiresIn: '7d'}),
            refresh: token,
            username: user.username
        }
    }

    static requireAuth(req: any, res: Response, next: Function) {
        const token = getAccessToken(req)

        if (!token) {
            res.status(401).json({
                message: 'NO_TOKEN_FOUND',
                timestamp: new Date()
            })
            return
        }

        try {
            req.user = jwt.verify(token, JWT_SECRET)
            next()
        } catch {
            res.status(403).json({
                message: 'INVALID_TOKEN',
                timestamp: new Date()
            })
        }
    }

    static optionalAuth(req: any, res: Response, next: Function) {
        const token = getAccessToken(req)

        if (!token) {
            next()
            return
        }

        try {
            req.user = jwt.verify(token, JWT_SECRET)
            next()
        } catch {
            res.status(403).json({
                message: 'INVALID_TOKEN',
                timestamp: new Date()
            })
        }
    }

    static async getUserByUsername(username: string){
        const user = await repo.findOneBy({
            username,
            verifiedAt: Not(IsNull()),
            deletedAt: IsNull()
        })

        if(user == null) throw new AppError(404, 'USER_NOT_FOUND')

        return user
    }

    static async getUserProfile(username: string) {
        const user = await repo.findOneOrFail({
            select: {
                id: true,
                username: true,
                email: true,
                decks: {
                    id: true,
                    name: true,
                    description: true,
                    coverCardId: true,
                    isPublic: true,
                    createdAt: true,
                    updatedAt: true,
                    type: true,
                    viewCount: true
                },
                invoices: {
                    id: true,
                    pursId: true,
                    pursTime: true,
                    invoiceItems: {
                        id: true,
                        pricePerItem: true,
                        count: true
                    }
                }
            },
            where: {
                username,
                deletedAt: IsNull()
            },
            relations: {
                decks: true,
                invoices: {
                    invoiceItems: true
                }
            }
        })

        user.invoices = user.invoices?.filter(invoice => invoice.pursId != null) ?? []

        return user
    }
}