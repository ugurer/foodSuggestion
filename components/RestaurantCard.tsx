import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { NearbyRestaurant } from '../services';

interface RestaurantCardProps {
    restaurant: NearbyRestaurant;
    index: number;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                delay: index * 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Google Maps'te aç
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.id}`;
        Linking.openURL(url);
    };

    const renderStars = (rating?: number) => {
        if (!rating) return null;
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Ionicons key={i} name="star" size={12} color={Colors.warning} />
            );
        }
        if (rating % 1 >= 0.5) {
            stars.push(
                <Ionicons key="half" name="star-half" size={12} color={Colors.warning} />
            );
        }
        return stars;
    };

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
            }}
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[Colors.surface + 'E6', Colors.surfaceLight + '99']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    {restaurant.photoUrl ? (
                        <Image source={{ uri: restaurant.photoUrl }} style={styles.photo} />
                    ) : (
                        <View style={[styles.photo, styles.photoPlaceholder]}>
                            <Ionicons name="restaurant" size={24} color={Colors.textMuted} />
                        </View>
                    )}

                    <View style={styles.content}>
                        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>

                        <View style={styles.ratingRow}>
                            {restaurant.rating && (
                                <>
                                    <View style={styles.stars}>{renderStars(restaurant.rating)}</View>
                                    <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
                                    {restaurant.userRatingsTotal && (
                                        <Text style={styles.reviewCount}>({restaurant.userRatingsTotal})</Text>
                                    )}
                                </>
                            )}
                            {restaurant.priceLevel && (
                                <Text style={styles.priceLevel}>
                                    {restaurant.priceLevel}
                                </Text>
                            )}
                        </View>

                        <View style={styles.infoRow}>
                            {restaurant.distance && (
                                <View style={styles.infoItem}>
                                    <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                                    <Text style={styles.infoText}>{restaurant.distance}</Text>
                                </View>
                            )}
                            {restaurant.isOpen !== undefined && (
                                <View style={[styles.statusBadge, restaurant.isOpen ? styles.openBadge : styles.closedBadge]}>
                                    <Text style={[styles.statusText, restaurant.isOpen ? styles.openText : styles.closedText]}>
                                        {restaurant.isOpen ? 'Açık' : 'Kapalı'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    photo: {
        width: 56,
        height: 56,
        borderRadius: 10,
        marginRight: 12,
    },
    photoPlaceholder: {
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    stars: {
        flexDirection: 'row',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
    },
    reviewCount: {
        fontSize: 11,
        color: Colors.textMuted,
    },
    priceLevel: {
        fontSize: 11,
        color: Colors.success,
        marginLeft: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    infoText: {
        fontSize: 11,
        color: Colors.textMuted,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    openBadge: {
        backgroundColor: Colors.success + '20',
    },
    closedBadge: {
        backgroundColor: Colors.error + '20',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    openText: {
        color: Colors.success,
    },
    closedText: {
        color: Colors.error,
    },
});
