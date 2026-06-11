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
import { DeckCard } from "./DeckCard";

@Index("fk_deck_user_id", ["userId"], {})
@Entity("deck", { schema: "yugioh_shop" })
export class Deck {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;

  @Column("varchar", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @ManyToOne(() => User, (user) => user.decks, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @OneToMany(() => DeckCard, (deckCard) => deckCard.deck)
  deckCards: DeckCard[];
}
