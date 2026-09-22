import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { BulkImportQuotesDto } from './dto/bulk-import-quotes.dto';
import { Quote } from './entities/quote.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createQuoteDto: CreateQuoteDto) {
    const { topicId, ...quoteData } = createQuoteDto;
    const quote = this.quotesRepository.create({
      ...quoteData,
      ...(topicId && { topic: { id: topicId } }),
    });
    return this.quotesRepository.save(quote);
  }

  async bulkImport(bulkImportDto: BulkImportQuotesDto) {
    const { topicId, quotes } = bulkImportDto;

    const quotesToCreate = quotes.map((quoteData) =>
      this.quotesRepository.create({
        text: quoteData.text,
        author: quoteData.author,
        topic: { id: topicId },
      }),
    );

    const savedQuotes = await this.quotesRepository.save(quotesToCreate);

    return {
      message: `Successfully imported ${savedQuotes.length} quotes`,
      count: savedQuotes.length,
      quotes: savedQuotes,
    };
  }

  async findAll(
    page?: number,
    limit?: number,
    topicId?: string,
    userId?: string,
    includePremium: boolean = true,
    seed?: string,
  ) {
    const queryBuilder = this.quotesRepository
      .createQueryBuilder('quote')
      .leftJoinAndSelect('quote.topic', 'topic');

    // When a seed is provided, sort deterministically by md5(id || seed) so
    // pagination remains consistent within a session while each new session
    // (different seed) returns a fresh shuffle.
    if (seed) {
      queryBuilder
        .addSelect(`md5(quote.id::text || :seed)`, 'shuffle_key')
        .orderBy('shuffle_key', 'ASC')
        .setParameter('seed', seed);
    } else {
      queryBuilder.orderBy('quote.createdAt', 'DESC');
    }

    if (topicId) {
      queryBuilder.andWhere('topic.id = :topicId', { topicId });
    }

    // Filter out premium quotes if includePremium is false
    if (!includePremium) {
      queryBuilder.andWhere(
        '(topic.isPremium = :isPremium OR topic.isPremium IS NULL)',
        { isPremium: false },
      );
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const quotes = await queryBuilder.getMany();

    // Les favoris ne sont interroges que pour les citations de cette page.
    // Charger `likedQuotes` en entier ramenait tout l'historique de likes d'un
    // utilisateur - potentiellement des milliers de lignes - pour en cocher dix.
    const likedIds = await this.likedQuoteIds(
      userId,
      quotes.map((quote) => quote.id),
    );

    return quotes.map((quote) => ({
      ...quote,
      isLiked: likedIds.has(quote.id),
    }));
  }

  /**
   * Parmi ces citations, lesquelles l'utilisateur a-t-il aimees.
   *
   * Une seule requete sur la table de jonction, bornee aux identifiants
   * demandes : le cout ne depend plus du nombre total de likes du compte.
   */
  private async likedQuoteIds(
    userId: string | undefined,
    quoteIds: string[],
  ): Promise<Set<string>> {
    if (!userId || quoteIds.length === 0) return new Set();

    const rows: { id: string }[] = await this.quotesRepository
      .createQueryBuilder('quote')
      .select('quote.id', 'id')
      .innerJoin('quote.likedBy', 'liker', 'liker.id = :userId', { userId })
      .where('quote.id IN (:...quoteIds)', { quoteIds })
      .getRawMany();

    return new Set(rows.map((row) => row.id));
  }

  async findOne(id: string, userId?: string) {
    const quote = await this.quotesRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!quote) {
      return null;
    }

    const likedIds = await this.likedQuoteIds(userId, [quote.id]);

    return { ...quote, isLiked: likedIds.has(quote.id) };
  }

  async update(id: string, updateQuoteDto: UpdateQuoteDto) {
    const quote = await this.findOne(id);
    if (!quote) return null;

    const { topicId, ...quoteData } = updateQuoteDto as any;
    Object.assign(quote, quoteData);

    if (topicId !== undefined) {
      quote.topic = topicId ? ({ id: topicId } as any) : null;
    }

    return this.quotesRepository.save(quote);
  }

  remove(id: string) {
    return this.quotesRepository.softDelete(id);
  }

  /**
   * Aimer une citation, c'est une ligne dans la table de jonction.
   *
   * L'ancienne version chargeait l'utilisateur avec la totalite de ses favoris
   * puis reenregistrait l'entite : TypeORM comparait alors la collection entiere
   * pour en deduire un unique INSERT. Le cout d'un like grandissait avec le
   * nombre de likes deja poses.
   */
  async likeQuote(quoteId: string, userId: string) {
    const quoteExists = await this.quotesRepository.existsBy({ id: quoteId });
    if (!quoteExists) {
      throw new NotFoundException(`Quote with ID ${quoteId} not found`);
    }

    const userExists = await this.usersRepository.existsBy({ id: userId });
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const alreadyLiked = await this.likedQuoteIds(userId, [quoteId]);
    if (alreadyLiked.size === 0) {
      await this.quotesRepository
        .createQueryBuilder()
        .relation(Quote, 'likedBy')
        .of(quoteId)
        .add(userId);
    }

    return { message: 'Quote liked successfully', isLiked: true };
  }

  async unlikeQuote(quoteId: string, userId: string) {
    // `remove` est idempotent : retirer un like absent ne supprime aucune
    // ligne et n'a pas besoin d'etre distingue du cas nominal.
    await this.quotesRepository
      .createQueryBuilder()
      .relation(Quote, 'likedBy')
      .of(quoteId)
      .remove(userId);

    return { message: 'Quote unliked successfully', isLiked: false };
  }
}
