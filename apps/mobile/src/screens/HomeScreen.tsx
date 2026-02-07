import { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { QuoteCard, LoadingScreen, ErrorMessage } from '../components';
import { useQuotes } from '../hooks';
import { Quote } from '../types';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    quotes,
    loading,
    refreshing,
    error,
    loadMore,
    refresh,
    likeQuote,
    fetchQuotes,
  } = useQuotes({ pageSize: 10 });

  useEffect(() => {
    fetchQuotes(1, true);
  }, []);

  const handleRetry = useCallback(() => {
    fetchQuotes(1, true);
  }, [fetchQuotes]);

  const renderItem = useCallback(({ item }: { item: Quote }) => (
    <QuoteCard quote={item} onLike={likeQuote} />
  ), [likeQuote]);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }, [loading]);

  // Show loading screen on initial load
  if (loading && quotes.length === 0 && !error) {
    return <LoadingScreen />;
  }

  // Show error message if there's an error and no quotes
  if (error && quotes.length === 0) {
    return (
      <ErrorMessage
        message="Impossible de charger les citations. Vérifiez votre connexion."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={quotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#fff"
          />
        }
        ListFooterComponent={renderFooter}
        getItemLayout={(_data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  footer: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

