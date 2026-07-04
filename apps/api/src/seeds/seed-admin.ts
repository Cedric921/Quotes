import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as bcrypt from 'bcrypt';

// Load .env file
config({ path: resolve(__dirname, '../../.env') });

import { User } from '../users/entities/user.entity';
import { Topic } from '../topics/entities/topic.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { getDatabaseConfig } from '../config/database.config';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function seedAdmin() {
  console.log('🔄 Creating database connection...');

  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    entities: [User, Topic, Quote],
  } as any);

  await dataSource.initialize();
  console.log('✅ Database connected');

  const userRepository = dataSource.getRepository(User);

  try {
    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${ADMIN_EMAIL}`);
      console.log('   Updating password and isAdmin flag...');

      // Update password and ensure isAdmin is true
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.isAdmin = true;

      await userRepository.save(existingAdmin);
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin user
      console.log('📝 Creating admin user...');

      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

      const adminUser = userRepository.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Admin',
        isAdmin: true,
        isSubscribed: true, // Admin has full access
      });

      await userRepository.save(adminUser);
      console.log('✅ Admin user created successfully!');
    }

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed
seedAdmin()
  .then(() => {
    console.log('\n✨ Admin seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Admin seed failed:', error);
    process.exit(1);
  });
