import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { OfflineBanner, ErrorBoundary } from '../components';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { storageService } from '../services';
import { setLanguage } from '../constants/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        // Add your fonts here if needed, e.g.:
        // 'Inter-Black': require('../assets/fonts/Inter-Black.otf'),
    });

    useEffect(() => {
        if (error) {
            console.warn('Font loading error:', error);
        }
    }, [error]);

    const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

    useEffect(() => {
        const prepare = async () => {
            try {
                // Load language preference
                const prefs = await storageService.getPreferences();
                if (prefs.language) {
                    setLanguage(prefs.language);
                }

                // Check onboarding status
                const completed = await storageService.isOnboardingCompleted();
                setOnboardingCompleted(completed);
            } catch (e) {
                console.warn('Error loading preferences:', e);
            } finally {
                if (loaded) {
                    SplashScreen.hideAsync();
                }
            }
        };

        prepare();
    }, [loaded]);

    if (!loaded && !error) {
        return null;
    }

    if (onboardingCompleted === null) {
        return null; // Still loading onboarding status
    }

    return (
        <ErrorBoundary>
            <>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }} initialRouteName={onboardingCompleted ? "(tabs)" : "onboarding"}>
                    <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="mood" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="suggestion" options={{ presentation: 'modal' }} />
                </Stack>
                <OfflineBanner />
            </>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
});
