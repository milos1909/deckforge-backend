import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Card } from "./Card";
import { Deck } from "./Deck";

@Index("fk_deck_card_deck_id", ["deckId"], {})
@Index("fk_deck_card_card_id", ["cardId"], {})
@Entity("deck_card", { schema: "deckforge" })
export class DeckCard {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "deck_id", unsigned: true })
  deckId: number;

  @Column("int", { name: "card_id", unsigned: true })
  cardId: number;

  @Column("enum", { name: "type", enum: ["main", "extra", "side"] })
  type: "main" | "extra" | "side";

  @ManyToOne(() => Card, (card) => card.deckCards, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "card_id", referencedColumnName: "id" }])
  card: Relation<Card>;

  @ManyToOne(() => Deck, (deck) => deck.deckCards, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "deck_id", referencedColumnName: "id" }])
  deck: Relation<Deck>;
}
