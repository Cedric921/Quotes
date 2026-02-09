import { DataSource } from 'typeorm';
import { updateTopicsMetadata } from './update-topics.seed';
import { Topic } from '../topics/entities/topic.entity';
import { Quote } from '../quotes/entities/quote.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [Topic, Quote],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected');

    await updateTopicsMetadata(AppDataSource);

    await AppDataSource.destroy();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

run();

