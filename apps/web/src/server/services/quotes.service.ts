import { In } from "typeorm";
import { repo } from "../db";
import { Quote, User } from "../db/entities";
import { notFound } from "../http/errors";

export interface CreateQuoteInput {
  text: string;
  author?: string | null;
  topicId?: string | null;
}

export type UpdateQuoteInput = Partial<CreateQuoteInput>;

export interface BulkImportInput {
  topicId: string;
  quotes: { text: string; author?: string | null }[];
}

export interface FindQuotesInput {
  page?: number;
  limit?: number;
  topicId?: string;
  userId?: string;
  includePremium?: boolean;
  seed?: string;
}

export async function createQuote(input: CreateQuoteInput) {
  const quotes = await repo(Quote);
  const { topicId, ...quoteData } = input;
  const quote = quotes.create({
    ...quoteData,
    ...(topicId && { topic: { id: topicId } }),
  });
  return quotes.save(quote);
}

export async function bulkImportQuotes({ topicId, quotes }: BulkImportInput) {
  const repository = await repo(Quote);
  const quotesToCreate = quotes.map((quoteData) =>
    repository.create({
      text: quoteData.text,
      author: quoteData.author,
      topic: { id: topicId },
    }),
  );

  const savedQuotes = await repository.save(quotesToCreate);

  return {
    message: `Successfully imported ${savedQuotes.length} quotes`,
    count: savedQuotes.length,
    quotes: savedQuotes,
  };
}

/**
 * Among these quotes, the ones whose topic is premium, with the topic loaded.
 * Used after a create or an import to announce new premium content; it runs
 * after the response, so the extra read never delays the admin.
 */
export async function premiumQuotesAmong(ids: string[]): Promise<Quote[]> {
  if (ids.length === 0) return [];
  const quotes = await repo(Quote);
  return quotes.find({
    where: { id: In(ids), topic: { isPremium: true } },
    relations: ["topic"],
  });
}

/**
 * The mobile feed. Returns a plain array (never a paginated envelope), each
 * quote with its topic and an `isLiked` flag for `userId`.
 */
export async function findQuotes({ page, limit, topicId, userId, includePremium = true, seed }: FindQuotesInput) {
  const quotes = await repo(Quote);
  const queryBuilder = quotes.createQueryBuilder("quote").leftJoinAndSelect("quote.topic", "topic");

  // When a seed is provided, sort deterministically by md5(id || seed) so
  // pagination remains consistent within a session while each new session
  // (different seed) returns a fresh shuffle.
  if (seed) {
    queryBuilder
      .addSelect(`md5(quote.id::text || :seed)`, "shuffle_key")
      .orderBy("shuffle_key", "ASC")
      .setParameter("seed", seed);
  } else {
    // Served by IDX_quote_createdAt (AddQueryIndexes migration).
    queryBuilder.orderBy("quote.createdAt", "DESC");
  }

  if (topicId) {
    // Served by IDX_quote_topicId: without it every Topics screen scanned the table.
    queryBuilder.andWhere("topic.id = :topicId", { topicId });
  }

  // Filter out premium quotes if includePremium is false
  if (!includePremium) {
    queryBuilder.andWhere("(topic.isPremium = :isPremium OR topic.isPremium IS NULL)", { isPremium: false });
  }

  if (page && limit) {
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
  }

  const rows = await queryBuilder.getMany();

  // Likes are looked up for this page's quotes only. Loading `likedQuotes`
  // whole brought back a user's entire like history — possibly thousands of
  // rows — to tick ten boxes.
  const likedIds = await likedQuoteIds(
    userId,
    rows.map((quote) => quote.id),
  );

  return rows.map((quote) => ({ ...quote, isLiked: likedIds.has(quote.id) }));
}

/**
 * Which of these quotes the user has liked.
 *
 * One query on the join table, bounded by the requested ids (served by
 * IDX_user_liked_quotes_userId_quoteId): the cost no longer depends on the
 * account's total number of likes.
 */
async function likedQuoteIds(userId: string | undefined, quoteIds: string[]): Promise<Set<string>> {
  if (!userId || quoteIds.length === 0) return new Set();

  const quotes = await repo(Quote);
  const rows: { id: string }[] = await quotes
    .createQueryBuilder("quote")
    .select("quote.id", "id")
    .innerJoin("quote.likedBy", "liker", "liker.id = :userId", { userId })
    .where("quote.id IN (:...quoteIds)", { quoteIds })
    .getRawMany();

  return new Set(rows.map((row) => row.id));
}

/** `null` when the quote does not exist: NestJS answered an empty 200, not a 404. */
export async function findQuote(id: string, userId?: string) {
  const quotes = await repo(Quote);
  const quote = await quotes.findOne({ where: { id }, relations: ["topic"] });
  if (!quote) return null;

  const likedIds = await likedQuoteIds(userId, [quote.id]);
  return { ...quote, isLiked: likedIds.has(quote.id) };
}

export async function updateQuote(id: string, input: UpdateQuoteInput) {
  const quote = await findQuote(id);
  if (!quote) return null;

  const { topicId, ...quoteData } = input;
  Object.assign(quote, quoteData);

  if (topicId !== undefined) {
    quote.topic = topicId ? ({ id: topicId } as Quote["topic"]) : null;
  }

  // Saved as NestJS did, from the spread copy: the response keeps `isLiked`.
  return (await repo(Quote)).save(quote);
}

/** Soft delete; answers TypeORM's UpdateResult, as NestJS did. */
export async function removeQuote(id: string) {
  return (await repo(Quote)).softDelete(id);
}

/**
 * Liking a quote is one row in the join table.
 *
 * The old version loaded the user with all their likes and saved the entity
 * back: TypeORM then diffed the whole collection to produce a single INSERT.
 * The cost of a like grew with the number of likes already given.
 */
export async function likeQuote(quoteId: string, userId: string) {
  const quotes = await repo(Quote);
  if (!(await quotes.existsBy({ id: quoteId }))) {
    throw notFound(`Quote with ID ${quoteId} not found`);
  }
  if (!(await (await repo(User)).existsBy({ id: userId }))) {
    throw notFound(`User with ID ${userId} not found`);
  }

  const alreadyLiked = await likedQuoteIds(userId, [quoteId]);
  if (alreadyLiked.size === 0) {
    await quotes.createQueryBuilder().relation(Quote, "likedBy").of(quoteId).add(userId);
  }

  return { message: "Quote liked successfully", isLiked: true };
}

export async function unlikeQuote(quoteId: string, userId: string) {
  // `remove` is idempotent: removing a missing like deletes no row and needs
  // no distinction from the nominal case.
  await (await repo(Quote)).createQueryBuilder().relation(Quote, "likedBy").of(quoteId).remove(userId);
  return { message: "Quote unliked successfully", isLiked: false };
}
