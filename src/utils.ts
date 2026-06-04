import type { Response } from "express";

export async function defineRequest(res: Response, callback: Function) {
    try {
        const data = await callback()
        if(data == null){
            res.status(204).send()
            return
        }

        res.json(data)

    } catch (e: any) {
        const code = e.message == 'NOT_FOUND' ? 404 : 500
        res.status(code).json({
            message: e.message ?? 'SERVER_ERROR',
            timestamp: new Date()   
        })

        console.log(e)
    }
}

export function generateVerificationCode() {
    const number = Math.floor(Math.random() * 1000000)
    return Number(String(number).padStart(6, '0'))
}