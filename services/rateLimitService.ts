import AsyncStorage from '@react-native-async-storage/async-storage';
import { RATE_LIMIT_KEYS } from '../constants/apiConfig';

interface RateLimitStatus {
    allowed: boolean;
    remaining: number;
    resetTime: string;
}

class RateLimitService {
    private getTodayKey(): string {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }

    async checkAndIncrement(
        countKey: string,
        dateKey: string,
        dailyLimit: number
    ): Promise<RateLimitStatus> {
        try {
            const today = this.getTodayKey();
            const storedDate = await AsyncStorage.getItem(dateKey);
            let count = 0;

            // Reset if new day
            if (storedDate !== today) {
                await AsyncStorage.setItem(dateKey, today);
                await AsyncStorage.setItem(countKey, '0');
                count = 0;
            } else {
                const storedCount = await AsyncStorage.getItem(countKey);
                count = storedCount ? parseInt(storedCount, 10) : 0;
            }

            if (count >= dailyLimit) {
                return {
                    allowed: false,
                    remaining: 0,
                    resetTime: 'Gece yarısı sıfırlanır',
                };
            }

            // Increment count
            await AsyncStorage.setItem(countKey, (count + 1).toString());

            return {
                allowed: true,
                remaining: dailyLimit - count - 1,
                resetTime: '',
            };
        } catch (error) {
            console.error('Rate limit check error:', error);
            // Allow on error to not block users
            return { allowed: true, remaining: 999, resetTime: '' };
        }
    }

    async checkAILimit(dailyLimit: number): Promise<RateLimitStatus> {
        return this.checkAndIncrement(
            RATE_LIMIT_KEYS.AI_COUNT,
            RATE_LIMIT_KEYS.AI_DATE,
            dailyLimit
        );
    }

    async checkPlacesLimit(dailyLimit: number): Promise<RateLimitStatus> {
        return this.checkAndIncrement(
            RATE_LIMIT_KEYS.PLACES_COUNT,
            RATE_LIMIT_KEYS.PLACES_DATE,
            dailyLimit
        );
    }

    async getRemainingAI(dailyLimit: number): Promise<number> {
        try {
            const today = this.getTodayKey();
            const storedDate = await AsyncStorage.getItem(RATE_LIMIT_KEYS.AI_DATE);

            if (storedDate !== today) {
                return dailyLimit;
            }

            const count = await AsyncStorage.getItem(RATE_LIMIT_KEYS.AI_COUNT);
            return dailyLimit - (count ? parseInt(count, 10) : 0);
        } catch {
            return dailyLimit;
        }
    }
}

export const rateLimitService = new RateLimitService();
