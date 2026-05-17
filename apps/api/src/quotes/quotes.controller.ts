import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { BulkImportQuotesDto } from './dto/bulk-import-quotes.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(createQuoteDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('bulk-import')
  bulkImport(
    @Body() bulkImportDto: BulkImportQuotesDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.quotesService.bulkImport(bulkImportDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('topicId') topicId?: string,
    @Query('userId') userId?: string,
    @Query('includePremium') includePremium?: string,
    @Query('seed') seed?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    // Default to true if not specified
    const includePremiumBool = includePremium !== 'false';
    return this.quotesService.findAll(
      pageNum,
      limitNum,
      topicId,
      userId,
      includePremiumBool,
      seed,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.quotesService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quotesService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/like')
  likeQuote(@Param('id') id: string, @Request() req: any) {
    return this.quotesService.likeQuote(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/like')
  unlikeQuote(@Param('id') id: string, @Request() req: any) {
    return this.quotesService.unlikeQuote(id, req.user.userId);
  }
}
