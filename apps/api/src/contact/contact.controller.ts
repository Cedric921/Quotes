import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Public endpoint - anyone can send a message
  @Post()
  async create(@Body() dto: CreateContactMessageDto, @Request() req) {
    const userId = req.user?.id;
    return this.contactService.create(dto, userId);
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    if (!req.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }
    return this.contactService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    if (!req.user?.isAdmin) {
      return { count: 0 };
    }
    const count = await this.contactService.getUnreadCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    if (!req.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }
    // Mark as read when viewing
    await this.contactService.markAsRead(id);
    return this.contactService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactMessageDto,
    @Request() req,
  ) {
    if (!req.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }
    return this.contactService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/mark-unread')
  async markAsUnread(@Param('id') id: string, @Request() req) {
    if (!req.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }
    return this.contactService.markAsUnread(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    if (!req.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }
    await this.contactService.remove(id);
    return { success: true };
  }
}

