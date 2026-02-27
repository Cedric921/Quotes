import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Font } from './entities/font.entity';
import { CreateFontDto, UpdateFontDto } from './dto';

const MAX_ACTIVE_FONTS = 10;

@Injectable()
export class FontsService {
  constructor(
    @InjectRepository(Font)
    private readonly fontRepository: Repository<Font>,
  ) {}

  async create(createFontDto: CreateFontDto): Promise<Font> {
    // Check active fonts count if this one is active
    if (createFontDto.isActive !== false) {
      const activeCount = await this.fontRepository.count({
        where: { isActive: true },
      });
      if (activeCount >= MAX_ACTIVE_FONTS) {
        throw new BadRequestException(
          `Maximum ${MAX_ACTIVE_FONTS} active fonts allowed. Please deactivate one first.`,
        );
      }
    }

    const font = this.fontRepository.create(createFontDto);
    return this.fontRepository.save(font);
  }

  async findAll(): Promise<Font[]> {
    return this.fontRepository.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Font[]> {
    return this.fontRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
      take: MAX_ACTIVE_FONTS,
    });
  }

  async findOne(id: string): Promise<Font> {
    const font = await this.fontRepository.findOne({ where: { id } });
    if (!font) {
      throw new NotFoundException(`Font with ID ${id} not found`);
    }
    return font;
  }

  async update(id: string, updateFontDto: UpdateFontDto): Promise<Font> {
    const font = await this.findOne(id);

    // Check active fonts count if activating this font
    if (updateFontDto.isActive === true && !font.isActive) {
      const activeCount = await this.fontRepository.count({
        where: { isActive: true },
      });
      if (activeCount >= MAX_ACTIVE_FONTS) {
        throw new BadRequestException(
          `Maximum ${MAX_ACTIVE_FONTS} active fonts allowed. Please deactivate one first.`,
        );
      }
    }

    Object.assign(font, updateFontDto);
    return this.fontRepository.save(font);
  }

  async remove(id: string): Promise<void> {
    const font = await this.findOne(id);
    await this.fontRepository.remove(font);
  }

  async toggleActive(id: string): Promise<Font> {
    const font = await this.findOne(id);

    if (!font.isActive) {
      // Activating - check limit
      const activeCount = await this.fontRepository.count({
        where: { isActive: true },
      });
      if (activeCount >= MAX_ACTIVE_FONTS) {
        throw new BadRequestException(
          `Maximum ${MAX_ACTIVE_FONTS} active fonts allowed. Please deactivate one first.`,
        );
      }
    }

    font.isActive = !font.isActive;
    return this.fontRepository.save(font);
  }

  async reorder(fontIds: string[]): Promise<Font[]> {
    const fonts = await Promise.all(
      fontIds.map(async (id, index) => {
        const font = await this.findOne(id);
        font.order = index;
        return this.fontRepository.save(font);
      }),
    );
    return fonts;
  }
}

