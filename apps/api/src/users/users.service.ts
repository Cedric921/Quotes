import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const { password, ...rest } = createUserDto;
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const user = this.usersRepository.create({
      ...rest,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['likedQuotes'],
    });

    if (!user) return null;

    // Return user with likedQuotesCount
    const { likedQuotes, password, ...userWithoutPassword } = user as any;
    return {
      ...userWithoutPassword,
      likedQuotesCount: likedQuotes?.length || 0,
    };
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['likedQuotes'],
    });

    if (!user) return null;

    // Return user with likedQuotesCount
    const { likedQuotes, ...userWithoutLikedQuotes } = user as any;
    return {
      ...userWithoutLikedQuotes,
      likedQuotesCount: likedQuotes?.length || 0,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) return null;

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }
}
