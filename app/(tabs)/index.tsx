import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AnimatedButton, LocationDisplay, SkeletonHome } from '../../components';
import { useLocation } from '../../hooks';
import i18n from '../../constants/i18n';
import { foodService } from '../../services/foodService';
import { WeatherData, weatherService } from '../../services/weatherService';
import { Food } from '../../constants/foods';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { location, loading, error, refresh } = useLocation();
    const [highlights, setHighlights] = React.useState<{ foods: Food[], isRegional: boolean }>({ foods: [], isRegional: false });
    const [weatherHighlights, setWeatherHighlights] = React.useState<Food[]>([]);
    const [weather, setWeather] = React.useState<WeatherData | null>(null);
    const [weatherLoading, setWeatherLoading] = React.useState(false);

    // Initial loading state combined
    const isInitialLoading = (loading || weatherLoading) && !location && !weather;

    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const fadeAnim4 = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadHighlights(location?.city);
        if (location?.latitude && location?.longitude) {
            loadWeather(location.latitude, location.longitude);
        }
    }, [location]);

    const loadHighlights = async (city?: string) => {
        const result = await foodService.getRegionalHighlights(city);
        setHighlights(result);
    };

    const loadWeather = async (lat: number, lon: number) => {
        setWeatherLoading(true);
        try {
            const data = await weatherService.getWeather(lat, lon);
            if (data) {
                setWeather(data);
                const wHighlights = await foodService.getWeatherHighlights(data.temperature, data.condition);
                setWeatherHighlights(wHighlights);
            }
        } catch (error) {
            console.error('Weather load error:', error);
        } finally {
            setWeatherLoading(false);
        }
    };

    const getFoodEmoji = (food: Food) => {
        const categoryEmojis: Record<string, string> = {
            'turkish': '🥙', 'italian': '🍕', 'japanese': '🍣', 'american': '🍔',
            'mexican': '🌮', 'chinese': '🥡', 'indian': '🍛', 'dessert': '🍰',
            'healthy': '🥗', 'snack': '🍿'
        };
        return (food.cuisine ? categoryEmojis[food.cuisine] : null) || '🍽️';
    };

    useEffect(() => {
        // Staggered fade in
        Animated.stagger(150, [
            Animated.parallel([
                Animated.timing(fadeAnim1, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 6 }),
            ]),
            Animated.timing(fadeAnim2, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(fadeAnim3, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(fadeAnim4, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        // Subtle logo rotation
        Animated.loop(
            Animated.sequence([
                Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
                Animated.timing(rotateAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handleStart = () => {
        router.push({
            pathname: '/mood',
            params: { city: location?.city || '' },
        });
    };

    const handleSurpriseMe = () => {
        // En yaygın ruh hallerinden birini seç
        const commonMoods = ['happy', 'energetic', 'relaxed', 'tired'];
        const randomMood = commonMoods[Math.floor(Math.random() * commonMoods.length)];

        router.push({
            pathname: '/suggestion',
            params: {
                moodId: randomMood,
                city: location?.city || ''
            },
        });
    };

    const handleQuickAI = (key: string) => {
        const prompts: Record<string, string> = {
            healthy: i18n.t('quick_ai_healthy'),
            dessert: i18n.t('quick_ai_dessert'),
            night: i18n.t('quick_ai_night'),
            workout: i18n.t('quick_ai_workout'),
            cheap: i18n.t('quick_ai_cheap'),
        };

        const prompt = prompts[key as keyof typeof prompts] || '';
        router.push({
            pathname: '/ai',
            params: { initialPrompt: prompt },
        });
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-3deg', '3deg'],
    });

    return (
        <LinearGradient
            colors={Colors.gradients.night as unknown as [string, string, ...string[]]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {isInitialLoading ? (
                        <SkeletonHome />
                    ) : (
                        <View style={styles.content}>
                            {/* Header */}
                            <Animated.View style={[
                                styles.header,
                                {
                                    opacity: fadeAnim1,
                                    transform: [{ scale: scaleAnim }]
                                }
                            ]}>
                                <Animated.View
                                    style={[
                                        styles.logoContainer,
                                        { transform: [{ rotate: spin }] }
                                    ]}
                                >
                                    <LinearGradient
                                        colors={Colors.gradients.primary as unknown as [string, string]}
                                        style={styles.logoGradient}
                                    >
                                        <Text style={styles.logoEmoji}>🍽️</Text>
                                    </LinearGradient>
                                </Animated.View>
                                <Text style={styles.title}>{i18n.t('app_name')}</Text>
                                <Text style={styles.subtitle}>
                                    {i18n.t('home_subtitle')}
                                </Text>
                            </Animated.View>

                            {/* Location Card */}
                            <Animated.View style={[styles.locationCard, { opacity: fadeAnim2 }]}>
                                <LinearGradient
                                    colors={[Colors.surface + 'CC', Colors.surfaceLight + '80']}
                                    style={styles.locationGradient}
                                >
                                    <View style={styles.locationHeader}>
                                        <Ionicons name="location" size={18} color={Colors.primary} />
                                        <Text style={styles.sectionTitle}>{i18n.t('home_location_title')}</Text>
                                    </View>
                                    <LocationDisplay
                                        location={location}
                                        loading={loading}
                                        error={error}
                                    />

                                    {/* Weather Mini Info */}
                                    {weather && (
                                        <View style={styles.weatherMini}>
                                            <Ionicons name={weather.icon as any} size={16} color={Colors.primary} />
                                            <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
                                            <Text style={styles.weatherDesc}>{i18n.t(weather.description)}</Text>
                                        </View>
                                    )}

                                    {location?.city && (
                                        <View style={styles.regionHintContainer}>
                                            <Text style={styles.regionHint}>
                                                {i18n.t('home_region_hint')}
                                            </Text>
                                        </View>
                                    )}
                                    {error && (
                                        <AnimatedButton
                                            title={i18n.t('suggestion_retry')}
                                            onPress={refresh}
                                            variant="ghost"
                                            size="small"
                                            style={styles.retryButton}
                                        />
                                    )}
                                </LinearGradient>
                            </Animated.View>

                            {/* Main Actions */}
                            <Animated.View style={[styles.mainActions, { opacity: fadeAnim2 }]}>
                                <AnimatedButton
                                    title={i18n.t('home_start_button')}
                                    onPress={handleStart}
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    style={styles.actionButton}
                                    icon={<Ionicons name="restaurant" size={20} color={Colors.text} />}
                                />
                                <AnimatedButton
                                    title={i18n.t('home_surprise_button')}
                                    onPress={handleSurpriseMe}
                                    variant="secondary"
                                    size="medium"
                                    fullWidth
                                    style={styles.actionButton}
                                    icon={<Ionicons name="shuffle" size={18} color={Colors.text} />}
                                />
                            </Animated.View>

                            {/* Local / Popular Flavors Section */}
                            {highlights.foods.length > 0 && (
                                <Animated.View style={[styles.quickSection, { opacity: fadeAnim3 }]}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.quickTitle}>
                                            {highlights.isRegional
                                                ? i18n.t('home_local_highlights')
                                                : i18n.t('home_popular_highlights')}
                                        </Text>
                                        <Ionicons name={highlights.isRegional ? "location" : "sparkles"} size={14} color={Colors.primary} />
                                    </View>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.quickScroll}
                                    >
                                        {highlights.foods.map((food) => (
                                            <TouchableOpacity
                                                key={food.id}
                                                style={styles.foodChip}
                                                onPress={() => router.push({
                                                    pathname: '/suggestion',
                                                    params: { foodId: food.id, city: location?.city || '' }
                                                })}
                                            >
                                                <LinearGradient
                                                    colors={[Colors.surfaceLight + '60', Colors.surface + '80']}
                                                    style={styles.foodChipGradient}
                                                >
                                                    <Text style={styles.foodChipEmoji}>{getFoodEmoji(food)}</Text>
                                                    <Text style={styles.foodChipText} numberOfLines={1}>{food.name}</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </Animated.View>
                            )}

                            {/* Weather Specials Section */}
                            {weather && weatherHighlights.length > 0 && (
                                <Animated.View style={[styles.quickSection, { opacity: fadeAnim3 }]}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.quickTitle}>{i18n.t('home_weather_highlights')}</Text>
                                        <Ionicons name="thermometer-outline" size={14} color={Colors.primary} />
                                    </View>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.quickScroll}
                                    >
                                        {weatherHighlights.map((food) => (
                                            <TouchableOpacity
                                                key={`weather-${food.id}`}
                                                style={styles.foodChip}
                                                onPress={() => router.push({
                                                    pathname: '/suggestion',
                                                    params: { foodId: food.id, city: location?.city || '' }
                                                })}
                                            >
                                                <LinearGradient
                                                    colors={[Colors.primary + '20', Colors.surface + '80']}
                                                    style={styles.foodChipGradient}
                                                >
                                                    <Text style={styles.foodChipEmoji}>{getFoodEmoji(food)}</Text>
                                                    <Text style={styles.foodChipText} numberOfLines={1}>{food.name}</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </Animated.View>
                            )}

                            {/* Quick AI Chips */}
                            <Animated.View style={[styles.quickSection, { opacity: fadeAnim3 }]}>
                                <Text style={styles.quickTitle}>{i18n.t('feature_ai')}</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.quickScroll}
                                >
                                    {[
                                        { key: 'healthy', icon: '🥗' },
                                        { key: 'dessert', icon: '🧁' },
                                        { key: 'night', icon: '🌙' },
                                        { key: 'workout', icon: '💪' },
                                        { key: 'cheap', icon: '💰' },
                                    ].map((item) => (
                                        <TouchableOpacity
                                            key={item.key}
                                            style={styles.chip}
                                            onPress={() => handleQuickAI(item.key)}
                                        >
                                            <View style={styles.chipContent}>
                                                <Text style={styles.chipIcon}>{item.icon}</Text>
                                                <Text style={styles.chipText}>{i18n.t(`quick_ai_${item.key}`).trim()}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </Animated.View>

                            {/* Features */}
                            <Animated.View style={[styles.features, { opacity: fadeAnim3 }]}>
                                {[
                                    { emoji: '😊', text: i18n.t('feature_mood'), color: Colors.moods.happy },
                                    { emoji: '🗺️', text: i18n.t('feature_regional'), color: Colors.secondary },
                                    { emoji: '🤖', text: i18n.t('feature_ai'), color: Colors.info },
                                ].map((feature, idx) => (
                                    <View key={idx} style={styles.featureItem}>
                                        <LinearGradient
                                            colors={[feature.color + '30', feature.color + '15']}
                                            style={styles.featureIcon}
                                        >
                                            <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                                        </LinearGradient>
                                        <Text style={styles.featureText}>{feature.text}</Text>
                                    </View>
                                ))}
                            </Animated.View>

                            {/* Footer */}
                            <Text style={styles.footerText}>Powered by Gemini AI & Google Places</Text>
                        </View>
                    )}
                </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logoGradient: {
        width: 100,
        height: 100,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    logoEmoji: {
        fontSize: 48,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    locationCard: {
        marginBottom: 28,
    },
    locationGradient: {
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    regionHintContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.glassBorder,
    },
    regionHint: {
        fontSize: 13,
        color: Colors.success,
        textAlign: 'center',
        fontWeight: '500',
    },
    retryButton: {
        marginTop: 12,
        alignSelf: 'center',
    },
    mainActions: {
        gap: 12,
        marginBottom: 32,
    },
    actionButton: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    features: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 32,
    },
    featureItem: {
        alignItems: 'center',
    },
    featureIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    featureEmoji: {
        fontSize: 24,
    },
    featureText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    buttonContainer: {
        marginTop: 24,
        marginBottom: 16,
    },
    footerText: {
        fontSize: 11,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: 8,
    },
    quickSection: {
        marginBottom: 24,
    },
    quickTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    quickScroll: {
        paddingRight: 24,
    },
    chip: {
        backgroundColor: Colors.surfaceLight + '40',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    chipIcon: {
        fontSize: 16,
    },
    chipText: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        marginLeft: 4,
    },
    foodChip: {
        width: 140,
        height: 60,
        marginRight: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    foodChipGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: 16,
    },
    foodChipEmoji: {
        fontSize: 22,
        marginRight: 8,
    },
    foodChipText: {
        color: Colors.text,
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    weatherMini: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
    },
    weatherTemp: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    weatherDesc: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
});
