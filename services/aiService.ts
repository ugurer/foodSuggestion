import { FOODS, Food } from '../constants/foods';
import { getMoodById, Mood } from '../constants/moods';
import { API_CONFIG } from '../constants/apiConfig';
import { rateLimitService } from './rateLimitService';
import i18n from '../constants/i18n';

export interface AIRecommendation {
    recommendation: string;
    explanation: string;
    suggestedFoods: Food[];
    tips: string[];
}

export interface AIStatus {
    configured: boolean;
    remainingToday: number;
    dailyLimit: number;
}

class AIService {
    async getStatus(): Promise<AIStatus> {
        const remaining = await rateLimitService.getRemainingAI(API_CONFIG.limits.aiRecommendations);
        return {
            configured: true, // Always configured when using backend proxy
            remainingToday: remaining,
            dailyLimit: API_CONFIG.limits.aiRecommendations,
        };
    }

    isConfigured(): boolean {
        return true; // Always configured when using backend proxy
    }

    async initialize(): Promise<boolean> {
        // Check if backend is reachable
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`);
            return response.ok;
        } catch {
            return false;
        }
    }

    async getPersonalizedRecommendation(
        moodId: string,
        city?: string,
        preferences?: {
            isVegetarian?: boolean;
            isVegan?: boolean;
            isGlutenFree?: boolean;
        },
        language: string = i18n.locale.split('-')[0] // Default to current locale
    ): Promise<AIRecommendation | null> {
        // Check rate limit
        const rateCheck = await rateLimitService.checkAILimit(API_CONFIG.limits.aiRecommendations);
        if (!rateCheck.allowed) {
            console.log('AI rate limit exceeded');
            return null;
        }

        try {
            const mood = getMoodById(moodId);
            if (!mood) return null;

            // Use localized strings for the prompt to ensure AI generates content in the correct language
            const localizedLabel = i18n.t(`mood_${mood.id}`, { defaultValue: mood.label });
            const localizedDesc = i18n.t(`mood_${mood.id}_desc`, { defaultValue: mood.description });

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.recommend}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mood: { label: localizedLabel, description: localizedDesc },
                    city,
                    preferences,
                    language,
                }),
            });

            if (!response.ok) {
                console.error('Backend error:', response.status);
                return null;
            }

            const parsed = await response.json();

            if (parsed.error) {
                console.error('API error:', parsed.error);
                return null;
            }

            const suggestedFoods = this.findMatchingFoods(parsed.foods || [], moodId, preferences);

            return {
                recommendation: parsed.recommendation || 'Size özel önerilerimiz hazır!',
                explanation: parsed.explanation || '',
                suggestedFoods,
                tips: parsed.tips || [],
            };
        } catch (error) {
            console.error('AI recommendation error:', error);
            return null;
        }
    }

    private findMatchingFoods(
        foodNames: unknown[],
        moodId: string,
        preferences?: {
            isVegetarian?: boolean;
            isVegan?: boolean;
            isGlutenFree?: boolean;
        }
    ): Food[] {
        const matchedFoods: Food[] = [];

        for (const name of foodNames) {
            if (typeof name !== 'string' || !name) continue;

            const nameLower = name.toLowerCase();
            const found = FOODS.find(f =>
                f.name.toLowerCase().includes(nameLower) ||
                nameLower.includes(f.name.toLowerCase())
            );
            if (found) {
                if (preferences?.isVegan && !found.isVegan) continue;
                if (preferences?.isVegetarian && !found.isVegetarian) continue;
                if (preferences?.isGlutenFree && !found.isGlutenFree) continue;
                matchedFoods.push(found);
            }
        }

        if (matchedFoods.length < 3) {
            const moodFoods = FOODS.filter(f => {
                if (!f.moods.includes(moodId)) return false;
                if (preferences?.isVegan && !f.isVegan) return false;
                if (preferences?.isVegetarian && !f.isVegetarian) return false;
                if (preferences?.isGlutenFree && !f.isGlutenFree) return false;
                if (matchedFoods.some(m => m.id === f.id)) return false;
                return true;
            });

            const shuffled = moodFoods.sort(() => Math.random() - 0.5);
            matchedFoods.push(...shuffled.slice(0, 3 - matchedFoods.length));
        }

        return matchedFoods.slice(0, 3);
    }

    async askAboutFood(foodName: string): Promise<string> {
        // Check rate limit
        const rateCheck = await rateLimitService.checkAILimit(API_CONFIG.limits.aiRecommendations);
        if (!rateCheck.allowed) {
            return i18n.t('ai_service_limit_exceeded');
        }

        // For askAboutFood, we'd need another endpoint. For now, return a placeholder.
        return i18n.t('ai_service_endpoint_not_ready', { food: foodName });
    }
}

export const aiService = new AIService();
