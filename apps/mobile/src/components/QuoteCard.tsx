import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Quote } from '../types';

const { height } = Dimensions.get('window');

interface QuoteCardProps {
  quote: Quote;
  onLike?: (quoteId: number) => void;
}

export default function QuoteCard({ quote, onLike }: QuoteCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.quoteText}>"{quote.text}"</Text>

        {quote.author && (
          <Text style={styles.author}>— {quote.author}</Text>
        )}
      </View>

      {/* Topic badge en bas à droite */}
      {quote.topic && (
        <View style={styles.topicBadge}>
          <Text style={styles.topicText}>{quote.topic.name}</Text>
        </View>
      )}

      {/* Like button en bas à droite */}
      <TouchableOpacity
        style={styles.likeButton}
        onPress={() => onLike?.(quote.id)}
      >
        <Text style={styles.likeIcon}>♥</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#1a1a1a',
  },
  content: {
    alignItems: 'center',
    maxWidth: '100%',
  },
  quoteText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 30,
  },
  author: {
    fontSize: 18,
    color: '#a0a0a0',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  topicBadge: {
    position: 'absolute',
    bottom: 180,
    right: 30,
    backgroundColor: 'rgba(51, 51, 51, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  topicText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  likeButton: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  likeIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
});
