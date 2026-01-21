import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { placesService, NearbyRestaurant } from '../../services';
import { RestaurantCard, AnimatedButton } from '../../components';
import i18n from '../../constants/i18n';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<NearbyRestaurant[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;

        Keyboard.dismiss();
        setIsSearching(true);
        setError(null);
        setResults([]);

        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                setError(i18n.t('search_error_location'));
                setIsSearching(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const restaurants = await placesService.searchNearbyRestaurants(
                query,
                latitude,
                longitude,
                5000 // 5km radius
            );

            if (restaurants.length === 0) {
                setError(i18n.t('search_error_not_found'));
            } else {
                setResults(restaurants);
            }
        } catch (err) {
            console.error(err);
            setError(i18n.t('search_error_generic'));
        } finally {
            setIsSearching(false);
        }
    };

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    };

    const renderEmpty = () => {
        if (isSearching) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>{i18n.t('search_loading_text')}</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            );
        }

        if (results.length === 0 && !query) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="search-outline" size={64} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>{i18n.t('search_empty_title')}</Text>
                    <Text style={styles.emptyText}>
                        {i18n.t('search_empty_desc')}
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <LinearGradient
            colors={Colors.gradients.night as unknown as [string, string, ...string[]]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>{i18n.t('search_header_title')}</Text>
                    <Text style={styles.subtitle}>{i18n.t('search_header_subtitle')}</Text>
                </View>

                <View style={styles.searchContainer}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={i18n.t('search_input_placeholder')}
                            placeholderTextColor={Colors.textMuted}
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color={Colors.textMuted}
                                onPress={() => setQuery('')}
                                style={styles.clearIcon}
                            />
                        )}
                    </View>
                    <AnimatedButton
                        title={i18n.t('search_button')}
                        onPress={handleSearch}
                        size="medium"
                        disabled={isSearching || !query.trim()}
                        style={styles.searchButton}
                    />
                </View>

                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <RestaurantCard restaurant={item} index={index} />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />
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
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    searchContainer: {
        paddingHorizontal: 24,
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: Colors.text,
        fontSize: 15,
        height: '100%',
    },
    clearIcon: {
        marginLeft: 8,
    },
    searchButton: {
        width: 80,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        flexGrow: 1,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    loadingText: {
        marginTop: 16,
        color: Colors.textSecondary,
        fontSize: 14,
    },
    errorText: {
        marginTop: 12,
        color: Colors.error,
        textAlign: 'center',
        fontSize: 14,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
