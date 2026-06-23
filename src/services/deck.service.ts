import { In, type EntityManager } from "typeorm";
import { AppDataSource } from "../db";
import { Deck } from "../entities/Deck";
import { DeckCard } from "../entities/DeckCard";
import { Card } from "../entities/Card";
import { AppError } from "../errors/app.error";
import { ImageService } from "./image.service";

const deckRepo = AppDataSource.getRepository(Deck)
const deckCardRepo = AppDataSource.getRepository(DeckCard)

type DeckCardInput = {
  id: number;
  type: "main" | "extra" | "side";
};

type DeckInput = {
  name: string
  cards: DeckCardInput[]
};

const DECK_TYPES = ['meta', 'rogue', 'casual', 'anime'] as const
type DeckType = typeof DECK_TYPES[number]

type DeckMetadataInput = {
  name?: string 
  description?: string | null
  coverCardId?: number | null
  isPublic?: boolean
  type?: DeckType
}

function validateDeckLimits(cards: DeckCardInput[]) {
  const main = cards.filter(card => card.type === 'main').length
  const extra = cards.filter(card => card.type === 'extra').length
  const side = cards.filter(card => card.type === 'side').length

  if (main > 60) throw new AppError(400, 'MAIN_DECK_LIMIT')
  if (extra > 15) throw new AppError(400, 'EXTRA_DECK_LIMIT')
  if (side > 15) throw new AppError(400, 'SIDE_DECK_LIMIT')
}

function validateCopyLimit(cards: DeckCardInput[]) {
  const copies = new Map<number, number>()

  for (const card of cards) {
    const count = (copies.get(card.id) ?? 0) + 1

    if (count > 3) {
      throw new AppError(400, 'COPY_LIMIT')
    }

    copies.set(card.id, count)
  }
}

async function validateCards(manager: EntityManager, cards: DeckCardInput[]) {
  const ids = [...new Set(cards.map(card => card.id))]

  if (ids.length === 0) return

  const existingCards = await manager.find(Card, {
    select: {
      id: true,
      type: true
    },
    where: {
      id: In(ids)
    }
  })

  if (existingCards.length !== ids.length) {
    throw new AppError(400, 'CARD_NOT_FOUND')
  }

  const cardMap = new Map(
    existingCards.map(card => [card.id, card.type])
  )

  for (const input of cards) {
    const cardType = cardMap.get(input.id)!.toUpperCase()

    const isExtraCard = ['FUSION', 'SYNCHRO', 'XYZ', 'LINK']
      .some(type => cardType.includes(type))

    if (input.type === 'extra' && !isExtraCard) {
      throw new AppError(400, 'INVALID_EXTRA_DECK_CARD')
    }

    if (input.type === 'main' && isExtraCard) {
      throw new AppError(400, 'EXTRA_CARD_IN_MAIN_DECK')
    }
  }
}

async function validateDeckCards(manager: EntityManager, cards: DeckCardInput[]) {
  validateDeckLimits(cards)
  validateCopyLimit(cards)
  await validateCards(manager, cards)
}


export class DeckService {
  static async getDecks(name: string, sortBy: string, limit: number, offset: number) {
    const qb = deckRepo
      .createQueryBuilder("deck")
      .where("deck.isPublic = :isPublic", { isPublic: 1 });

    if (name) {
      qb.andWhere(
        "(deck.name LIKE :name OR deck.description LIKE :name)",
        { name: `%${name}%` }
      );
    }

    switch (sortBy) {
      case "viewCount":
        qb.orderBy("deck.viewCount", "DESC");
        break;

      case "createdAt":
      default:
        qb.orderBy("deck.createdAt", "DESC");
        break;
    }

    qb.take(limit).skip(offset);

    const [decks, total] = await qb.getManyAndCount();

    return { decks, total };
  }

  static async getDeckById(id: number, requestingUserId?: number) {
    const deck = await deckRepo.findOne({
      where: {
        id
      },
      relations: {
        user: true,
        deckCards: {
          card: true
        }
      },
      select: {
        id: true,
        coverCardId: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        type: true,
        viewCount: true,

        user: {
          id: true,
          username: true
        },

        deckCards: true
      }
    })

    if (deck == null) {
      throw new AppError(404, "NOT_FOUND")
    }

    const isOwner = deck.user.id === requestingUserId

    if (!deck.isPublic && !isOwner) {
      throw new AppError(404, 'NOT_FOUND')
    }

    if (!isOwner) {
      await deckRepo.increment({ id: deck.id }, "viewCount", 1);
      deck.viewCount++
    }
    
    return {
      deck,
      canEdit: isOwner
    }
  }

  static async create(obj: DeckInput, userId: number) {
    return await AppDataSource.transaction(async (manager) => {
      await validateDeckCards(manager, obj.cards)
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

      if (deckCards.length > 0) {
        await manager.save(DeckCard, deckCards)
      }

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
        throw new AppError(404, "NOT_FOUND");
      }

      await validateDeckCards(manager, obj.cards)

      await manager.delete(DeckCard, {
        deckId: id,
      });

      const deckCards = obj.cards.map((card) => {
        const deckCard = new DeckCard()
        deckCard.deckId = id;
        deckCard.cardId = card.id;
        deckCard.type = card.type;

        return deckCard;
      });

      if (deckCards.length > 0) {
        await manager.save(DeckCard, deckCards)
      }

      deck.name = obj.name;
      deck.updatedAt = new Date()
      await manager.save(deck);

      return deck;
    });
  }

  static async updateMetadata(id: number, userId: number, obj: DeckMetadataInput) {
    const deck = await deckRepo.findOneBy({ 
        id,
        userId
    });

    if (deck == null) {
        throw new AppError(404, "NOT_FOUND");
    }

    if (obj.name !== undefined) {
      const name = obj.name.trim()
      if (!name) {
        throw new AppError(400, 'INVALID_DECK_NAME')
      }
      deck.name = name
    }
    if (obj.description !== undefined) {
      deck.description = obj.description?.trim() || null
    }

    if (obj.coverCardId !== undefined) {
      if (obj.coverCardId === null) {
        deck.coverCardId = null
      } else {
      const belongsToDeck = await deckCardRepo.existsBy({
        deckId: deck.id,
        cardId: obj.coverCardId
      })

      if (!belongsToDeck) {
        throw new AppError(400, 'COVER_CARD_NOT_IN_DECK')
      }

      if (obj.coverCardId !== deck.coverCardId) {       
        await ImageService.ensureCroppedCardImage(obj.coverCardId)  
        deck.coverCardId = obj.coverCardId
      }
    }}

    if (obj.isPublic !== undefined) {
      deck.isPublic = obj.isPublic ? 1 : 0
    }

    if (obj.type !== undefined) {
      if (!DECK_TYPES.includes(obj.type)) {
        throw new AppError(400, 'INVALID_DECK_TYPE')
      }

      if (obj.type !== deck.type) {
        deck.type = obj.type
      }
    }
    
    await deckRepo.save(deck)

    return deck
  }
}