import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Card } from "./Card"
import { User } from "./User"
import { DeckCard } from "./DeckCard";

@Index("fk_deck_user_id", ["userId"], {})
@Index("fk_deck_cover_card_id", ["coverCardId"], {})
@Entity("deck", { schema: "yugioh_shop" })
export class Deck {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;

  @Column("int", { name: "cover_card_id", nullable: true, unsigned: true })
  coverCardId: number | null;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("datetime", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @Column("tinyint", {
    name: "is_public",
    unsigned: true,
    default: () => "'0'",
  })
  isPublic: number;

  @ManyToOne(() => Card, (card) => card.decks, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "cover_card_id", referencedColumnName: "id" }])
  coverCard: Relation<Card>;

  @ManyToOne(() => User, (user) => user.decks, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @OneToMany(() => DeckCard, (deckCard) => deckCard.deck)
  deckCards: DeckCard[];
}
