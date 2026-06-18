import { Column, Entity, OneToMany } from "typeorm";
import { CardSet } from "./CardSet";
import { Deck } from "./Deck";
import { DeckCard } from "./DeckCard";

@Entity("card", { schema: "yugioh_shop" })
export class Card {
  @Column("int", { primary: true, name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("varchar", { name: "type", length: 50 })
  type: string;

  @Column("text", { name: "description" })
  description: string;

  @Column("int", { name: "atk", nullable: true })
  atk: number | null;

  @Column("int", { name: "def", nullable: true })
  def: number | null;

  @Column("int", { name: "level", nullable: true })
  level: number | null;

  @Column("varchar", { name: "race", length: 50 })
  race: string;

  @Column("varchar", { name: "attribute", nullable: true, length: 50 })
  attribute: string | null;

  @Column("varchar", { name: "archetype", nullable: true, length: 100 })
  archetype: string | null;

  @Column("int", { name: "scale", nullable: true })
  scale: number | null;

  @Column("int", { name: "linkval", nullable: true })
  linkval: number | null;

  @Column("date", { name: "tcg_date", nullable: true })
  tcgDate: string | null;

  @Column("decimal", {
    name: "cardmarket_price",
    nullable: true,
    precision: 10,
    scale: 2,
  })
  cardmarketPrice: string | null;

  @OneToMany(() => CardSet, (cardSet) => cardSet.card)
  cardSets: CardSet[];

  @OneToMany(() => Deck, (deck) => deck.coverCard)
  decks: Deck[];

  @OneToMany(() => DeckCard, (deckCard) => deckCard.card)
  deckCards: DeckCard[];
}
