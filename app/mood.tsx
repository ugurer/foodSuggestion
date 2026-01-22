import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { MOODS, Mood } from '../constants/moods';
import { MoodCard, AnimatedButton } from '../components';
import i18n from '../constants/i18n';
import { CUISINES } from '../constants/foods';

export default function MoodScreen() {
    const router = useRouter();
    const { city } = useLocalSearchParams<{ city: string }>();
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleMoodSelect = (mood: Mood) => {
        setSelectedMood(mood);
    };

    const handleContinue = () => {
        if (selectedMood) {
            router.push({
                pathname: '/suggestion',
                params: {
                    moodId: selectedMood.id,
                    city: city || '',
                    cuisine: selectedCuisine || ''
                },
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

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
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>{i18n.t('home_title')}</Text>
                        <Text style={styles.subtitle}>
                            {i18n.t('home_subtitle')}
                        </Text>
                        {city && (
                            <View style={styles.cityBadge}>
                                <Ionicons name="location" size={14} color={Colors.primary} />
                                <Text style={styles.cityText}>{city}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Cuisine Selection */}
                    <Animated.View style={[styles.cuisineSection, { opacity: fadeAnim }]}>
                        <Text style={styles.sectionLabel}>{i18n.t('category_cuisine')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cuisineScroll}>
                            <TouchableOpacity
                                style={[
                                    styles.cuisineChip,
                                    !selectedCuisine && styles.cuisineChipSelected
                                ]}
                                onPress={() => setSelectedCuisine(null)}
                            >
                                <Text style={[styles.cuisineText, !selectedCuisine && styles.cuisineTextSelected]}>
                                    {i18n.t('cuisine_any')}
                                </Text>
                            </TouchableOpacity>
                            {CUISINES.map((cuisine) => (
                                <TouchableOpacity
                                    key={cuisine}
                                    style={[
                                        styles.cuisineChip,
                                        selectedCuisine === cuisine && styles.cuisineChipSelected
                                    ]}
                                    onPress={() => setSelectedCuisine(cuisine)}
                                >
                                    <Text style={[styles.cuisineText, selectedCuisine === cuisine && styles.cuisineTextSelected]}>
                                        {i18n.t(`cuisine_${cuisine.toLowerCase().replace(/\s/g, '_')}`, { defaultValue: cuisine })}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>

                    <Text style={styles.sectionLabel}>{i18n.t('home_title')}</Text>
                    <Animated.View
                        style={[
                            styles.moodGrid,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        {MOODS.map((mood) => (
                            <View key={mood.id} style={styles.moodCardWrapper}>
                                <MoodCard
                                    mood={mood}
                                    selected={selectedMood?.id === mood.id}
                                    onSelect={handleMoodSelect}
                                    index={MOODS.indexOf(mood)}
                                />
                            </View>
                        ))}
                    </Animated.View>
                </ScrollView>

                {/* Selected Mood Indicator */}
                {selectedMood && (
                    <Animated.View style={[styles.selectedContainer, { opacity: fadeAnim }]}>
                        <View style={styles.selectedInfo}>
                            <Text style={styles.selectedEmoji}>{selectedMood.emoji}</Text>
                            <View>
                                <Text style={styles.selectedLabel}>{i18n.t('mood_selected_label')}</Text>
                                <Text style={styles.selectedMood}>{i18n.t(`mood_${selectedMood.id}`)}</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Continue Button */}
                <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
                    <AnimatedButton
                        title={i18n.t('mood_continue_button')}
                        onPress={handleContinue}
                        size="large"
                        disabled={!selectedMood}
                        icon={<Ionicons name="restaurant" size={20} color={Colors.text} />}
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
        paddingHorizontal: 24,
        paddingTop: 16,
        marginBottom: 16,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 16,
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    cityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 12,
        gap: 4,
    },
    cityText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    moodCardWrapper: {
        width: '45%',
    },
    selectedContainer: {
        marginHorizontal: 24,
        marginBottom: 16,
        padding: 16,
        backgroundColor: Colors.backgroundLight,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    selectedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedEmoji: {
        fontSize: 40,
        marginRight: 16,
    },
    selectedLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    selectedMood: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    cuisineSection: {
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginBottom: 12,
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cuisineScroll: {
        paddingVertical: 4,
    },
    cuisineChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.surfaceLight + '40',
        marginRight: 10,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    cuisineChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    cuisineText: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    cuisineTextSelected: {
        color: '#fff',
    },
});
