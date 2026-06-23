import type { Response } from "express";
import { AppError } from "./errors/app.error";

export async function defineRequest<T>(res: Response, callback: () => T | Promise<T>) {
  try {
    const data = await callback()

    if (data == null) {
      res.status(204).send()
      return
    }

    res.json(data)
  } catch (error: unknown) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        message: error.code,
        timestamp: new Date()
      })
      return
    }

    console.error(error)

    res.status(500).json({
      message: 'SERVER_ERROR',
      timestamp: new Date()
    })
  }
}

export function generateVerificationCode() {
    const number = Math.floor(Math.random() * 1000000)
    return Number(String(number).padStart(6, '0'))
}

export function getAccessToken(req: any): string | null {
    const authorization = req.headers.authorization

    if (!authorization) return null

    const [scheme, token] = authorization.split(' ')

    if (scheme !== 'Bearer' || !token) return null

    return token
}

export function parseId(value: string): number {
  const id = Number(value)

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "INVALID_ID")
  }

  return id
}