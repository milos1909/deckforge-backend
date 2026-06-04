import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InvoiceItem } from "./InvoiceItem";

@Entity("set", { schema: "yugioh_shop" })
export class Set {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "set_code", nullable: true, length: 50 })
  set_code: string | null;

  @Column("varchar", { name: "set_name", nullable: true, length: 255 })
  set_name: string | null;

  @Column("int", { name: "num_of_cards", nullable: true })
  num_of_cards: number | null;

  @Column("date", { name: "tcg_date", nullable: true })
  tcg_date: string | null;

  @Column("decimal", { name: "price", precision: 10, scale: 2, default: 0.0,})
  set_price: string;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.set)
  invoiceItems: InvoiceItem[];
}
