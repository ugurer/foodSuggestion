import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { MOODS, Mood } from '../constants/moods';
import { MoodCard, AnimatedButton } from '../components';

export default function MoodScreen() {
    const router = useRouter();
    const { city } = useLocalSearchParams<{ city: string }>();
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

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
                params: { moodId: selectedMood.id, city: city || '' },
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
                        <Text style={styles.title}>Nasıl Hissediyorsun?</Text>
                        <Text style={styles.subtitle}>
                            Ruh halinizi seçin, size özel yemekler önerelim
                        </Text>
                        {city && (
                            <View style={styles.cityBadge}>
                                <Ionicons name="location" size={14} color={Colors.primary} />
                                <Text style={styles.cityText}>{city}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Mood Grid */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
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
                                <Text style={styles.selectedLabel}>Seçilen Ruh Hali</Text>
                                <Text style={styles.selectedMood}>{selectedMood.label}</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Continue Button */}
                <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
                    <AnimatedButton
                        title="Yemek Önerilerini Gör"
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
});
