import { AppDataSource } from "../db";
import { Deck } from "../entities/Deck";
import { DeckCard } from "../entities/DeckCard";

const deckRepo = AppDataSource.getRepository(Deck);
const deckCardRepo = AppDataSource.getRepository(DeckCard);

type DeckCardInput = {
  id: number;
  type: "main" | "extra" | "side";
};

type DeckInput = {
  name: string;
  cards: DeckCardInput[];
};

export class DeckService {
  static async create(obj: DeckInput, userId: number) {
    return await AppDataSource.transaction(async (manager) => {
      const deck = new Deck();
      
      deck.name = obj.name;
      deck.userId = userId;

      const savedDeck = await manager.save(deck);

      const deckCards = obj.cards.map((card) => {
        const deckCard = new DeckCard();
        deckCard.deckId = savedDeck.id;
        deckCard.cardId = card.id;
        deckCard.type = card.type;

        return deckCard;
      });

      await manager.save(DeckCard, deckCards);

      return savedDeck;
    });
  }

  static async update(id: number, userId: number, obj: DeckInput) {
    return await AppDataSource.transaction(async (manager) => {
      const deck = await manager.findOneBy(Deck, { 
        id,
        userId
      });

      if (deck == null) {
        throw new Error("NOT_FOUND");
      }

      deck.name = obj.name;
      await manager.save(deck);

      await manager.delete(DeckCard, {
        deckId: id,
      });

      const deckCards = obj.cards.map((card) => {
        const deckCard = new DeckCard();
        deckCard.deckId = id;
        deckCard.cardId = card.id;
        deckCard.type = card.type;

        return deckCard;
      });

      await manager.save(DeckCard, deckCards);

      return deck;
    });
  }
}