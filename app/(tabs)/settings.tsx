import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { storageService, UserPreferences, notificationService } from '../../services';

export default function SettingsScreen() {
    const [preferences, setPreferences] = useState<UserPreferences>({
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        notificationsEnabled: false,
        notificationTime: '12:00',
    });

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        const prefs = await storageService.getPreferences();
        setPreferences(prefs);
    };

    const updatePreference = async (key: keyof UserPreferences, value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const updated = { ...preferences, [key]: value };

        // Vegan seçilirse vejetaryen de otomatik seçilir
        if (key === 'isVegan' && value) {
            updated.isVegetarian = true;
        }
        // Vejetaryen kapatılırsa vegan da kapanır
        if (key === 'isVegetarian' && !value) {
            updated.isVegan = false;
        }

        setPreferences(updated);
        await storageService.savePreferences(updated);

        // Bildirim ayarı değiştiyse
        if (key === 'notificationsEnabled') {
            if (value) {
                const granted = await notificationService.requestPermission();
                if (granted) {
                    await notificationService.updateNotificationSchedule();
                } else {
                    Alert.alert('İzin Gerekli', 'Bildirimler için izin vermeniz gerekiyor.');
                    setPreferences(prev => ({ ...prev, notificationsEnabled: false }));
                    await storageService.savePreferences({ notificationsEnabled: false });
                }
            } else {
                await notificationService.cancelAllNotifications();
            }
        }
    };

    const handleTestNotification = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await notificationService.sendTestNotification();
        Alert.alert('Bildirim Gönderildi', 'Test bildirimi gönderildi!');
    };

    const handleResetPreferences = async () => {
        Alert.alert(
            'Ayarları Sıfırla',
            'Tüm tercihleriniz sıfırlanacak. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: async () => {
                        await storageService.resetPreferences();
                        await notificationService.cancelAllNotifications();
                        loadPreferences();
                    },
                },
            ]
        );
    };

    const SettingRow = ({
        icon,
        title,
        subtitle,
        value,
        onValueChange,
        iconColor = Colors.primary,
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
        iconColor?: string;
    }) => (
        <View style={styles.settingRow}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: Colors.surface, true: Colors.primary + '60' }}
                thumbColor={value ? Colors.primary : Colors.textMuted}
            />
        </View>
    );

    return (
        <LinearGradient
            colors={Colors.gradients.night as unknown as [string, string, ...string[]]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>⚙️ Ayarlar</Text>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Diyet Tercihleri */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🥗 Diyet Tercihleri</Text>
                        <View style={styles.sectionContent}>
                            <SettingRow
                                icon="leaf"
                                title="Vejetaryen"
                                subtitle="Et içermeyen yemekler"
                                value={preferences.isVegetarian}
                                onValueChange={(v) => updatePreference('isVegetarian', v)}
                                iconColor={Colors.success}
                            />
                            <SettingRow
                                icon="nutrition"
                                title="Vegan"
                                subtitle="Hayvansal ürün içermeyen"
                                value={preferences.isVegan}
                                onValueChange={(v) => updatePreference('isVegan', v)}
                                iconColor={Colors.success}
                            />
                            <SettingRow
                                icon="warning"
                                title="Gluten-Free"
                                subtitle="Glutensiz yemekler"
                                value={preferences.isGlutenFree}
                                onValueChange={(v) => updatePreference('isGlutenFree', v)}
                                iconColor={Colors.warning}
                            />
                        </View>
                    </View>

                    {/* Bildirimler */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔔 Bildirimler</Text>
                        <View style={styles.sectionContent}>
                            <SettingRow
                                icon="notifications"
                                title="Günlük Öneri"
                                subtitle="Her gün öğle yemeği önerisi"
                                value={preferences.notificationsEnabled}
                                onValueChange={(v) => updatePreference('notificationsEnabled', v)}
                                iconColor={Colors.secondary}
                            />
                            {preferences.notificationsEnabled && (
                                <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
                                    <Ionicons name="paper-plane" size={18} color={Colors.primary} />
                                    <Text style={styles.testButtonText}>Test Bildirimi Gönder</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* AI API Key */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🤖 AI Asistan</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.apiKeyRow}>
                                <View style={[styles.iconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                                    <Ionicons name="key" size={22} color={Colors.secondary} />
                                </View>
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>Gemini API Key</Text>
                                    <Text style={styles.settingSubtitle}>AI önerileri için gerekli</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.apiKeyButton}
                                onPress={async () => {
                                    const { aiService } = await import('../../services');
                                    const currentKey = await aiService.getApiKey();
                                    Alert.prompt(
                                        'Gemini API Key',
                                        'Google AI Studio\'dan alacağınız API key\'i girin:\nhttps://aistudio.google.com/app/apikey',
                                        [
                                            { text: 'İptal', style: 'cancel' },
                                            {
                                                text: 'Kaydet',
                                                onPress: async (key: string | undefined) => {
                                                    if (key && key.trim()) {
                                                        await aiService.setApiKey(key.trim());
                                                        Alert.alert('Başarılı', 'API key kaydedildi! AI sekmesini kullanabilirsiniz.');
                                                    }
                                                },
                                            },
                                        ],
                                        'plain-text',
                                        currentKey
                                    );
                                }}
                            >
                                <Ionicons name="create-outline" size={18} color={Colors.secondary} />
                                <Text style={styles.apiKeyButtonText}>API Key Ekle/Değiştir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Places API Key */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📍 Yakındaki Restoranlar</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.apiKeyRow}>
                                <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                                    <Ionicons name="map" size={22} color={Colors.primary} />
                                </View>
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>Google Places API Key</Text>
                                    <Text style={styles.settingSubtitle}>Restoran önerileri için</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.apiKeyButton}
                                onPress={async () => {
                                    const { placesService } = await import('../../services');
                                    const currentKey = await placesService.getApiKey();
                                    Alert.prompt(
                                        'Places API Key',
                                        'Google Cloud Console\'dan alacağınız API key\'i girin:\nhttps://console.cloud.google.com/apis',
                                        [
                                            { text: 'İptal', style: 'cancel' },
                                            {
                                                text: 'Kaydet',
                                                onPress: async (key: string | undefined) => {
                                                    if (key && key.trim()) {
                                                        await placesService.setApiKey(key.trim());
                                                        Alert.alert('Başarılı', 'Places API key kaydedildi!');
                                                    }
                                                },
                                            },
                                        ],
                                        'plain-text',
                                        currentKey
                                    );
                                }}
                            >
                                <Ionicons name="create-outline" size={18} color={Colors.primary} />
                                <Text style={[styles.apiKeyButtonText, { color: Colors.primary }]}>API Key Ekle/Değiştir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sıfırla */}
                    <View style={styles.section}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleResetPreferences}>
                            <Ionicons name="refresh" size={20} color={Colors.error} />
                            <Text style={styles.resetButtonText}>Ayarları Sıfırla</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Yemek Öneri v1.2.0</Text>
                        <Text style={styles.footerText}>Powered by Gemini AI & Google Places</Text>
                    </View>
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
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionContent: {
        backgroundColor: Colors.backgroundLight,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    settingSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        gap: 8,
    },
    testButtonText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.error + '15',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    resetButtonText: {
        fontSize: 16,
        color: Colors.error,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    footerText: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    apiKeyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
    },
    apiKeyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        gap: 8,
    },
    apiKeyButtonText: {
        fontSize: 14,
        color: Colors.secondary,
        fontWeight: '600',
    },
});
