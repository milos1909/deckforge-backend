import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Invoice } from "./Invoice";
import { Set } from "./Set";
import { Card } from "./Card";

@Index("fk_invoice_item_invoice_id", ["invoiceId"], {})
@Index("fk_invoice_item_set_id", ["setId"], {})
@Index("fk_invoice_item_card_id", ["cardId"], {})
@Entity("invoice_item", { schema: "deckforge" })
export class InvoiceItem {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "invoice_id", unsigned: true })
  invoiceId: number;

  @Column("enum", { name: "item_type", enum: ["set", "card"] })
  itemType: "set" | "card";

  @Column("int", { name: "set_id", unsigned: true, nullable: true })
  setId: number | null;

  @Column("int", { name: "card_id", unsigned: true, nullable: true })
  cardId: number | null;

  @Column("decimal", { name: "price_per_item", precision: 10, scale: 2 })
  pricePerItem: string;

  @Column("int", { name: "count", unsigned: true })
  count: number;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("datetime", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @Column("datetime", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Invoice, (invoice) => invoice.invoiceItems, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "invoice_id", referencedColumnName: "id" }])
  invoice: Relation<Invoice>;

  @ManyToOne(() => Set, (set) => set.invoiceItems, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "set_id", referencedColumnName: "id" }])
  set: Relation<Set> | null;

  @ManyToOne(() => Card, (card) => card.invoiceItems, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "card_id", referencedColumnName: "id" }])
  card: Relation<Card> | null;
}
