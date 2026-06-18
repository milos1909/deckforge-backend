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

@Index("fk_invoice_item_invoice_id", ["invoiceId"], {})
@Index("fk_invoice_item_set_id", ["setId"], {})
@Entity("invoice_item", { schema: "yugioh_shop" })
export class InvoiceItem {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "invoice_id", unsigned: true })
  invoiceId: number;

  @Column("int", { name: "set_id", unsigned: true })
  setId: number;

  @Column("int", { name: "price_per_item", unsigned: true })
  pricePerItem: number;

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
  set: Relation<Set>;
}
