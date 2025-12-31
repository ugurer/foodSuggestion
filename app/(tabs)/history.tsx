import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { storageService, HistoryItem } from '../../services';
import { getMoodById } from '../../constants/moods';

export default function HistoryScreen() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
        const data = await storageService.getHistory();
        setHistory(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    const handleClearHistory = async () => {
        await storageService.clearHistory();
        setHistory([]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Bugün';
        if (diffDays === 1) return 'Dün';
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const mood = getMoodById(item.mood);

        return (
            <View style={styles.historyItem}>
                <View style={styles.itemLeft}>
                    <Text style={styles.foodEmoji}>{item.food.emoji}</Text>
                </View>
                <View style={styles.itemCenter}>
                    <Text style={styles.foodName}>{item.food.name}</Text>
                    <View style={styles.itemMeta}>
                        {mood && <Text style={styles.moodBadge}>{mood.emoji} {mood.label}</Text>}
                        {item.city && <Text style={styles.cityBadge}>📍 {item.city}</Text>}
                    </View>
                </View>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Geçmiş boş</Text>
            <Text style={styles.emptyText}>
                Yemek önerileri aldıkça{'\n'}burada görünecek
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
                    <View>
                        <Text style={styles.title}>📜 Geçmiş</Text>
                        <Text style={styles.subtitle}>{history.length} öneri</Text>
                    </View>
                    {history.length > 0 && (
                        <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
                            <Ionicons name="trash-outline" size={20} color={Colors.error} />
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={history}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    clearButton: {
        padding: 8,
        backgroundColor: Colors.error + '20',
        borderRadius: 12,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexGrow: 1,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundLight,
        padding: 14,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    itemLeft: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    foodEmoji: {
        fontSize: 24,
    },
    itemCenter: {
        flex: 1,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    moodBadge: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    cityBadge: {
        fontSize: 11,
        color: Colors.textMuted,
    },
    dateText: {
        fontSize: 11,
        color: Colors.textMuted,
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
