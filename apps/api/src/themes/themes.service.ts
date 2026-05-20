import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Theme } from './entities/theme.entity';
import { CreateThemeDto, UpdateThemeDto } from './dto';
import {
  CloudinaryService,
  CloudinaryUploadResult,
} from './cloudinary.service';

const MAX_ACTIVE_THEMES = 10;

@Injectable()
export class ThemesService {
  constructor(
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createThemeDto: CreateThemeDto,
    file: Express.Multer.File,
  ): Promise<Theme> {
    // Upload image to Cloudinary
    const uploadResult: CloudinaryUploadResult =
      await this.cloudinaryService.uploadImage(file, 'themes');

    // Check active themes count if this one is active
    if (createThemeDto.isActive !== false) {
      const activeCount = await this.themeRepository.count({
        where: { isActive: true },
      });
      if (activeCount >= MAX_ACTIVE_THEMES) {
        // Delete uploaded image since we can't create the theme
        await this.cloudinaryService.deleteImage(uploadResult.publicId);
        throw new BadRequestException(
          `Maximum ${MAX_ACTIVE_THEMES} active themes allowed. Please deactivate one first.`,
        );
      }
    }

    const theme = this.themeRepository.create({
      ...createThemeDto,
      imageUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      cloudinaryPublicId: uploadResult.publicId,
    });

    return this.themeRepository.save(theme);
  }

  async findAll(): Promise<Theme[]> {
    return this.themeRepository.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Theme[]> {
    return this.themeRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
      take: MAX_ACTIVE_THEMES,
    });
  }

  async findOne(id: string): Promise<Theme> {
    const theme = await this.themeRepository.findOne({ where: { id } });
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }
    return theme;
  }

  async update(
    id: string,
    updateThemeDto: UpdateThemeDto,
    file?: Express.Multer.File,
  ): Promise<Theme> {
    const theme = await this.findOne(id);

    // Check active themes count if activating this theme
    if (updateThemeDto.isActive === true && !theme.isActive) {
      const activeCount = await this.themeRepository.count({
        where: { isActive: true },
      });
      if (activeCount >= MAX_ACTIVE_THEMES) {
        throw new BadRequestException(
          `Maximum ${MAX_ACTIVE_THEMES} active themes allowed. Please deactivate one first.`,
        );
      }
    }

    // Handle image update
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'themes',
      );

      // Delete old image
      if (theme.cloudinaryPublicId) {
        await this.cloudinaryService.deleteImage(theme.cloudinaryPublicId);
      }

      theme.imageUrl = uploadResult.url;
      theme.thumbnailUrl = uploadResult.thumbnailUrl;
      theme.cloudinaryPublicId = uploadResult.publicId;
    }

    Object.assign(theme, updateThemeDto);
    return this.themeRepository.save(theme);
  }

  async remove(id: string): Promise<void> {
    const theme = await this.findOne(id);

    // Delete image from Cloudinary
    if (theme.cloudinaryPublicId) {
      await this.cloudinaryService.deleteImage(theme.cloudinaryPublicId);
    }

    await this.themeRepository.remove(theme);
  }

  async toggleActive(id: string): Promise<Theme> {
    const theme = await this.findOne(id);

    if (!theme.isActive) {
      // Activating - check limit
      const activeCount = await this.themeRepository.count({
        where: { isActive: true },
      });
      if (activeCount >= MAX_ACTIVE_THEMES) {
        throw new BadRequestException(
          `Maximum ${MAX_ACTIVE_THEMES} active themes allowed. Please deactivate one first.`,
        );
      }
    }

    theme.isActive = !theme.isActive;
    return this.themeRepository.save(theme);
  }

  async reorder(themeIds: string[]): Promise<Theme[]> {
    const themes = await Promise.all(
      themeIds.map(async (id, index) => {
        const theme = await this.findOne(id);
        theme.order = index;
        return this.themeRepository.save(theme);
      }),
    );
    return themes;
  }

  // Returns the theme marked as default (mobile uses this on first launch).
  // Falls back to the first active theme when no default is set.
  async findDefault(): Promise<Theme | null> {
    const def = await this.themeRepository.findOne({
      where: { isDefault: true, isActive: true },
    });
    if (def) return def;
    return this.themeRepository.findOne({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  // Exclusive default: marks one theme as default and clears the flag on all
  // others. The theme must be active to be set as default.
  async setDefault(id: string): Promise<Theme> {
    const theme = await this.findOne(id);
    if (!theme.isActive) {
      throw new BadRequestException(
        'Only active themes can be set as the default.',
      );
    }
    await this.themeRepository.update(
      { isDefault: true },
      { isDefault: false },
    );
    theme.isDefault = true;
    return this.themeRepository.save(theme);
  }
}
