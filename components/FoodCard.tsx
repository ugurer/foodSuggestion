import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { Food } from '../constants/foods';
import { storageService } from '../services';

interface FoodCardProps {
    food: Food;
    index: number;
    onPress?: (food: Food) => void;
    showFavoriteButton?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
    food,
    index,
    onPress,
    showFavoriteButton = true,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const heartScale = useRef(new Animated.Value(1)).current;
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                delay: index * 100,
                useNativeDriver: true,
                speed: 12,
                bounciness: 4,
            }),
        ]).start();

        checkFavorite();
    }, []);

    const checkFavorite = async () => {
        const fav = await storageService.isFavorite(food.id);
        setIsFavorite(fav);
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 8,
        }).start();
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(food);
    };

    const handleFavoritePress = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Heart bounce animation
        Animated.sequence([
            Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true, speed: 50 }),
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 50 }),
        ]).start();

        const newState = await storageService.toggleFavorite(food);
        setIsFavorite(newState);
    };

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
        >
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.95}
            >
                <LinearGradient
                    colors={[Colors.surface + 'E6', Colors.surfaceLight + '99']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={[styles.emojiContainer, { backgroundColor: Colors.primary + '20' }]}>
                        <Text style={styles.emoji}>{food.emoji}</Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.name}>{food.name}</Text>
                        <Text style={styles.description} numberOfLines={2}>
                            {food.description}
                        </Text>
                        <View style={styles.badges}>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{food.category}</Text>
                            </View>
                            {food.isVegetarian && (
                                <View style={[styles.dietBadge, { backgroundColor: Colors.success + '20' }]}>
                                    <Text style={styles.dietText}>🥬</Text>
                                </View>
                            )}
                            {food.isVegan && (
                                <View style={[styles.dietBadge, { backgroundColor: Colors.success + '20' }]}>
                                    <Text style={styles.dietText}>🌱</Text>
                                </View>
                            )}
                            {food.isGlutenFree && (
                                <View style={[styles.dietBadge, { backgroundColor: Colors.warning + '20' }]}>
                                    <Text style={styles.dietText}>🌾</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {showFavoriteButton && (
                        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                            <TouchableOpacity
                                style={styles.favoriteButton}
                                onPress={handleFavoritePress}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={isFavorite ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={isFavorite ? Colors.error : Colors.textMuted}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    emojiContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    emoji: {
        fontSize: 30,
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 8,
        lineHeight: 18,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    categoryBadge: {
        backgroundColor: Colors.primary + '30',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: 11,
        color: Colors.primaryLight,
        fontWeight: '600',
    },
    dietBadge: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 10,
    },
    dietText: {
        fontSize: 12,
    },
    favoriteButton: {
        padding: 8,
    },
});
