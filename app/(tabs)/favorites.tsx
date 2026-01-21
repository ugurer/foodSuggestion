import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Food } from '../../constants/foods';
import { storageService } from '../../services';
import { FoodCard } from '../../components';
import i18n from '../../constants/i18n';

export default function FavoritesScreen() {
    const [favorites, setFavorites] = useState<Food[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadFavorites = async () => {
        const data = await storageService.getFavorites();
        setFavorites(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const handleRemove = async (food: Food) => {
        await storageService.removeFavorite(food.id);
        loadFavorites();
    };

    const renderItem = ({ item, index }: { item: Food; index: number }) => (
        <FoodCard
            food={item}
            index={index}
            onPress={() => handleRemove(item)}
        />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{i18n.t('favorites_empty_title')}</Text>
            <Text style={styles.emptyText}>
                {i18n.t('favorites_empty_desc')}
            </Text>
        </View>
    );

    return (
        <LinearGradient
            colors={Colors.gradients.night as unknown as [string, string, ...string[]]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>❤️ {i18n.t('favorites_title')}</Text>
                    <Text style={styles.subtitle}>{i18n.t('favorites_subtitle_count', { count: favorites.length })}</Text>
                </View>

                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary}
                        />
                    }
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
        paddingBottom: 16,
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
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
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
