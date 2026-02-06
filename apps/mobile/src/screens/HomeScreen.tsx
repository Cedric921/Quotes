import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuoteCard from '../components/QuoteCard';
import { quotesApi } from '../services/api';
import { Quote } from '../types';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadQuotes = async (pageNum: number, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const newQuotes = await quotesApi.getQuotes(pageNum, 10);
      
      if (newQuotes.length === 0) {
        setHasMore(false);
      } else if (refresh) {
        setQuotes(newQuotes);
      } else {
        setQuotes((prev) => [...prev, ...newQuotes]);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuotes(1);
  }, []);

  const onRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    loadQuotes(1, true);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadQuotes(nextPage);
    }
  };

  const handleLike = (quoteId: number) => {
    console.log('Liked quote:', quoteId);
    // TODO: Implement like functionality
  };

  const renderItem = ({ item }: { item: Quote }) => (
    <QuoteCard quote={item} onLike={handleLike} />
  );

  const renderFooter = () => {
    if (!loading || quotes.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  };

  if (loading && quotes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={quotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        snapToAlignment="start"
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        bounces={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
          />
        }
        ListFooterComponent={renderFooter}
        getItemLayout={(_data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  footer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
});
