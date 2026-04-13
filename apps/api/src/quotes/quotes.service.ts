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
  ) {
    const queryBuilder = this.quotesRepository
      .createQueryBuilder('quote')
      .leftJoinAndSelect('quote.topic', 'topic')
      .orderBy('quote.createdAt', 'DESC');

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

    // If userId is provided, check which quotes are liked by this user
    if (userId) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['likedQuotes'],
      });

      if (user) {
        const likedQuoteIds = new Set(
          user.likedQuotes.map((quote) => quote.id),
        );
        return quotes.map((quote) => ({
          ...quote,
          isLiked: likedQuoteIds.has(quote.id),
        }));
      }
    }

    return quotes.map((quote) => ({ ...quote, isLiked: false }));
  }

  async findOne(id: string, userId?: string) {
    const quote = await this.quotesRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!quote) {
      return null;
    }

    // If userId is provided, check if this quote is liked by the user
    if (userId) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['likedQuotes'],
      });

      if (user) {
        const isLiked = user.likedQuotes.some((q) => q.id === quote.id);
        return { ...quote, isLiked };
      }
    }

    return { ...quote, isLiked: false };
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

  async likeQuote(quoteId: string, userId: string) {
    const quote = await this.quotesRepository.findOne({
      where: { id: quoteId },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${quoteId} not found`);
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['likedQuotes'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if already liked
    const alreadyLiked = user.likedQuotes.some((q) => q.id === quoteId);

    if (!alreadyLiked) {
      user.likedQuotes.push(quote);
      await this.usersRepository.save(user);
    }

    return { message: 'Quote liked successfully', isLiked: true };
  }

  async unlikeQuote(quoteId: string, userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['likedQuotes'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Remove the quote from likedQuotes
    user.likedQuotes = user.likedQuotes.filter((q) => q.id !== quoteId);
    await this.usersRepository.save(user);

    return { message: 'Quote unliked successfully', isLiked: false };
  }
}
