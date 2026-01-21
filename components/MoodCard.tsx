import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { Mood } from '../constants/moods';
import i18n from '../constants/i18n';

interface MoodCardProps {
    mood: Mood;
    selected: boolean;
    onSelect: (mood: Mood) => void;
    index: number;
}

export const MoodCard: React.FC<MoodCardProps> = ({ mood, selected, onSelect, index }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                delay: index * 80,
                useNativeDriver: true,
                speed: 12,
                bounciness: 6,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: selected ? 1.02 : 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 8,
        }).start();
    }, [selected]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSelect(mood);
    };

    const moodColor = Colors.moods[mood.id as keyof typeof Colors.moods] || Colors.primary;

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
        >
            <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
                <LinearGradient
                    colors={selected
                        ? [moodColor + '40', moodColor + '20']
                        : [Colors.surface + 'CC', Colors.surfaceLight + '80']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.card,
                        selected && { borderColor: moodColor, borderWidth: 2 },
                    ]}
                >
                    <View style={[styles.emojiContainer, { backgroundColor: moodColor + '25' }]}>
                        <Text style={styles.emoji}>{mood.emoji}</Text>
                    </View>
                    <Text style={styles.label}>{i18n.t(`mood_${mood.id}`)}</Text>
                    <Text style={styles.description} numberOfLines={2}>
                        {i18n.t(`mood_${mood.id}_desc`)}
                    </Text>
                    {selected && (
                        <View style={[styles.selectedIndicator, { backgroundColor: moodColor }]}>
                            <Text style={styles.checkmark}>✓</Text>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        minHeight: 140,
        justifyContent: 'center',
    },
    emojiContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    emoji: {
        fontSize: 28,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    description: {
        fontSize: 11,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 15,
    },
    selectedIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
});
