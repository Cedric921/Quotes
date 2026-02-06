import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quote } from './entities/quote.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
  ) {}

  async create(createQuoteDto: CreateQuoteDto) {
    const { topicId, ...quoteData } = createQuoteDto;
    const quote = this.quotesRepository.create({
      ...quoteData,
      ...(topicId && { topic: { id: topicId } }),
    });
    return this.quotesRepository.save(quote);
  }

  findAll(page?: number, limit?: number) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      return this.quotesRepository.find({
        relations: ['topic'],
        skip,
        take: limit,
        order: { id: 'DESC' },
      });
    }
    return this.quotesRepository.find({
      relations: ['topic'],
      order: { id: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.quotesRepository.findOne({
      where: { id },
      relations: ['topic'],
    });
  }

  async update(id: number, updateQuoteDto: UpdateQuoteDto) {
    const quote = await this.findOne(id);
    if (!quote) return null;

    const { topicId, ...quoteData } = updateQuoteDto as any;
    Object.assign(quote, quoteData);

    if (topicId !== undefined) {
      quote.topic = topicId ? { id: topicId } as any : null;
    }

    return this.quotesRepository.save(quote);
  }

  remove(id: number) {
    return this.quotesRepository.softDelete(id);
  }
}
