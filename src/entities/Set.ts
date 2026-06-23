import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CardSet } from "./CardSet";
import { InvoiceItem } from "./InvoiceItem";

@Index("uq_set_set_name", ["setName"], { unique: true })
@Entity("set", { schema: "deckforge" })
export class Set {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "set_code", nullable: true, length: 50 })
  setCode: string | null;

  @Column("varchar", {
    name: "set_name",
    nullable: true,
    unique: true,
    length: 255,
  })
  setName: string | null;

  @Column("int", { name: "num_of_cards", nullable: true })
  numOfCards: number | null;

  @Column("date", { name: "tcg_date", nullable: true })
  tcgDate: string | null;

  @Column("decimal", {
    name: "price",
    precision: 10,
    scale: 2,
    default: () => "'0.00'",
  })
  price: string;

  @OneToMany(() => CardSet, (cardSet) => cardSet.set)
  cardSets: CardSet[];

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.set)
  invoiceItems: InvoiceItem[];
}

