import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

interface ActionButtonsProps {
  quoteId: number;
  quoteText: string;
  author: string;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike: (quoteId: number) => void;
  onSave: (quoteId: number) => void;
  onShare: (text: string, author: string) => void;
}

export default function ActionButtons({
  quoteId,
  quoteText,
  author,
  isLiked = false,
  isSaved = false,
  onLike,
  onSave,
  onShare,
}: ActionButtonsProps) {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  
  const likeScale = useRef(new Animated.Value(1)).current;
  const saveScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked(!liked);
    onLike(quoteId);
    
    // Animation
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved(!saved);
    onSave(quoteId);
    
    // Animation
    Animated.sequence([
      Animated.timing(saveScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare(quoteText, author);
  };

  return (
    <View style={styles.container}>
      {/* Like Button */}
      <Animated.View style={{ transform: [{ scale: likeScale }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.likeButton,
            { backgroundColor: liked ? '#ff4444' : colors.cardBackground },
          ]}
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <Text style={[styles.icon, { color: liked ? '#fff' : colors.text }]}>
            {liked ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Save Button */}
      <Animated.View style={{ transform: [{ scale: saveScale }] }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.cardBackground }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={[styles.icon, { color: saved ? '#FFD700' : colors.text }]}>
            {saved ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Share Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.cardBackground }]}
        onPress={handleShare}
        activeOpacity={0.8}
      >
        <Text style={[styles.icon, { color: colors.text }]}>↗</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    gap: 12,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  likeButton: {
    // Style spécial pour le bouton like
  },
  icon: {
    fontSize: 28,
    fontWeight: '600',
  },
});

