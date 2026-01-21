import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { storageService, UserPreferences, notificationService } from '../../services';
import i18n, { setLanguage } from '../../constants/i18n';
import * as Updates from 'expo-updates';

export default function SettingsScreen() {
    const [preferences, setPreferences] = useState<UserPreferences>({
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        notificationsEnabled: false,
        notificationTime: '12:00',
        language: 'auto',
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

        // Dil değişimi kontrolü
        if (key === 'language') {
            setLanguage(value as any);
            Alert.alert(
                i18n.t('settings_alert_language_title'),
                i18n.t('settings_alert_language_desc'),
                [
                    { text: 'OK' }
                ]
            );
        }

        // Bildirim ayarı değiştiyse
        if (key === 'notificationsEnabled') {
            if (value) {
                const granted = await notificationService.requestPermission();
                if (granted) {
                    await notificationService.updateNotificationSchedule();
                } else {
                    Alert.alert(i18n.t('settings_alert_permission_title'), i18n.t('settings_alert_permission_desc'));
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
        Alert.alert(i18n.t('settings_alert_test_title'), i18n.t('settings_alert_test_desc'));
    };

    const handleResetPreferences = async () => {
        Alert.alert(
            i18n.t('settings_alert_reset_title'),
            i18n.t('settings_alert_reset_desc'),
            [
                { text: i18n.t('settings_alert_cancel'), style: 'cancel' },
                {
                    text: i18n.t('settings_alert_reset'),
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

    const SettingOption = ({
        icon,
        title,
        isSelected,
        onSelect,
        iconColor = Colors.primary,
    }: {
        icon: string;
        title: string;
        isSelected: boolean;
        onSelect: () => void;
        iconColor?: string;
    }) => (
        <TouchableOpacity style={styles.settingRow} onPress={onSelect}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{title}</Text>
            </View>
            {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
            )}
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={Colors.gradients.night as unknown as [string, string, ...string[]]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>⚙️ {i18n.t('settings_title')}</Text>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Dil Tercihleri */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🌐 {i18n.t('settings_section_language')}</Text>
                        <View style={styles.sectionContent}>
                            <SettingOption
                                icon="phone-portrait-outline"
                                title={i18n.t('settings_language_auto')}
                                isSelected={preferences.language === 'auto'}
                                onSelect={() => updatePreference('language', 'auto' as any)}
                                iconColor={Colors.primary}
                            />
                            <SettingOption
                                icon="language"
                                title={i18n.t('settings_language_en')}
                                isSelected={preferences.language === 'en'}
                                onSelect={() => updatePreference('language', 'en' as any)}
                                iconColor={Colors.secondary}
                            />
                            <SettingOption
                                icon="language"
                                title={i18n.t('settings_language_tr')}
                                isSelected={preferences.language === 'tr'}
                                onSelect={() => updatePreference('language', 'tr' as any)}
                                iconColor={Colors.error}
                            />
                        </View>
                    </View>

                    {/* Diyet Tercihleri */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🥗 {i18n.t('settings_section_diet')}</Text>
                        <View style={styles.sectionContent}>
                            <SettingRow
                                icon="leaf"
                                title={i18n.t('settings_diet_vegetarian')}
                                subtitle={i18n.t('settings_diet_vegetarian_subtitle')}
                                value={preferences.isVegetarian}
                                onValueChange={(v) => updatePreference('isVegetarian', v)}
                                iconColor={Colors.success}
                            />
                            <SettingRow
                                icon="nutrition"
                                title={i18n.t('settings_diet_vegan')}
                                subtitle={i18n.t('settings_diet_vegan_subtitle')}
                                value={preferences.isVegan}
                                onValueChange={(v) => updatePreference('isVegan', v)}
                                iconColor={Colors.success}
                            />
                            <SettingRow
                                icon="warning"
                                title={i18n.t('settings_diet_gluten_free')}
                                subtitle={i18n.t('settings_diet_gluten_free_subtitle')}
                                value={preferences.isGlutenFree}
                                onValueChange={(v) => updatePreference('isGlutenFree', v)}
                                iconColor={Colors.warning}
                            />
                        </View>
                    </View>

                    {/* Bildirimler */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔔 {i18n.t('settings_section_notifications')}</Text>
                        <View style={styles.sectionContent}>
                            <SettingRow
                                icon="notifications"
                                title={i18n.t('settings_notification_daily')}
                                subtitle={i18n.t('settings_notification_daily_subtitle')}
                                value={preferences.notificationsEnabled}
                                onValueChange={(v) => updatePreference('notificationsEnabled', v)}
                                iconColor={Colors.secondary}
                            />
                            {preferences.notificationsEnabled && (
                                <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
                                    <Ionicons name="paper-plane" size={18} color={Colors.primary} />
                                    <Text style={styles.testButtonText}>{i18n.t('settings_notification_test_button')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* AI Kullanım Bilgisi */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🤖 {i18n.t('settings_section_ai')}</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.apiKeyRow}>
                                <View style={[styles.iconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                                    <Ionicons name="sparkles" size={22} color={Colors.secondary} />
                                </View>
                                <View style={styles.settingTextContainer}>
                                    <Text style={styles.settingTitle}>{i18n.t('settings_ai_gemini')}</Text>
                                    <Text style={styles.settingSubtitle}>{i18n.t('settings_ai_desc')}</Text>
                                </View>
                                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                            </View>
                        </View>
                    </View>

                    {/* Sıfırla */}
                    <View style={styles.section}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleResetPreferences}>
                            <Ionicons name="refresh" size={20} color={Colors.error} />
                            <Text style={styles.resetButtonText}>{i18n.t('settings_reset_button')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{i18n.t('app_name')} v1.3.0</Text>
                        <Text style={styles.footerText}>{i18n.t('settings_footer_powered')}</Text>
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
