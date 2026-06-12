import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { User } from '../users/entities/user.entity';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from './dto/promo-code.dto';

@Injectable()
export class PromoCodeService {
  constructor(
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreatePromoCodeDto): Promise<PromoCode> {
    // Check if code already exists
    const existing = await this.promoCodeRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('Promo code already exists');
    }

    const promoCode = this.promoCodeRepository.create({
      ...dto,
      expirationDate: new Date(dto.expirationDate),
    });
    return this.promoCodeRepository.save(promoCode);
  }

  async findAll(): Promise<PromoCode[]> {
    return this.promoCodeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { id },
    });
    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }
    return promoCode;
  }

  async findByCode(code: string): Promise<PromoCode | null> {
    return this.promoCodeRepository.findOne({ where: { code } });
  }

  async update(id: string, dto: UpdatePromoCodeDto): Promise<PromoCode> {
    const promoCode = await this.findOne(id);
    
    if (dto.expirationDate) {
      promoCode.expirationDate = new Date(dto.expirationDate);
    }
    if (dto.durationDays !== undefined) {
      promoCode.durationDays = dto.durationDays;
    }
    if (dto.description !== undefined) {
      promoCode.description = dto.description;
    }

    return this.promoCodeRepository.save(promoCode);
  }

  async delete(id: string): Promise<void> {
    const promoCode = await this.findOne(id);
    await this.promoCodeRepository.remove(promoCode);
  }

  async getUsersByPromoCode(code: string): Promise<User[]> {
    return this.userRepository.find({
      where: { usedPromoCode: code },
      select: ['id', 'email', 'name', 'createdAt', 'isSubscribed', 'subscriptionEndDate'],
      order: { createdAt: 'DESC' },
    });
  }

  async incrementUsageCount(code: string): Promise<void> {
    await this.promoCodeRepository.increment({ code }, 'usageCount', 1);
  }

  async validatePromoCode(code: string): Promise<PromoCode> {
    const promoCode = await this.findByCode(code);
    
    if (!promoCode) {
      throw new NotFoundException('Invalid promo code');
    }

    if (!promoCode.isActive) {
      throw new BadRequestException('This promo code is no longer active');
    }

    const now = new Date();
    if (new Date(promoCode.expirationDate) < now) {
      throw new BadRequestException('This promo code has expired');
    }

    return promoCode;
  }
}
