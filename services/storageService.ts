import AsyncStorage from '@react-native-async-storage/async-storage';
import { Food } from '../constants/foods';

const KEYS = {
    FAVORITES: '@suggest_food_favorites',
    HISTORY: '@suggest_food_history',
    PREFERENCES: '@suggest_food_preferences',
    NOTIFICATION_ENABLED: '@suggest_food_notifications',
};

export interface UserPreferences {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    notificationsEnabled: boolean;
    notificationTime: string; // "HH:mm" format
    language: 'auto' | 'en' | 'tr'; // New field
}

export interface HistoryItem {
    id: string;
    food: Food;
    mood: string;
    date: string;
    city?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    notificationsEnabled: false,
    notificationTime: '12:00',
    language: 'auto',
};

class StorageService {
    // ============ FAVORİLER ============

    async getFavorites(): Promise<Food[]> {
        try {
            const json = await AsyncStorage.getItem(KEYS.FAVORITES);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error('Get favorites error:', error);
            return [];
        }
    }

    async addFavorite(food: Food): Promise<void> {
        try {
            const favorites = await this.getFavorites();
            if (!favorites.find(f => f.id === food.id)) {
                favorites.unshift(food);
                await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
            }
        } catch (error) {
            console.error('Add favorite error:', error);
        }
    }

    async removeFavorite(foodId: string): Promise<void> {
        try {
            const favorites = await this.getFavorites();
            const filtered = favorites.filter(f => f.id !== foodId);
            await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(filtered));
        } catch (error) {
            console.error('Remove favorite error:', error);
        }
    }

    async isFavorite(foodId: string): Promise<boolean> {
        const favorites = await this.getFavorites();
        return favorites.some(f => f.id === foodId);
    }

    async toggleFavorite(food: Food): Promise<boolean> {
        const isFav = await this.isFavorite(food.id);
        if (isFav) {
            await this.removeFavorite(food.id);
            return false;
        } else {
            await this.addFavorite(food);
            return true;
        }
    }

    // ============ GEÇMİŞ ============

    async getHistory(): Promise<HistoryItem[]> {
        try {
            const json = await AsyncStorage.getItem(KEYS.HISTORY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error('Get history error:', error);
            return [];
        }
    }

    async addToHistory(food: Food, mood: string, city?: string): Promise<void> {
        try {
            const history = await this.getHistory();
            const item: HistoryItem = {
                id: `${food.id}_${Date.now()}`,
                food,
                mood,
                date: new Date().toISOString(),
                city,
            };
            history.unshift(item);
            // Son 50 öğeyi tut
            const trimmed = history.slice(0, 50);
            await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmed));
        } catch (error) {
            console.error('Add to history error:', error);
        }
    }

    async clearHistory(): Promise<void> {
        try {
            await AsyncStorage.removeItem(KEYS.HISTORY);
        } catch (error) {
            console.error('Clear history error:', error);
        }
    }

    // ============ TERCİHLER ============

    async getPreferences(): Promise<UserPreferences> {
        try {
            const json = await AsyncStorage.getItem(KEYS.PREFERENCES);
            return json ? { ...DEFAULT_PREFERENCES, ...JSON.parse(json) } : DEFAULT_PREFERENCES;
        } catch (error) {
            console.error('Get preferences error:', error);
            return DEFAULT_PREFERENCES;
        }
    }

    async savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
        try {
            const current = await this.getPreferences();
            const updated = { ...current, ...preferences };
            await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(updated));
        } catch (error) {
            console.error('Save preferences error:', error);
        }
    }

    async resetPreferences(): Promise<void> {
        try {
            await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(DEFAULT_PREFERENCES));
        } catch (error) {
            console.error('Reset preferences error:', error);
        }
    }
}

export const storageService = new StorageService();
