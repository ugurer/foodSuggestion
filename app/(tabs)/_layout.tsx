import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import i18n, { addLanguageChangeListener } from '../../constants/i18n';

export default function TabLayout() {
    const [locale, setLocale] = useState(i18n.locale);

    useEffect(() => {
        const unsubscribe = addLanguageChangeListener(() => {
            setLocale(i18n.locale);
        });
        return unsubscribe;
    }, []);

    return (
        <Tabs
            key={locale} // Force remount on language change
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.backgroundLight,
                    borderTopColor: Colors.glassBorder,
                    borderTopWidth: 1,
                    height: 85,
                    paddingTop: 8,
                    paddingBottom: 25,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: i18n.t('tab_home'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: i18n.t('tab_search'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: i18n.t('tab_favorites'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: i18n.t('tab_history'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ai"
                options={{
                    title: i18n.t('tab_ai'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="sparkles" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: i18n.t('tab_settings'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
