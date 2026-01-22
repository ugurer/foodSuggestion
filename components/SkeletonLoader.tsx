import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue } from 'react-native';
import { Colors } from '../constants/colors';

interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    style?: any;
}

export const Skeleton = ({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const SkeletonHome = () => (
    <View style={styles.homeContainer}>
        {/* Location Card Skeleton */}
        <View style={styles.cardSkeleton}>
            <Skeleton width={120} height={20} style={{ marginBottom: 12 }} />
            <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={1} style={{ marginVertical: 12 }} />
            <Skeleton width="80%" height={16} />
        </View>

        {/* Highlights Section Skeleton */}
        <View style={styles.sectionSkeleton}>
            <Skeleton width={150} height={18} style={{ marginBottom: 16 }} />
            <View style={styles.row}>
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} width={140} height={60} borderRadius={16} style={{ marginRight: 12 }} />
                ))}
            </View>
        </View>

        {/* AI Chips Skeleton */}
        <View style={styles.sectionSkeleton}>
            <Skeleton width={100} height={18} style={{ marginBottom: 16 }} />
            <View style={styles.row}>
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} width={100} height={40} borderRadius={20} style={{ marginRight: 10 }} />
                ))}
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: Colors.surfaceLight,
    },
    homeContainer: {
        padding: 24,
    },
    cardSkeleton: {
        backgroundColor: Colors.surface + '60',
        padding: 20,
        borderRadius: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    sectionSkeleton: {
        marginBottom: 32,
    },
    row: {
        flexDirection: 'row',
    },
});
