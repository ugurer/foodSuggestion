import React, { useRef } from 'react';
import {
    Text,
    StyleSheet,
    Pressable,
    Animated,
    ActivityIndicator,
    ViewStyle,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    fullWidth?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    style,
    fullWidth = false,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.96,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
                bounciness: 8,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePress = () => {
        if (disabled || loading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    const sizeStyles = {
        small: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 13 },
        medium: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 },
        large: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17 },
    };

    const getGradientColors = (): [string, string] => {
        switch (variant) {
            case 'primary':
                return [Colors.primary, Colors.primaryDark];
            case 'secondary':
                return [Colors.secondary, Colors.secondaryDark];
            default:
                return ['transparent', 'transparent'];
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'outline':
            case 'ghost':
                return Colors.primary;
            default:
                return Colors.text;
        }
    };

    const content = (
        <View style={[
            styles.content,
            {
                paddingVertical: sizeStyles[size].paddingVertical,
                paddingHorizontal: sizeStyles[size].paddingHorizontal,
            },
        ]}>
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    {title ? (
                        <Text style={[
                            styles.text,
                            {
                                fontSize: sizeStyles[size].fontSize,
                                color: getTextColor(),
                            },
                        ]}>
                            {title}
                        </Text>
                    ) : null}
                </>
            )}
        </View>
    );

    return (
        <Animated.View
            style={[
                { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
            >
                {(variant === 'primary' || variant === 'secondary') ? (
                    <LinearGradient
                        colors={getGradientColors()}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.button,
                            styles.gradientButton,
                            disabled && styles.disabled,
                        ]}
                    >
                        {content}
                    </LinearGradient>
                ) : (
                    <View style={[
                        styles.button,
                        variant === 'outline' && styles.outlineButton,
                        variant === 'ghost' && styles.ghostButton,
                        disabled && styles.disabled,
                    ]}>
                        {content}
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradientButton: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    outlineButton: {
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
    },
    ghostButton: {
        backgroundColor: Colors.primary + '15',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },
});
