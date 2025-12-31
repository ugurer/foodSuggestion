import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../constants/colors';
import { getMoodById, Mood } from '../constants/moods';
import { foodService, FoodSuggestion, storageService, aiService, placesService, NearbyRestaurant } from '../services';
import { FoodCard, AnimatedButton, RestaurantCard } from '../components';

interface AITips {
    message: string;
    tips: string[];
}

export default function SuggestionScreen() {
    const router = useRouter();
    const { moodId, city } = useLocalSearchParams<{ moodId: string; city: string }>();

    const [mood, setMood] = useState<Mood | null>(null);
    const [suggestion, setSuggestion] = useState<FoodSuggestion | null>(null);
    const [aiTips, setAiTips] = useState<AITips | null>(null);
    const [restaurants, setRestaurants] = useState<NearbyRestaurant[]>([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
    const [previousFoodIds, setPreviousFoodIds] = useState<string[]>([]);
    const [key, setKey] = useState(0);
    const [showRestaurants, setShowRestaurants] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const loadAIEnhancement = async (moodIdParam: string, foods: string[], cityParam?: string) => {
        try {
            await aiService.initialize();
            if (!aiService.isConfigured()) return;

            setIsLoadingAI(true);
            const prefs = await storageService.getPreferences();

            const recommendation = await aiService.getPersonalizedRecommendation(
                moodIdParam,
                cityParam,
                {
                    isVegetarian: prefs.isVegetarian,
                    isVegan: prefs.isVegan,
                    isGlutenFree: prefs.isGlutenFree,
                }
            );

            if (recommendation && recommendation.tips.length > 0) {
                setAiTips({
                    message: recommendation.explanation,
                    tips: recommendation.tips,
                });
            }
        } catch (error) {
            console.log('AI enhancement skipped:', error);
        } finally {
            setIsLoadingAI(false);
        }
    };

    const loadNearbyRestaurants = async (foodName: string) => {
        try {
            await placesService.initialize();
            if (!placesService.isConfigured()) return;

            setIsLoadingPlaces(true);

            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const results = await placesService.searchNearbyRestaurants(
                foodName,
                latitude,
                longitude
            );

            setRestaurants(results);
            if (results.length > 0) {
                setShowRestaurants(true);
            }
        } catch (error) {
            console.log('Places search skipped:', error);
        } finally {
            setIsLoadingPlaces(false);
        }
    };

    useEffect(() => {
        const loadSuggestions = async () => {
            if (moodId) {
                const foundMood = getMoodById(moodId);
                setMood(foundMood || null);

                const initialSuggestion = await foodService.getSuggestions(moodId, city || undefined);
                setSuggestion(initialSuggestion);
                setPreviousFoodIds(initialSuggestion.foods.map(f => f.id));

                // Geçmişe ekle
                for (const food of initialSuggestion.foods) {
                    await storageService.addToHistory(food, moodId, city || undefined);
                }

                // AI ile zenginleştir
                loadAIEnhancement(moodId, initialSuggestion.foods.map(f => f.name), city || undefined);

                // İlk yemeği ara
                if (initialSuggestion.foods.length > 0) {
                    loadNearbyRestaurants(initialSuggestion.foods[0].name);
                }
            }
        };
        loadSuggestions();
    }, [moodId, city]);

    const handleNewSuggestions = useCallback(async () => {
        if (moodId) {
            setAiTips(null);
            setRestaurants([]);
            setShowRestaurants(false);

            const newSuggestion = await foodService.getNewSuggestions(moodId, previousFoodIds, city || undefined);
            setSuggestion(newSuggestion);
            setPreviousFoodIds(prev => [...prev, ...newSuggestion.foods.map(f => f.id)]);
            setKey(prev => prev + 1);

            // Geçmişe ekle
            for (const food of newSuggestion.foods) {
                await storageService.addToHistory(food, moodId, city || undefined);
            }

            // AI ile zenginleştir
            loadAIEnhancement(moodId, newSuggestion.foods.map(f => f.name), city || undefined);

            // İlk yemeği ara
            if (newSuggestion.foods.length > 0) {
                loadNearbyRestaurants(newSuggestion.foods[0].name);
            }
        }
    }, [moodId, previousFoodIds, city]);

    const handleBack = () => {
        router.back();
    };

    const handleStartOver = () => {
        router.replace('/');
    };

    if (!mood || !suggestion) {
        return null;
    }

    return (
        <LinearGradient
            colors={Colors.gradients.night as unknown as [string, string, ...string[]]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                    <AnimatedButton
                        title=""
                        onPress={handleBack}
                        variant="outline"
                        size="small"
                        style={styles.backButton}
                        icon={<Ionicons name="arrow-back" size={24} color={Colors.primary} />}
                    />

                    <View style={styles.badgeContainer}>
                        <View style={styles.moodBadge}>
                            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                            <Text style={styles.moodLabel}>{mood.label}</Text>
                        </View>
                        {suggestion.isRegional && suggestion.regionName && (
                            <View style={styles.regionBadge}>
                                <Ionicons name="location" size={14} color={Colors.success} />
                                <Text style={styles.regionLabel}>{suggestion.regionName}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Message */}
                <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.message}>{suggestion.message}</Text>
                    {city && (
                        <Text style={styles.locationHint}>
                            📍 {city} bölgesinden öneriler
                        </Text>
                    )}
                </Animated.View>

                {/* Food Cards */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.foodList} key={key}>
                        {suggestion.foods.map((food, index) => (
                            <View key={`${food.id}-${key}-${index}`}>
                                <FoodCard
                                    food={food}
                                    index={index}
                                />
                                {food.regions && food.regions.length > 0 && (
                                    <View style={styles.regionalTag}>
                                        <Text style={styles.regionalTagText}>🏷️ Bölgesel</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* AI Tips Section */}
                    {isLoadingAI && (
                        <View style={styles.aiSection}>
                            <ActivityIndicator color={Colors.primary} size="small" />
                            <Text style={styles.aiLoadingText}>AI önerileri yükleniyor...</Text>
                        </View>
                    )}

                    {aiTips && !isLoadingAI && (
                        <View style={styles.aiSection}>
                            <View style={styles.aiHeader}>
                                <Ionicons name="sparkles" size={18} color={Colors.secondary} />
                                <Text style={styles.aiTitle}>AI Asistan</Text>
                            </View>
                            {aiTips.message && (
                                <Text style={styles.aiMessage}>{aiTips.message}</Text>
                            )}
                            {aiTips.tips.length > 0 && (
                                <View style={styles.tipsContainer}>
                                    <Text style={styles.tipsTitle}>💡 İpuçları:</Text>
                                    {aiTips.tips.map((tip, idx) => (
                                        <Text key={idx} style={styles.tipText}>• {tip}</Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Nearby Restaurants Section */}
                    {isLoadingPlaces && (
                        <View style={styles.restaurantsSection}>
                            <ActivityIndicator color={Colors.primary} size="small" />
                            <Text style={styles.aiLoadingText}>Yakındaki restoranlar aranıyor...</Text>
                        </View>
                    )}

                    {restaurants.length > 0 && !isLoadingPlaces && (
                        <View style={styles.restaurantsSection}>
                            <TouchableOpacity
                                style={styles.restaurantsHeader}
                                onPress={() => setShowRestaurants(!showRestaurants)}
                            >
                                <View style={styles.restaurantsHeaderLeft}>
                                    <Ionicons name="restaurant" size={18} color={Colors.primary} />
                                    <Text style={styles.restaurantsTitle}>Yakındaki Restoranlar</Text>
                                    <View style={styles.restaurantCount}>
                                        <Text style={styles.restaurantCountText}>{restaurants.length}</Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name={showRestaurants ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={Colors.textMuted}
                                />
                            </TouchableOpacity>

                            {showRestaurants && (
                                <View style={styles.restaurantsList}>
                                    {restaurants.map((restaurant, idx) => (
                                        <RestaurantCard
                                            key={restaurant.id}
                                            restaurant={restaurant}
                                            index={idx}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* Action Buttons */}
                <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
                    <AnimatedButton
                        title="Farklı Öneriler"
                        onPress={handleNewSuggestions}
                        variant="secondary"
                        size="medium"
                        icon={<Ionicons name="refresh" size={18} color={Colors.text} />}
                        style={styles.refreshButton}
                    />
                    <AnimatedButton
                        title="Ana Sayfa"
                        onPress={handleStartOver}
                        variant="outline"
                        size="medium"
                        icon={<Ionicons name="home" size={18} color={Colors.primary} />}
                    />
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        marginBottom: 8,
    },
    backButton: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    moodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    moodEmoji: {
        fontSize: 18,
        marginRight: 6,
    },
    moodLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    regionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success + '20',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    regionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.success,
    },
    messageContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    message: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
        lineHeight: 30,
    },
    locationHint: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    foodList: {
        gap: 8,
    },
    regionalTag: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: Colors.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    regionalTagText: {
        fontSize: 10,
        color: Colors.success,
        fontWeight: '600',
    },
    aiSection: {
        marginTop: 20,
        padding: 16,
        backgroundColor: Colors.secondary + '15',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.secondary + '30',
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    aiTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.secondary,
    },
    aiLoadingText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    aiMessage: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
        marginBottom: 12,
    },
    tipsContainer: {
        padding: 12,
        backgroundColor: Colors.surface,
        borderRadius: 12,
    },
    tipsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 4,
        lineHeight: 18,
    },
    restaurantsSection: {
        marginTop: 20,
        padding: 16,
        backgroundColor: Colors.primary + '10',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    restaurantsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    restaurantsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    restaurantsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
    restaurantCount: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    restaurantCountText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    restaurantsList: {
        marginTop: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 12,
    },
    refreshButton: {
        flex: 1,
    },
});
