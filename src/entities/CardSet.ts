import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Card } from "./Card";
import { Set } from "./Set";

@Index("uq_card_set", ["cardId", "setId", "setRarity"], { unique: true })
@Index("fk_card_set_set_id", ["setId"], {})
@Entity("card_set", { schema: "yugioh_shop" })
export class CardSet {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "card_id", unsigned: true })
  cardId: number;

  @Column("int", { name: "set_id", unsigned: true })
  setId: number;

  @Column("varchar", { name: "set_rarity", nullable: true, length: 100 })
  setRarity: string | null;

  @Column("varchar", { name: "set_rarity_code", nullable: true, length: 50 })
  setRarityCode: string | null;

  @ManyToOne(() => Card, (card) => card.cardSets, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "card_id", referencedColumnName: "id" }])
  card: Card;

  @ManyToOne(() => Set, (set) => set.cardSets, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "set_id", referencedColumnName: "id" }])
  set: Relation<Set>;
}
