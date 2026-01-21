import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../constants/colors';
import { getMoodById, Mood } from '../constants/moods';
import { foodService, FoodSuggestion, storageService, aiService, placesService, NearbyRestaurant, AIRecommendation, rateLimitService } from '../services';
import { FoodCard, AnimatedButton, RestaurantCard } from '../components';
import { Food } from '../constants/foods';
import { API_CONFIG } from '../constants/apiConfig';
import i18n from '../constants/i18n';

interface AITips {
    message: string;
    tips: string[];
    aiFoods: Food[]; // AI'ın önerdiği yemekler
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
    const [showAIFoods, setShowAIFoods] = useState(true);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [aiRemaining, setAiRemaining] = useState<number>(10);
    const [noRestaurantsFound, setNoRestaurantsFound] = useState(false);

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

            if (recommendation) {
                setAiTips({
                    message: recommendation.explanation,
                    tips: recommendation.tips,
                    aiFoods: recommendation.suggestedFoods || [],
                });
            }

            // Update remaining AI requests
            const remaining = await rateLimitService.getRemainingAI(API_CONFIG.limits.aiRecommendations);
            setAiRemaining(remaining);
        } catch (error) {
            console.log('AI enhancement skipped:', error);
        } finally {
            setIsLoadingAI(false);
        }
    };

    const loadNearbyRestaurants = async (foodName: string) => {
        console.log('🔍 loadNearbyRestaurants called with:', foodName);
        try {
            await placesService.initialize();
            if (!placesService.isConfigured()) {
                console.log('❌ placesService not configured');
                return;
            }

            setIsLoadingPlaces(true);
            setNoRestaurantsFound(false);

            const { status } = await Location.getForegroundPermissionsAsync();
            console.log('📍 Location permission status:', status);
            if (status !== 'granted') {
                console.log('❌ Location not granted');
                setNoRestaurantsFound(true);
                setIsLoadingPlaces(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            console.log('📍 Location:', latitude, longitude);

            const results = await placesService.searchNearbyRestaurants(
                foodName,
                latitude,
                longitude
            );
            console.log('🍽️ Results:', results.length);

            setRestaurants(results);
            if (results.length > 0) {
                setShowRestaurants(true);
            } else {
                setNoRestaurantsFound(true);
            }
        } catch (error) {
            console.log('❌ Places search error:', error);
            setNoRestaurantsFound(true);
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

                // Artık otomatik restoran aramıyoruz - kullanıcı yemek seçince arayacak
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

            // Seçili yemeği sıfırla
            setSelectedFood(null);
        }
    }, [moodId, previousFoodIds, city]);

    const scrollViewRef = useRef<ScrollView>(null);

    const handleFoodSelect = async (food: Food) => {
        setSelectedFood(food);
        setRestaurants([]);
        setNoRestaurantsFound(false);
        setShowRestaurants(true);

        // Scroll to show something is happening
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        await loadNearbyRestaurants(food.name);

        // Scroll again after results
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 500);
    };

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
                            <Text style={styles.moodLabel}>{i18n.t(`mood_${mood.id}`)}</Text>
                        </View>
                        {suggestion.isRegional && suggestion.regionName && (
                            <View style={styles.regionBadge}>
                                <Ionicons name="location" size={14} color={Colors.success} />
                                <Text style={styles.regionLabel}>{i18n.t(suggestion.regionName)}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Message */}
                <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.message}>{i18n.t(suggestion.message)}</Text>
                    {city && (
                        <Text style={styles.locationHint}>
                            {i18n.t('suggestion_location_hint', { city })}
                        </Text>
                    )}
                </Animated.View>

                {/* Food Cards */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.foodList} key={key}>
                        <Text style={styles.tapHint}>{i18n.t('suggestion_tap_hint')}</Text>
                        {suggestion.foods.map((food, index) => (
                            <View key={`${food.id}-${key}-${index}`}>
                                <FoodCard
                                    food={food}
                                    index={index}
                                    onPress={handleFoodSelect}
                                    isSelected={selectedFood?.id === food.id}
                                />
                                {food.regions && food.regions.length > 0 && (
                                    <View style={styles.regionalTag}>
                                        <Text style={styles.regionalTagText}>{i18n.t('suggestion_regional_tag')}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* AI Tips Section */}
                    {isLoadingAI && (
                        <View style={styles.aiSection}>
                            <ActivityIndicator color={Colors.secondary} size="small" />
                            <Text style={styles.aiLoadingText}>{i18n.t('suggestion_loading_ai')}</Text>
                        </View>
                    )}

                    {aiTips && !isLoadingAI && (
                        <View style={styles.aiSection}>
                            <TouchableOpacity
                                style={styles.aiHeader}
                                onPress={() => setShowAIFoods(!showAIFoods)}
                            >
                                <View style={styles.aiHeaderLeft}>
                                    <Ionicons name="sparkles" size={18} color={Colors.secondary} />
                                    <Text style={styles.aiTitle}>{i18n.t('suggestion_ai_title')}</Text>
                                    {aiTips.aiFoods.length > 0 && (
                                        <View style={styles.aiBadge}>
                                            <Text style={styles.aiBadgeText}>{aiTips.aiFoods.length}</Text>
                                        </View>
                                    )}
                                    <View style={styles.aiRemainingBadge}>
                                        <Text style={styles.aiRemainingText}>{aiRemaining}/10 {i18n.t('suggestion_ai_remaining')}</Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name={showAIFoods ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={Colors.textMuted}
                                />
                            </TouchableOpacity>

                            {showAIFoods && (
                                <>
                                    {aiTips.message && (
                                        <Text style={styles.aiMessage}>{aiTips.message}</Text>
                                    )}

                                    {/* AI Food Cards */}
                                    {aiTips.aiFoods.length > 0 && (
                                        <View style={styles.aiFoodsList}>
                                            {aiTips.aiFoods.map((food, idx) => (
                                                <FoodCard
                                                    key={`ai-${food.id}-${idx}`}
                                                    food={food}
                                                    index={idx}
                                                    onPress={handleFoodSelect}
                                                    isSelected={selectedFood?.id === food.id}
                                                />
                                            ))}
                                        </View>
                                    )}

                                    {aiTips.tips.length > 0 && (
                                        <View style={styles.tipsContainer}>
                                            <Text style={styles.tipsTitle}>{i18n.t('suggestion_tips')}</Text>
                                            {aiTips.tips.map((tip, idx) => (
                                                <Text key={idx} style={styles.tipText}>• {tip}</Text>
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    )}

                    {/* Nearby Restaurants Section */}
                    {selectedFood && isLoadingPlaces && (
                        <View style={styles.restaurantsSection}>
                            <ActivityIndicator color={Colors.primary} size="small" />
                            <Text style={styles.aiLoadingText}>
                                {i18n.t('restaurants_loading_specific', {
                                    food: i18n.t(`food_${selectedFood.id}_name`, { defaultValue: selectedFood.name })
                                })}
                            </Text>
                        </View>
                    )}

                    {selectedFood && restaurants.length > 0 && !isLoadingPlaces && (
                        <View style={styles.restaurantsSection}>
                            <TouchableOpacity
                                style={styles.restaurantsHeader}
                                onPress={() => setShowRestaurants(!showRestaurants)}
                            >
                                <View style={styles.restaurantsHeaderLeft}>
                                    <Ionicons name="restaurant" size={18} color={Colors.primary} />
                                    <Text style={styles.restaurantsTitle}>
                                        {selectedFood.emoji} {i18n.t(`food_${selectedFood.id}_name`, { defaultValue: selectedFood.name })}
                                    </Text>
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

                    {/* No Restaurants Found */}
                    {selectedFood && noRestaurantsFound && !isLoadingPlaces && restaurants.length === 0 && (
                        <View style={styles.emptyRestaurants}>
                            <Text style={styles.emptyEmoji}>😔</Text>
                            <Text style={styles.emptyTitle}>{i18n.t('restaurants_empty_title')}</Text>
                            <Text style={styles.emptyMessage}>
                                {i18n.t('restaurants_empty_message', {
                                    food: i18n.t(`food_${selectedFood.id}_name`, { defaultValue: selectedFood.name })
                                })}
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Action Buttons */}
                <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
                    <AnimatedButton
                        title={i18n.t('suggestion_refresh_button')}
                        onPress={handleNewSuggestions}
                        variant="secondary"
                        size="medium"
                        icon={<Ionicons name="refresh" size={18} color={Colors.text} />}
                        style={styles.refreshButton}
                    />
                    <AnimatedButton
                        title={i18n.t('suggestion_home_button')}
                        onPress={handleStartOver}
                        variant="outline"
                        size="medium"
                        icon={<Ionicons name="home" size={18} color={Colors.primary} />}
                    />
                </Animated.View>
            </SafeAreaView>
        </LinearGradient >
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
    tapHint: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 12,
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
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    aiHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    aiBadge: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    aiBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    aiRemainingBadge: {
        backgroundColor: Colors.textMuted + '30',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    aiRemainingText: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textSecondary,
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
    aiFoodsList: {
        marginTop: 12,
        marginBottom: 12,
        gap: 8,
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
    emptyRestaurants: {
        marginTop: 20,
        padding: 24,
        backgroundColor: Colors.error + '10',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.error + '30',
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: 40,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
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
