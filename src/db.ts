import { DataSource } from "typeorm";
import { Set } from "./entities/Set";
import { configDotenv } from "dotenv";
import { User } from "./entities/User";
import { Invoice } from "./entities/Invoice";
import { InvoiceItem } from "./entities/InvoiceItem";
import { Card } from "./entities/Card";
import { CardSet } from "./entities/CardSet";
import { Deck } from "./entities/Deck";
import { DeckCard } from "./entities/DeckCard";

configDotenv()

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Card, Set, CardSet, User, Invoice, InvoiceItem, Deck, DeckCard]
})