import { AppDataSource } from "../db";
import { User } from "../entities/User";
import bcrypt from "bcrypt"
import { MailService } from "./mail.service";
import { generateVerificationCode } from "../utils";
import { IsNull, Not } from "typeorm";
import jwt from "jsonwebtoken"
import type { Response } from "express";

const repo = AppDataSource.getRepository(User)
const JWT_SECRET = process.env.JWT_SECRET ?? ''

export class UserService {
    static async createAccount(obj: any){
        if(await repo.existsBy({email: obj.email}) || await repo.existsBy({username: obj.username})){
            throw Error()
        }

        const hashed = bcrypt.hashSync(obj.password, 12)
        const code = generateVerificationCode(  )

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

        if (acc == null) throw new Error('NOT_FOUND')

        acc.verifiedAt = new Date()
        await repo.save(acc)
    }

    static async login(obj: any){
        const user = await this.getUserByUsername(obj.username)
        
        if(!bcrypt.compareSync(obj.password, user.password)) throw new Error('USER_NOT_FOUND')

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
            access: jwt.sign({username: user.username}, JWT_SECRET, {expiresIn: '7d'}),
            refresh: token,
            username: user.username
        }
    }

    static async validateToken(req: any, res: Response, next: Function){
        const whitelisted = [
            '/api/user/login',
            '/api/user/refresh',
            '/api/user/signup',
            '/api/user/verify',
            '/api/set',
            '/api/card'
        ]

        if (whitelisted.find(w => req.path.startsWith(w))){
            next()
            return
        }

        const auth = req.headers['authorization']
        const token = auth && auth.split(' ')[1]

        if (token == undefined) {
            res.status(401).json({
                message: "NO_TOKEN_FOUND",
                timestamp: new Date()
            })
            return
        }

        jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
            if (err) {
                res.status(403).json({
                    message: "INVALID_TOKEN",
                    timestamp: new Date()
                })
                return
            }

            req.user = user
            next()
        })
    }

    static async getUserByUsername(username: string){
        const user = await repo.findOneBy({
            username,
            verifiedAt: Not(IsNull()),
            deletedAt: IsNull()
        })

        if(user == null) throw new Error('USER_NOT_FOUND')

        return user
    }

    static async getUserProfile(username: string) {
        const user = await repo.findOneOrFail({
            select: {
                id: true,
                username: true,
                email: true,
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
                invoices: {
                    invoiceItems: true
                }
            }
        })

        user.invoices = user.invoices?.filter(invoice => invoice.pursId != null) ?? []

    return user
}

    static async updateUserPassword(payload: any, username: string) {
        const user = await this.getUserByUsername(username)

        if (payload.currentPassword == '' || payload.newPassword == '')
            throw new Error('PASSWORD_MUST_NOT_BE_EMPTY')

        if (!bcrypt.compareSync(payload.oldPassword, user.password))
            throw new Error('BAD_PASSWORD')

        user.password = bcrypt.hashSync(payload.newPassword, 12)
        await repo.save(user)
    }
}