import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { aiService, storageService } from '../../services';
import i18n from '../../constants/i18n';
import { useLocation } from '../../hooks';
import { MOODS } from '../../constants/moods';
import { FoodCard } from '../../components';
import { Food } from '../../constants/foods';

interface Message {
    id: string;
    type: 'user' | 'ai';
    text: string;
    foods?: Food[];
    tips?: string[];
    isLoading?: boolean;
}

export default function AIScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [isConfigured, setIsConfigured] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const { location } = useLocation();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

        // AI servisini başlat
        const initAI = async () => {
            const success = await aiService.initialize();
            setIsConfigured(success);

            if (success) {
                setMessages([{
                    id: '1',
                    type: 'ai',
                    text: i18n.t('ai_screen_greeting'),
                }]);
            } else {
                setMessages([{
                    id: '1',
                    type: 'ai',
                    text: i18n.t('ai_screen_error_apikey'),
                }]);
            }
        };
        initAI();
    }, []);

    const handleMoodSelect = async (moodId: string) => {
        if (!aiService.isConfigured()) return;

        setSelectedMood(moodId);
        const mood = MOODS.find(m => m.id === moodId);
        if (!mood) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Kullanıcı mesajı ekle
        // Localized mood label for user message
        const localizedLabel = i18n.t(`mood_${mood.id}`, { defaultValue: mood.label });

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: i18n.t('ai_screen_user_mood', { emoji: mood.emoji, label: localizedLabel }),
        };
        setMessages(prev => [...prev, userMessage]);

        // Loading mesajı
        const loadingId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: loadingId, type: 'ai', text: '', isLoading: true }]);
        setIsLoading(true);

        try {
            const prefs = await storageService.getPreferences();
            const recommendation = await aiService.getPersonalizedRecommendation(
                moodId,
                location?.city,
                {
                    isVegetarian: prefs.isVegetarian,
                    isVegan: prefs.isVegan,
                    isGlutenFree: prefs.isGlutenFree,
                }
            );

            if (recommendation) {
                setMessages(prev => prev.map(m =>
                    m.id === loadingId
                        ? {
                            ...m,
                            isLoading: false,
                            text: `${recommendation.recommendation}\n\n${recommendation.explanation}`,
                            foods: recommendation.suggestedFoods,
                            tips: recommendation.tips,
                        }
                        : m
                ));
            } else {
                setMessages(prev => prev.map(m =>
                    m.id === loadingId
                        ? { ...m, isLoading: false, text: i18n.t('ai_screen_error_recommendation') }
                        : m
                ));
            }
        } catch (error) {
            setMessages(prev => prev.map(m =>
                m.id === loadingId
                    ? { ...m, isLoading: false, text: i18n.t('ai_screen_error_generic') }
                    : m
            ));
        }

        setIsLoading(false);
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const handleSend = async () => {
        if (!inputText.trim() || isLoading || !aiService.isConfigured()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: inputText.trim(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');

        const loadingId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: loadingId, type: 'ai', text: '', isLoading: true }]);
        setIsLoading(true);

        try {
            const response = await aiService.askAboutFood(inputText.trim());
            setMessages(prev => prev.map(m =>
                m.id === loadingId
                    ? { ...m, isLoading: false, text: response }
                    : m
            ));
        } catch (error) {
            setMessages(prev => prev.map(m =>
                m.id === loadingId
                    ? { ...m, isLoading: false, text: i18n.t('ai_screen_error_no_response') }
                    : m
            ));
        }

        setIsLoading(false);
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    return (
        <LinearGradient
            colors={Colors.gradients.night as unknown as [string, string, ...string[]]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>{i18n.t('ai_screen_title')}</Text>
                    <Text style={styles.subtitle}>{i18n.t('ai_screen_subtitle')}</Text>
                </Animated.View>

                <KeyboardAvoidingView
                    style={styles.content}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={100}
                >
                    {/* Mood Selection */}
                    {messages.length <= 1 && (
                        <Animated.View style={[styles.moodSection, { opacity: fadeAnim }]}>
                            <Text style={styles.moodTitle}>{i18n.t('ai_screen_mood_title')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.moodList}>
                                    {MOODS.map((mood) => (
                                        <TouchableOpacity
                                            key={mood.id}
                                            style={[
                                                styles.moodChip,
                                                selectedMood === mood.id && styles.moodChipSelected,
                                            ]}
                                            onPress={() => handleMoodSelect(mood.id)}
                                            disabled={isLoading}
                                        >
                                            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                            <Text style={styles.moodLabel}>{i18n.t(`mood_${mood.id}`)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </Animated.View>
                    )}

                    {/* Messages */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map((message) => (
                            <View
                                key={message.id}
                                style={[
                                    styles.messageBubble,
                                    message.type === 'user' ? styles.userBubble : styles.aiBubble,
                                ]}
                            >
                                {message.isLoading ? (
                                    <ActivityIndicator color={Colors.primary} />
                                ) : (
                                    <>
                                        <Text style={[
                                            styles.messageText,
                                            message.type === 'user' && styles.userMessageText,
                                        ]}>
                                            {message.text}
                                        </Text>
                                        {message.foods && message.foods.length > 0 && (
                                            <View style={styles.foodsContainer}>
                                                {message.foods.map((food, idx) => (
                                                    <FoodCard key={food.id} food={food} index={idx} showFavoriteButton={false} />
                                                ))}
                                            </View>
                                        )}
                                        {message.tips && message.tips.length > 0 && (
                                            <View style={styles.tipsContainer}>
                                                <Text style={styles.tipsTitle}>{i18n.t('suggestion_tips')}</Text>
                                                {message.tips.map((tip, idx) => (
                                                    <Text key={idx} style={styles.tipText}>• {tip}</Text>
                                                ))}
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    {/* Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={i18n.t('ai_screen_placeholder')}
                            placeholderTextColor={Colors.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSend}
                            editable={!isLoading && aiService.isConfigured()}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <Ionicons name="send" size={20} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
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
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    content: {
        flex: 1,
    },
    moodSection: {
        paddingVertical: 16,
    },
    moodTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginLeft: 24,
        marginBottom: 12,
    },
    moodList: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
    },
    moodChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundLight,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        gap: 6,
    },
    moodChipSelected: {
        backgroundColor: Colors.primary + '30',
        borderColor: Colors.primary,
    },
    moodEmoji: {
        fontSize: 18,
    },
    moodLabel: {
        fontSize: 13,
        color: Colors.text,
        fontWeight: '500',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        gap: 12,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 14,
        borderRadius: 16,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.backgroundLight,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    messageText: {
        fontSize: 15,
        color: Colors.text,
        lineHeight: 22,
    },
    userMessageText: {
        color: '#fff',
    },
    foodsContainer: {
        marginTop: 12,
    },
    tipsContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: Colors.surface,
        borderRadius: 12,
    },
    tipsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 4,
        lineHeight: 18,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.backgroundLight,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 15,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
