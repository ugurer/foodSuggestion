import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FOODS, Food } from '../constants/foods';
import { getMoodById } from '../constants/moods';

const API_KEY_STORAGE = '@suggest_food_gemini_api_key';

export interface AIRecommendation {
    recommendation: string;
    explanation: string;
    suggestedFoods: Food[];
    tips: string[];
}

class AIService {
    private model: GenerativeModel | null = null;
    private apiKey: string = '';

    async initialize(): Promise<boolean> {
        try {
            const key = await AsyncStorage.getItem(API_KEY_STORAGE);
            if (key && key.length > 0) {
                this.apiKey = key;
                const genAI = new GoogleGenerativeAI(key);
                this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                return true;
            }
            return false;
        } catch (error) {
            console.error('AI init error:', error);
            return false;
        }
    }

    async setApiKey(key: string): Promise<boolean> {
        try {
            await AsyncStorage.setItem(API_KEY_STORAGE, key);
            this.apiKey = key;
            const genAI = new GoogleGenerativeAI(key);
            this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            return true;
        } catch (error) {
            console.error('Set API key error:', error);
            return false;
        }
    }

    async getApiKey(): Promise<string> {
        try {
            const key = await AsyncStorage.getItem(API_KEY_STORAGE);
            return key || '';
        } catch {
            return '';
        }
    }

    isConfigured(): boolean {
        return this.model !== null && this.apiKey.length > 0;
    }

    async getPersonalizedRecommendation(
        moodId: string,
        city?: string,
        preferences?: {
            isVegetarian?: boolean;
            isVegan?: boolean;
            isGlutenFree?: boolean;
        }
    ): Promise<AIRecommendation | null> {
        if (!this.model) {
            await this.initialize();
            if (!this.model) return null;
        }

        try {
            const mood = getMoodById(moodId);
            if (!mood) return null;

            const dietPrefs: string[] = [];
            if (preferences?.isVegan) dietPrefs.push('vegan');
            else if (preferences?.isVegetarian) dietPrefs.push('vejetaryen');
            if (preferences?.isGlutenFree) dietPrefs.push('gluten-free');

            const dietText = dietPrefs.length > 0
                ? `Kullanıcı ${dietPrefs.join(' ve ')} beslenmeyi tercih ediyor.`
                : '';

            const prompt = `Sen bir yemek öneri uzmanısın. Türk mutfağı ve dünya mutfağı hakkında derin bilgin var.

Kullanıcı bilgileri:
- Ruh hali: ${mood.label} (${mood.description})
- Konum: ${city || 'Belirtilmedi'}
${dietText}

Görevin:
1. Bu ruh haline uygun 3 yemek öner (Türk mutfağından en az 1 tane)
2. Neden bu yemekleri önerdiğini kısaca açıkla
3. Yemekle ilgili 2 pratik ipucu ver

JSON formatında yanıt ver:
{
  "recommendation": "Kısa genel öneri mesajı",
  "explanation": "Neden bu yemekler? (2-3 cümle)",
  "foods": ["yemek1", "yemek2", "yemek3"],
  "tips": ["ipucu1", "ipucu2"]
}

Sadece JSON döndür, başka bir şey yazma.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            const parsed = JSON.parse(jsonMatch[0]);
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
            // Ensure name is a string
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
        if (!this.model) {
            await this.initialize();
            if (!this.model) return 'API key gerekiyor.';
        }

        try {
            const prompt = `"${foodName}" hakkında kısa bilgi ver:
- Nereden gelir?
- Nasıl yapılır? (2-3 cümle)
- Hangi ruh halinde yenmeli?

Türkçe ve samimi bir dille yaz, 100 kelimeyi geçme.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Ask about food error:', error);
            return 'Bilgi alınamadı. Lütfen tekrar deneyin.';
        }
    }
}

export const aiService = new AIService();
