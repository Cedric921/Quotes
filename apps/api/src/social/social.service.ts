import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialNetwork } from './entities/social-network.entity';
import { CreateSocialNetworkDto } from './dto/create-social-network.dto';
import { UpdateSocialNetworkDto } from './dto/update-social-network.dto';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(SocialNetwork)
    private readonly socialNetworkRepository: Repository<SocialNetwork>,
  ) {}

  async create(dto: CreateSocialNetworkDto): Promise<SocialNetwork> {
    const socialNetwork = this.socialNetworkRepository.create(dto);
    return this.socialNetworkRepository.save(socialNetwork);
  }

  async findAll(): Promise<SocialNetwork[]> {
    return this.socialNetworkRepository.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findAllActive(): Promise<SocialNetwork[]> {
    return this.socialNetworkRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SocialNetwork> {
    const socialNetwork = await this.socialNetworkRepository.findOne({ where: { id } });
    if (!socialNetwork) {
      throw new NotFoundException(`Social network with ID ${id} not found`);
    }
    return socialNetwork;
  }

  async update(id: string, dto: UpdateSocialNetworkDto): Promise<SocialNetwork> {
    const socialNetwork = await this.findOne(id);
    Object.assign(socialNetwork, dto);
    return this.socialNetworkRepository.save(socialNetwork);
  }

  async toggleActive(id: string): Promise<SocialNetwork> {
    const socialNetwork = await this.findOne(id);
    socialNetwork.isActive = !socialNetwork.isActive;
    return this.socialNetworkRepository.save(socialNetwork);
  }

  async remove(id: string): Promise<void> {
    const socialNetwork = await this.findOne(id);
    await this.socialNetworkRepository.softDelete(socialNetwork.id);
  }
}

