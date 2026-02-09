import { DataSource } from 'typeorm';
import { Topic } from '../topics/entities/topic.entity';

// Mapping des topics avec leurs métadonnées
const topicMetadata: Record<
  string,
  {
    title: string;
    icon: string;
    color: string;
    isPremium: boolean;
  }
> = {
  Motivation: {
    title: 'Motivation',
    icon: 'flame',
    color: '#f093fb',
    isPremium: false,
  },
  Success: {
    title: 'Success',
    icon: 'trophy',
    color: '#4facfe',
    isPremium: false,
  },
  Wisdom: {
    title: 'Wisdom',
    icon: 'bulb',
    color: '#43e97b',
    isPremium: false,
  },
  Love: {
    title: 'Love',
    icon: 'heart',
    color: '#fa709a',
    isPremium: true,
  },
  Life: {
    title: 'Life',
    icon: 'leaf',
    color: '#30cfd0',
    isPremium: false,
  },
  Happiness: {
    title: 'Happiness',
    icon: 'happy',
    color: '#a8edea',
    isPremium: false,
  },
  Inspiration: {
    title: 'Inspiration',
    icon: 'sparkles',
    color: '#ff9a9e',
    isPremium: false,
  },
  Mindfulness: {
    title: 'Mindfulness',
    icon: 'flower',
    color: '#ffecd2',
    isPremium: true,
  },
  Growth: {
    title: 'Growth',
    icon: 'trending-up',
    color: '#ff6e7f',
    isPremium: false,
  },
  Courage: {
    title: 'Courage',
    icon: 'shield',
    color: '#fa709a',
    isPremium: true,
  },
};

export async function updateTopicsMetadata(dataSource: DataSource) {
  const topicRepository = dataSource.getRepository(Topic);

  console.log('🌱 Updating topics metadata...');

  for (const [name, metadata] of Object.entries(topicMetadata)) {
    // Find all topics with this name
    const topics = await topicRepository.find({ where: { name } });

    if (topics.length > 0) {
      for (const topic of topics) {
        topic.title = metadata.title;
        topic.icon = metadata.icon;
        topic.color = metadata.color;
        topic.isPremium = metadata.isPremium;

        await topicRepository.save(topic);
      }
      console.log(`✅ Updated ${topics.length} topic(s): ${name}`);
    } else {
      console.log(`⚠️  Topic not found: ${name}`);
    }
  }

  console.log('✨ Topics metadata updated successfully!');
}
