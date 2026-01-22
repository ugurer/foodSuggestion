import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const CONFETTI_COUNT = 30;
const COLORS = ['#E67E22', '#F1C40F', '#E74C3C', '#27AE60', '#3498DB', '#9B59B6'];

export const Confetti = ({ active }: { active: boolean }) => {
    const pieces = useRef([...Array(CONFETTI_COUNT)].map(() => ({
        x: Math.random() * width,
        y: new Animated.Value(-20),
        rotate: new Animated.Value(Math.random() * 360),
        color: COLORS[Math.floor(Math.random() * COLORS.length)] || COLORS[0],
        size: Math.random() * 8 + 4,
        speed: Math.random() * 2000 + 1500,
        delay: Math.random() * 1000,
    }))).current;

    useEffect(() => {
        if (active) {
            const animations = pieces.map(p => {
                return Animated.parallel([
                    Animated.timing(p.y, {
                        toValue: height + 20,
                        duration: p.speed,
                        delay: p.delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(p.rotate, {
                        toValue: Math.random() * 1000,
                        duration: p.speed,
                        delay: p.delay,
                        useNativeDriver: true,
                    })
                ]);
            });

            Animated.parallel(animations).start();
        } else {
            pieces.forEach(p => {
                p.y.setValue(-20);
            });
        }
    }, [active]);

    if (!active) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {pieces.map((p, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.piece,
                        {
                            left: p.x,
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            transform: [
                                { translateY: p.y },
                                {
                                    rotate: p.rotate.interpolate({
                                        inputRange: [0, 1000],
                                        outputRange: ['0deg', '1000deg']
                                    })
                                }
                            ]
                        }
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    piece: {
        position: 'absolute',
        top: 0,
        borderRadius: 2,
    },
});
