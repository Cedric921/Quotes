import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from './entities/topic.entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
  ) {}

  create(createTopicDto: CreateTopicDto) {
    const topic = this.topicsRepository.create(createTopicDto);
    return this.topicsRepository.save(topic);
  }

  findAll() {
    return this.topicsRepository.find();
  }

  findOne(id: number) {
    return this.topicsRepository.findOneBy({ id });
  }

  async update(id: number, updateTopicDto: UpdateTopicDto) {
    const topic = await this.findOne(id);
    if (!topic) return null;
    Object.assign(topic, updateTopicDto);
    return this.topicsRepository.save(topic);
  }

  remove(id: number) {
    return this.topicsRepository.softDelete(id);
  }
}
