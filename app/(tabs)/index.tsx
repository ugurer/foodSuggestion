import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AnimatedButton, LocationDisplay } from '../../components';
import { useLocation } from '../../hooks';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { location, loading, error, refresh } = useLocation();

    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const fadeAnim4 = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

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
                        <Text style={styles.title}>Yemek Öneri</Text>
                        <Text style={styles.subtitle}>
                            Ruh halinize ve konumunuza göre{'\n'}size özel yemek önerileri
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
                                <Text style={styles.sectionTitle}>Konumunuz</Text>
                            </View>
                            <LocationDisplay
                                location={location}
                                loading={loading}
                                error={error}
                            />
                            {location?.city && (
                                <View style={styles.regionHintContainer}>
                                    <Text style={styles.regionHint}>
                                        ✨ Bölgenize özel yemekler önereceğiz!
                                    </Text>
                                </View>
                            )}
                            {error && (
                                <AnimatedButton
                                    title="Tekrar Dene"
                                    onPress={refresh}
                                    variant="ghost"
                                    size="small"
                                    style={styles.retryButton}
                                />
                            )}
                        </LinearGradient>
                    </Animated.View>

                    {/* Features */}
                    <Animated.View style={[styles.features, { opacity: fadeAnim3 }]}>
                        {[
                            { emoji: '😊', text: 'Ruh Hali', color: Colors.moods.happy },
                            { emoji: '🗺️', text: 'Bölgesel', color: Colors.secondary },
                            { emoji: '🤖', text: 'AI Öneri', color: Colors.info },
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

                    {/* Start Button */}
                    <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim4 }]}>
                        <AnimatedButton
                            title="Hadi Başlayalım"
                            onPress={handleStart}
                            size="large"
                            fullWidth
                            icon={<Ionicons name="arrow-forward" size={20} color={Colors.text} />}
                        />
                    </Animated.View>

                    {/* Footer */}
                    <Text style={styles.footerText}>Powered by Gemini AI & Google Places</Text>
                </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
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
        marginTop: 'auto',
        marginBottom: 16,
    },
    footerText: {
        fontSize: 11,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: 8,
    },
});
