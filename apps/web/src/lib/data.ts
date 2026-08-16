// Temporary seed data for testing the admin panel
// This file should be used to populate the database via API calls

export const seedUsers = [
  {
    email: "admin@quotes.com",
    password: "admin123",
    isAdmin: true,
    isSubscribed: true,
    subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    email: "user1@example.com",
    password: "password123",
    isAdmin: false,
    isSubscribed: true,
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    email: "user2@example.com",
    password: "password123",
    isAdmin: false,
    isSubscribed: false,
    subscriptionEndDate: null,
  },
  {
    email: "user3@example.com",
    password: "password123",
    isAdmin: false,
    isSubscribed: true,
    subscriptionEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedTopics = [
  {
    name: "Motivation",
    description: "Inspiring quotes to boost your motivation and drive",
  },
  {
    name: "Success",
    description: "Wisdom about achieving success and reaching goals",
  },
  {
    name: "Life",
    description: "Reflections on life, happiness, and meaning",
  },
  {
    name: "Love",
    description: "Beautiful quotes about love and relationships",
  },
  {
    name: "Wisdom",
    description: "Timeless wisdom from great thinkers",
  },
  {
    name: "Courage",
    description: "Quotes about bravery and facing challenges",
  },
];

export const seedQuotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    topicName: "Success",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    topicName: "Success",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    topicName: "Motivation",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    topicName: "Motivation",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    topicName: "Life",
  },
  {
    text: "The purpose of our lives is to be happy.",
    author: "Dalai Lama",
    topicName: "Life",
  },
  {
    text: "Love all, trust a few, do wrong to none.",
    author: "William Shakespeare",
    topicName: "Love",
  },
  {
    text: "The best thing to hold onto in life is each other.",
    author: "Audrey Hepburn",
    topicName: "Love",
  },
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    topicName: "Wisdom",
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    topicName: "Wisdom",
  },
  {
    text: "Courage is not the absence of fear, but rather the assessment that something else is more important than fear.",
    author: "Franklin D. Roosevelt",
    topicName: "Courage",
  },
  {
    text: "It takes courage to grow up and become who you really are.",
    author: "E.E. Cummings",
    topicName: "Courage",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    topicName: "Motivation",
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
    topicName: "Courage",
  },
  {
    text: "The best revenge is massive success.",
    author: "Frank Sinatra",
    topicName: "Success",
  },
];

// Helper function to seed the database
export async function seedDatabase(apiClient: any) {
  try {
    console.log("Starting database seeding...");

    // 1. Create users
    console.log("Creating users...");
    for (const user of seedUsers) {
      try {
        await apiClient.post("/auth/register", user);
      } catch (err) {
        console.log(`User ${user.email} might already exist`);
      }
    }

    // 2. Create topics
    console.log("Creating topics...");
    const createdTopics: any[] = [];
    for (const topic of seedTopics) {
      try {
        const response = await apiClient.post("/topics", topic);
        createdTopics.push(response.data);
      } catch (err) {
        console.log(`Topic ${topic.name} might already exist`);
      }
    }

    // 3. Create quotes with topic relations
    console.log("Creating quotes...");
    for (const quote of seedQuotes) {
      try {
        const topic = createdTopics.find((t) => t.name === quote.topicName);
        const payload = {
          text: quote.text,
          author: quote.author,
          ...(topic && { topicId: topic.id }),
        };
        await apiClient.post("/quotes", payload);
      } catch (err) {
        console.log(`Failed to create quote: ${quote.text.substring(0, 30)}...`);
      }
    }

    console.log("Database seeding completed!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error };
  }
}
