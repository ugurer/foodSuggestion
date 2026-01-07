import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export const OfflineBanner = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [heightAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        let isMounted = true;

        const checkNetwork = async () => {
            try {
                const status = await Network.getNetworkStateAsync();
                if (isMounted) {
                    const connected = status?.isConnected ?? true; // Default to true to avoid false positives
                    if (connected !== isConnected) {
                        setIsConnected(connected);
                        animateBanner(connected);
                    }
                }
            } catch (e) {
                // Silently fail - don't crash the app
                console.warn('Network check failed:', e);
            }
        };

        checkNetwork();
        const interval = setInterval(checkNetwork, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [isConnected]);

    const animateBanner = (connected: boolean) => {
        Animated.timing(heightAnim, {
            toValue: connected ? 0 : 40,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    return (
        <Animated.View style={[styles.container, { height: heightAnim }]}>
            <View style={styles.content}>
                <Ionicons name="wifi-outline" size={16} color="#FFF" />
                <Text style={styles.text}>İnternet bağlantısı yok</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.error,
        overflow: 'hidden',
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        gap: 8,
    },
    text: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
});
