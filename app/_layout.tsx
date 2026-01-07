import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { OfflineBanner, ErrorBoundary } from '../components';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

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

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <ErrorBoundary>
            <>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }}>
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
