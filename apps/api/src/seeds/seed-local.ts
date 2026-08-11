import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as bcrypt from 'bcrypt';

// `.env.local` first, like the app module does.
config({ path: resolve(__dirname, '../../.env.local') });
config({ path: resolve(__dirname, '../../.env') });

import { Topic } from '../topics/entities/topic.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { User } from '../users/entities/user.entity';
import { Theme } from '../themes/entities/theme.entity';
import { SocialNetwork } from '../social/entities/social-network.entity';
import { getDatabaseConfig } from '../config/database.config';

/**
 * The development dataset.
 *
 * `seed-database.ts` fills what production needs — topics, quotes, plans,
 * fonts and an admin. This adds what the v2 mobile app needs to actually look
 * like itself: background themes for the feed, the social links the settings
 * list reads, French quotes to match the app's default language, and two
 * accounts to test both sides of the paywall.
 *
 * Run it after the main seed:
 *   npm run db:seed && npm run db:seed:local
 */

/** Photos are hot-linked from Unsplash; this is a dev fixture, not a shipped asset. */
const unsplash = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

const themesData = [
  {
    name: 'Nuit',
    description: 'Fond sombre, texte clair',
    imageUrl: unsplash('1419242902214-272b3f66ee7a'),
    thumbnailUrl: unsplash('1419242902214-272b3f66ee7a', 400),
    fontName: 'Georgia',
    fontFamily: 'Georgia',
    isDefault: true,
    order: 0,
  },
  {
    name: 'Marbre',
    description: 'Statue antique',
    imageUrl: unsplash('1564399580075-5dfe19c205f3'),
    thumbnailUrl: unsplash('1564399580075-5dfe19c205f3', 400),
    fontName: 'Baskerville',
    fontFamily: 'Baskerville',
    order: 1,
  },
  {
    name: 'Forêt',
    description: 'Route entre les arbres',
    imageUrl: unsplash('1441974231531-c6227db76b6e'),
    thumbnailUrl: unsplash('1441974231531-c6227db76b6e', 400),
    fontName: 'Palatino',
    fontFamily: 'Palatino',
    order: 2,
  },
  {
    name: 'Aube',
    description: 'Nuages au lever du jour',
    imageUrl: unsplash('1500375592092-40eb2168fd21'),
    thumbnailUrl: unsplash('1500375592092-40eb2168fd21', 400),
    fontName: 'Didot',
    fontFamily: 'Didot',
    order: 3,
  },
  {
    name: 'Montagne',
    description: 'Sommet au petit matin',
    imageUrl: unsplash('1464822759023-fed622ff2c3b'),
    thumbnailUrl: unsplash('1464822759023-fed622ff2c3b', 400),
    fontName: 'Georgia',
    fontFamily: 'Georgia',
    isPremium: true,
    order: 4,
  },
  {
    name: 'Océan',
    description: 'Vague au ralenti',
    imageUrl: unsplash('1505142468610-359e7d316be0'),
    thumbnailUrl: unsplash('1505142468610-359e7d316be0', 400),
    fontName: 'American Typewriter',
    fontFamily: 'American Typewriter',
    isPremium: true,
    order: 5,
  },
];

const socialsData = [
  { name: 'Instagram', url: 'https://instagram.com/focus.app', icon: 'Instagram', order: 0 },
  { name: 'TikTok', url: 'https://tiktok.com/@focus.app', icon: 'TikTok', order: 1 },
  { name: 'Facebook', url: 'https://facebook.com/focus.app', icon: 'Facebook', order: 2 },
  { name: 'Pinterest', url: 'https://pinterest.com/focusapp', icon: 'Pinterest', order: 3 },
  { name: 'X', url: 'https://x.com/focus_app', icon: 'X', order: 4 },
];

/** The app defaults to French; the shipped seed is English only. */
const frenchQuotes: { text: string; author: string; topic: string }[] = [
  { text: "Le courage, c'est de tenir bon une minute de plus.", author: 'Anonyme', topic: 'Motivation' },
  { text: "Tu n'as pas besoin de leur approbation pour avancer.", author: 'Anonyme', topic: 'Motivation' },
  { text: 'Commence là où tu es, avec ce que tu as.', author: 'Arthur Ashe', topic: 'Motivation' },
  { text: 'Un jour, tu seras là où tu as toujours voulu être.', author: 'Anonyme', topic: 'Success' },
  { text: "Le succès, c'est tomber sept fois et se relever huit.", author: 'Proverbe japonais', topic: 'Success' },
  { text: "La discipline vaut mieux que la motivation d'un jour.", author: 'Anonyme', topic: 'Success' },
  { text: 'Ce que tu penses, tu le deviens.', author: 'Gandhi', topic: 'Wisdom' },
  { text: "Le silence est parfois la plus forte des réponses.", author: 'Anonyme', topic: 'Wisdom' },
  { text: "Rien ne se perd, tout se transforme.", author: 'Lavoisier', topic: 'Wisdom' },
  { text: "Aime-toi assez pour partir quand il le faut.", author: 'Anonyme', topic: 'Love' },
  { text: "On ne voit bien qu'avec le cœur.", author: 'Saint-Exupéry', topic: 'Love' },
  { text: 'La vie est courte, mais elle est large.', author: 'Anonyme', topic: 'Life' },
  { text: "Respire. Tu as traversé pire que ce lundi.", author: 'Anonyme', topic: 'Life' },
  { text: 'Le bonheur est une direction, pas un lieu.', author: 'Sydney J. Harris', topic: 'Happiness' },
  { text: 'Fais de ta journée ce que tu ferais de ta vie.', author: 'Anonyme', topic: 'Happiness' },
];

async function seedLocal() {
  console.log('🌱 Local dataset\n');

  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    entities: [Topic, Quote, User, Theme, SocialNetwork],
    logging: false,
  } as any);

  await dataSource.initialize();

  const themeRepo = dataSource.getRepository(Theme);
  const socialRepo = dataSource.getRepository(SocialNetwork);
  const userRepo = dataSource.getRepository(User);
  const quoteRepo = dataSource.getRepository(Quote);
  const topicRepo = dataSource.getRepository(Topic);

  console.log('🖼  Themes');
  for (const data of themesData) {
    const existing = await themeRepo.findOne({ where: { name: data.name } });
    if (existing) {
      console.log(`   ⏭  ${data.name}`);
      continue;
    }
    await themeRepo.save(themeRepo.create(data));
    console.log(`   ✅ ${data.name}`);
  }

  console.log('\n🔗 Social networks');
  for (const data of socialsData) {
    const existing = await socialRepo.findOne({ where: { name: data.name } });
    if (existing) {
      console.log(`   ⏭  ${data.name}`);
      continue;
    }
    await socialRepo.save(socialRepo.create(data));
    console.log(`   ✅ ${data.name}`);
  }

  console.log('\n📝 French quotes');
  for (const data of frenchQuotes) {
    const existing = await quoteRepo.findOne({ where: { text: data.text } });
    if (existing) continue;
    const topic = await topicRepo.findOne({ where: { name: data.topic } });
    await quoteRepo.save(
      quoteRepo.create({ text: data.text, author: data.author, topic: topic ?? undefined }),
    );
    console.log(`   ✅ ${data.text.slice(0, 44)}…`);
  }

  console.log('\n👤 Test accounts');
  const password = await bcrypt.hash('test1234', 10);

  const accounts = [
    { email: 'test@focus.app', name: 'Cédric', isSubscribed: false },
    { email: 'premium@focus.app', name: 'Premium', isSubscribed: true },
  ];

  for (const account of accounts) {
    let user = await userRepo.findOne({ where: { email: account.email } });
    if (!user) {
      user = userRepo.create({ ...account, password });
      await userRepo.save(user);
      console.log(`   ✅ ${account.email} / test1234`);
    } else {
      console.log(`   ⏭  ${account.email}`);
    }
  }

  // Three favourites on the free account, so the quota bar starts part-used
  // and the liked-quotes screen has something in it.
  const tester = await userRepo.findOne({
    where: { email: 'test@focus.app' },
    relations: ['likedQuotes'],
  });
  if (tester && tester.likedQuotes.length === 0) {
    tester.likedQuotes = await quoteRepo.find({ take: 3 });
    await userRepo.save(tester);
    console.log(`   ✅ 3 liked quotes for ${tester.email}`);
  }

  await dataSource.destroy();
  console.log('\n🎉 Local dataset ready');
}

seedLocal().catch((error) => {
  console.error('❌ Local seed failed:', error);
  process.exit(1);
});
