const axios = require('axios');

const API_URL = 'http://localhost:3001';

const topics = [
  { name: 'Motivation', description: 'Inspiring quotes to boost your motivation and drive' },
  { name: 'Success', description: 'Wisdom about achieving success and reaching goals' },
  { name: 'Life', description: 'Reflections on life, happiness, and meaning' },
  { name: 'Courage', description: 'Quotes about bravery and facing challenges' },
  { name: 'Wisdom', description: 'Timeless wisdom from great thinkers' },
  { name: 'Love', description: 'Beautiful quotes about love and relationships' },
];

// Mapping de mots-clés vers les topics
const topicKeywords = {
  'Motivation': ['success', 'achieve', 'dream', 'goal', 'inspire', 'motivation'],
  'Success': ['success', 'achieve', 'win', 'accomplish'],
  'Life': ['life', 'live', 'happiness', 'meaning', 'journey'],
  'Courage': ['courage', 'fear', 'brave', 'strength', 'challenge'],
  'Wisdom': ['wisdom', 'knowledge', 'learn', 'understand', 'think'],
  'Love': ['love', 'heart', 'relationship', 'care'],
};

function findTopicForQuote(quoteText, author) {
  const text = (quoteText + ' ' + (author || '')).toLowerCase();
  
  // Chercher des mots-clés dans le texte
  for (const [topicName, keywords] of Object.entries(topicKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return topicName;
      }
    }
  }
  
  // Par défaut, retourner un topic aléatoire
  const topicNames = Object.keys(topicKeywords);
  return topicNames[Math.floor(Math.random() * topicNames.length)];
}

async function seedTopicsAndUpdateQuotes() {
  try {
    console.log('🌱 Starting to seed topics...\n');

    // 1. Créer les topics
    const createdTopics = [];
    for (const topic of topics) {
      try {
        const response = await axios.post(`${API_URL}/topics`, topic);
        createdTopics.push(response.data);
        console.log(`✅ Created topic: ${topic.name}`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️  Topic already exists: ${topic.name}`);
          // Récupérer le topic existant
          const allTopics = await axios.get(`${API_URL}/topics`);
          const existingTopic = allTopics.data.find(t => t.name === topic.name);
          if (existingTopic) {
            createdTopics.push(existingTopic);
          }
        } else {
          console.error(`❌ Error creating topic ${topic.name}:`, error.message);
        }
      }
    }

    console.log(`\n📊 Created/Found ${createdTopics.length} topics\n`);

    // 2. Récupérer toutes les quotes
    const quotesResponse = await axios.get(`${API_URL}/quotes`);
    const quotes = quotesResponse.data;
    console.log(`📚 Found ${quotes.length} quotes\n`);

    // 3. Mettre à jour les quotes sans topic
    let updatedCount = 0;
    for (const quote of quotes) {
      if (!quote.topic) {
        // Trouver un topic approprié
        const topicName = findTopicForQuote(quote.text, quote.author);
        const topic = createdTopics.find(t => t.name === topicName);
        
        if (topic) {
          try {
            await axios.patch(`${API_URL}/quotes/${quote.id}`, {
              topicId: topic.id
            });
            updatedCount++;
            console.log(`✅ Updated quote #${quote.id}: "${quote.text.substring(0, 40)}..." → ${topicName}`);
          } catch (error) {
            console.error(`❌ Error updating quote #${quote.id}:`, error.message);
          }
        }
      } else {
        console.log(`⏭️  Quote #${quote.id} already has topic: ${quote.topic.name}`);
      }
    }

    console.log(`\n🎉 Seeding completed!`);
    console.log(`   - Topics created: ${createdTopics.length}`);
    console.log(`   - Quotes updated: ${updatedCount}`);
    console.log(`   - Total quotes: ${quotes.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Exécuter le script
seedTopicsAndUpdateQuotes();

