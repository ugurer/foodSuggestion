import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { LocationData } from '../services/locationService';

interface LocationDisplayProps {
    location: LocationData | null;
    loading: boolean;
    error: string | null;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
    location,
    loading,
    error,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [location, loading, error]);

    if (loading) {
        return (
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Konum alınıyor...</Text>
            </Animated.View>
        );
    }

    if (error) {
        return (
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <Ionicons name="location-outline" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
        );
    }

    if (!location) {
        return (
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <Ionicons name="location-outline" size={20} color={Colors.textMuted} />
                <Text style={styles.noLocationText}>Konum bulunamadı</Text>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }
            ]}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color={Colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.cityText}>
                    {location.city}
                    {location.district ? `, ${location.district}` : ''}
                </Text>
                <Text style={styles.countryText}>{location.country}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundLight,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    loadingText: {
        marginLeft: 12,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    errorText: {
        marginLeft: 8,
        fontSize: 14,
        color: Colors.error,
        flex: 1,
    },
    noLocationText: {
        marginLeft: 8,
        fontSize: 14,
        color: Colors.textMuted,
    },
    cityText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    countryText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});
