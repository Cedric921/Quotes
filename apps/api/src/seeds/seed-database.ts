import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file
config({ path: resolve(__dirname, '../../.env') });

import { Topic } from '../topics/entities/topic.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { User } from '../users/entities/user.entity';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Font } from '../fonts/entities/font.entity';
import * as bcrypt from 'bcrypt';
import { getDatabaseConfig } from '../config/database.config';

// Topics data
const topicsData = [
  {
    name: 'Motivation',
    title: 'Motivation',
    description: 'Inspiring quotes to boost your motivation',
    icon: 'flame',
    color: '#f093fb',
    isPremium: false,
  },
  {
    name: 'Success',
    title: 'Success',
    description: 'Wisdom about achieving success',
    icon: 'trophy',
    color: '#4facfe',
    isPremium: false,
  },
  {
    name: 'Wisdom',
    title: 'Wisdom',
    description: 'Timeless wisdom from great thinkers',
    icon: 'bulb',
    color: '#43e97b',
    isPremium: false,
  },
  {
    name: 'Love',
    title: 'Love',
    description: 'Beautiful quotes about love',
    icon: 'heart',
    color: '#fa709a',
    isPremium: true,
  },
  {
    name: 'Life',
    title: 'Life',
    description: 'Reflections on life and happiness',
    icon: 'leaf',
    color: '#30cfd0',
    isPremium: false,
  },
  {
    name: 'Happiness',
    title: 'Happiness',
    description: 'Quotes about joy and happiness',
    icon: 'happy',
    color: '#a8edea',
    isPremium: false,
  },
  {
    name: 'Inspiration',
    title: 'Inspiration',
    description: 'Inspiring thoughts',
    icon: 'sparkles',
    color: '#ff9a9e',
    isPremium: false,
  },
  {
    name: 'Mindfulness',
    title: 'Mindfulness',
    description: 'Quotes about mindfulness and peace',
    icon: 'flower',
    color: '#ffecd2',
    isPremium: true,
  },
  {
    name: 'Growth',
    title: 'Growth',
    description: 'Personal growth and development',
    icon: 'trending-up',
    color: '#ff6e7f',
    isPremium: false,
  },
  {
    name: 'Courage',
    title: 'Courage',
    description: 'Quotes about bravery',
    icon: 'shield',
    color: '#fa709a',
    isPremium: true,
  },
];

// Sample quotes
const quotesData = [
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    topic: 'Motivation',
  },
  {
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    topic: 'Success',
  },
  {
    text: 'The only true wisdom is in knowing you know nothing.',
    author: 'Socrates',
    topic: 'Wisdom',
  },
  {
    text: 'Love all, trust a few, do wrong to none.',
    author: 'William Shakespeare',
    topic: 'Love',
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: 'John Lennon',
    topic: 'Life',
  },
  {
    text: 'Happiness is not something ready made. It comes from your own actions.',
    author: 'Dalai Lama',
    topic: 'Happiness',
  },
  {
    text: 'The best way to predict the future is to create it.',
    author: 'Peter Drucker',
    topic: 'Inspiration',
  },
  {
    text: 'Be present in all things and thankful for all things.',
    author: 'Maya Angelou',
    topic: 'Mindfulness',
  },
  {
    text: 'Growth is painful. Change is painful. But nothing is as painful as staying stuck.',
    author: 'Mandy Hale',
    topic: 'Growth',
  },
  {
    text: 'Courage is not the absence of fear, but rather the judgment that something else is more important.',
    author: 'Ambrose Redmoon',
    topic: 'Courage',
  },
  {
    text: "Believe you can and you're halfway there.",
    author: 'Theodore Roosevelt',
    topic: 'Motivation',
  },
  {
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
    topic: 'Success',
  },
  {
    text: 'In the middle of difficulty lies opportunity.',
    author: 'Albert Einstein',
    topic: 'Wisdom',
  },
  {
    text: 'Where there is love there is life.',
    author: 'Mahatma Gandhi',
    topic: 'Love',
  },
  {
    text: 'The purpose of our lives is to be happy.',
    author: 'Dalai Lama',
    topic: 'Life',
  },
];

// Subscription plans (simplified - no PlanType enum)
const plansData = [
  {
    name: 'Monthly',
    description: 'Monthly premium subscription',
    price: 4.99,
    durationMonths: 1,
    isActive: true,
  },
  {
    name: 'Yearly',
    description: 'Yearly premium subscription - Save 40%',
    price: 35.99,
    durationMonths: 12,
    isActive: true,
  },
];

// Fonts data - Using system fonts available on iOS/Android
const fontsData = [
  {
    name: 'System Default',
    fontFamily: 'System',
    description: 'Clean system font',
    previewText: 'The quick brown fox',
    isActive: true,
    isPremium: false,
    order: 1,
  },
  {
    name: 'Georgia',
    fontFamily: 'Georgia',
    description: 'Elegant serif font',
    previewText: 'The quick brown fox',
    isActive: true,
    isPremium: false,
    order: 2,
  },
  {
    name: 'Avenir',
    fontFamily: 'Avenir',
    description: 'Modern sans-serif',
    previewText: 'The quick brown fox',
    isActive: true,
    isPremium: true,
    order: 3,
  },
  {
    name: 'Baskerville',
    fontFamily: 'Baskerville',
    description: 'Classic serif font',
    previewText: 'The quick brown fox',
    isActive: true,
    isPremium: true,
    order: 4,
  },
  {
    name: 'Didot',
    fontFamily: 'Didot',
    description: 'Elegant display serif',
    previewText: 'The quick brown fox',
    isActive: true,
    isPremium: true,
    order: 5,
  },
  {
    name: 'Futura',
    fontFamily: 'Futura',
    description: 'Geometric sans-serif',
    previewText: 'The quick brown fox',
    isActive: true,
    isPremium: true,
    order: 6,
  },
  {
    name: 'Palatino',
    fontFamily: 'Palatino',
    description: 'Readable serif',
    previewText: 'The quick brown fox',
    isActive: true,
    isPremium: false,
    order: 7,
  },
  {
    name: 'American Typewriter',
    fontFamily: 'American Typewriter',
    description: 'Vintage typewriter style',
    previewText: 'The quick brown fox',
    isActive: true,
    isPremium: true,
    order: 8,
  },
];

async function seed() {
  console.log('🌱 Starting database seed...\n');

  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    entities: [Topic, Quote, User, SubscriptionPlan, Subscription, Font],
  } as any);

  await dataSource.initialize();
  console.log('✅ Database connected\n');

  const topicRepo = dataSource.getRepository(Topic);
  const quoteRepo = dataSource.getRepository(Quote);
  const userRepo = dataSource.getRepository(User);
  const planRepo = dataSource.getRepository(SubscriptionPlan);
  const fontRepo = dataSource.getRepository(Font);

  // Seed Topics
  console.log('📚 Seeding topics...');
  const topicMap: Record<string, Topic> = {};
  for (const topicData of topicsData) {
    let topic = await topicRepo.findOne({ where: { name: topicData.name } });
    if (!topic) {
      topic = topicRepo.create(topicData);
      await topicRepo.save(topic);
      console.log(`  ✅ Created topic: ${topicData.name}`);
    } else {
      console.log(`  ⏭️  Topic exists: ${topicData.name}`);
    }
    topicMap[topicData.name] = topic;
  }

  // Seed Quotes
  console.log('\n📝 Seeding quotes...');
  for (const quoteData of quotesData) {
    const existing = await quoteRepo.findOne({
      where: { text: quoteData.text },
    });
    if (!existing) {
      const quote = quoteRepo.create({
        text: quoteData.text,
        author: quoteData.author,
        topic: topicMap[quoteData.topic],
      });
      await quoteRepo.save(quote);
      console.log(
        `  ✅ Created quote: "${quoteData.text.substring(0, 40)}..."`,
      );
    }
  }

  // Seed Admin User
  console.log('\n👤 Seeding admin user...');
  let admin = await userRepo.findOne({ where: { email: 'admin@focus.app' } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = userRepo.create({
      email: 'admin@focus.app',
      password: hashedPassword,
      isAdmin: true,
      isSubscribed: true,
    });
    await userRepo.save(admin);
    console.log('  ✅ Created admin user: admin@focus.app / admin123');
  } else {
    console.log('  ⏭️  Admin user exists');
  }

  // Seed Subscription Plans
  console.log('\n💳 Seeding subscription plans...');
  for (const planData of plansData) {
    const existing = await planRepo.findOne({ where: { name: planData.name } });
    if (!existing) {
      const plan = planRepo.create(planData);
      await planRepo.save(plan);
      console.log(`  ✅ Created plan: ${planData.name}`);
    }
  }

  // Seed Fonts
  console.log('\n🔤 Seeding fonts...');
  for (const fontData of fontsData) {
    const existing = await fontRepo.findOne({ where: { name: fontData.name } });
    if (!existing) {
      const font = fontRepo.create(fontData);
      await fontRepo.save(font);
      console.log(`  ✅ Created font: ${fontData.name}`);
    }
  }

  await dataSource.destroy();
  console.log('\n🎉 Database seeding completed!');
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
