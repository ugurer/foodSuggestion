import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { storageService } from '../services';
import i18n from '../constants/i18n';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'onboarding_title_1',
        description: 'onboarding_desc_1',
        icon: 'location',
        colors: Colors.gradients.primary,
        emoji: '📍',
    },
    {
        id: '2',
        title: 'onboarding_title_2',
        description: 'onboarding_desc_2',
        icon: 'happy',
        colors: Colors.gradients.secondary || ['#FFD93D', '#FF8400'],
        emoji: '😊',
    },
    {
        id: '3',
        title: 'onboarding_title_3',
        description: 'onboarding_desc_3',
        icon: 'sparkles',
        colors: Colors.gradients.info,
        emoji: '🤖',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const scrollX = useRef(new Animated.Value(0)).current;
    const [activeIndex, setActiveIndex] = useState(0);

    const handleComplete = async () => {
        await storageService.setOnboardingCompleted(true);
        router.replace('/(tabs)');
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false, listener: (event: any) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setActiveIndex(index);
            }
        }
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={Colors.gradients.night as unknown as [string, string, ...string[]]}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {SLIDES.map((slide, index) => (
                    <View key={slide.id} style={styles.slide}>
                        <SafeAreaView style={styles.slideContent}>
                            <Animated.View style={[
                                styles.iconContainer,
                                {
                                    transform: [
                                        {
                                            scale: scrollX.interpolate({
                                                inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                                                outputRange: [0.8, 1.2, 0.8],
                                                extrapolate: 'clamp',
                                            }),
                                        },
                                    ],
                                },
                            ]}>
                                <LinearGradient
                                    colors={slide.colors as unknown as [string, string]}
                                    style={styles.iconGradient}
                                >
                                    <Text style={styles.emoji}>{slide.emoji}</Text>
                                </LinearGradient>
                            </Animated.View>

                            <Text style={styles.title}>{i18n.t(slide.title)}</Text>
                            <Text style={styles.description}>{i18n.t(slide.description)}</Text>
                        </SafeAreaView>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => {
                        const dotWidth = scrollX.interpolate({
                            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={index}
                                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: Colors.primary }]}
                            />
                        );
                    })}
                </View>

                {/* Bottom Buttons */}
                <View style={styles.buttonRow}>
                    {activeIndex < SLIDES.length - 1 ? (
                        <TouchableOpacity style={styles.skipButton} onPress={handleComplete}>
                            <Text style={styles.skipText}>{i18n.t('onboarding_skip') || 'Skip'}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 80 }} />
                    )}

                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={activeIndex === SLIDES.length - 1 ? handleComplete : undefined}
                    >
                        <LinearGradient
                            colors={Colors.gradients.primary as unknown as [string, string]}
                            style={styles.nextGradient}
                        >
                            <Text style={styles.nextText}>
                                {activeIndex === SLIDES.length - 1
                                    ? (i18n.t('onboarding_finish') || 'Hadi Başlayalım')
                                    : (i18n.t('onboarding_next') || 'İleri')}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color={Colors.text} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        width,
        height,
    },
    slideContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        marginBottom: 40,
    },
    iconGradient: {
        width: 140,
        height: 140,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    emoji: {
        fontSize: 64,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        minWidth: 140,
    },
    nextGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 8,
    },
    nextText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
});
