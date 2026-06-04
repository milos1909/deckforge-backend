import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { InvoiceItem } from "./InvoiceItem";

@Index("fk_invoice_user_id", ["userId"], {})
@Entity("invoice", { schema: "yugioh_shop" })
export class Invoice {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;

  @Column("varchar", { name: "purs_id", nullable: true, length: 255 })
  pursId: string | null;

  @Column("datetime", { name: "purs_time", nullable: true })
  pursTime: Date | null;

  @Column("varchar", { name: "purs_counter", nullable: true, length: 255 })
  pursCounter: string | null;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.invoices, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice)
  invoiceItems: InvoiceItem[];
}
