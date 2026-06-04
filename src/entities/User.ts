import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Invoice } from "./Invoice";

@Index("uq_user_email", ["email"], { unique: true })
@Index("uq_user_username", ["username"], { unique: true })
@Entity("user", { schema: "yugioh_shop" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "username", unique: true, length: 255 })
  username: string;

  @Column("varchar", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("int", { name: "email_code", nullable: true })
  emailCode: number | null;

  @Column("varchar", { name: "password", length: 255 })
  password: string;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("datetime", { name: "verified_at", nullable: true })
  verifiedAt: Date | null;

  @Column("datetime", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];
}
