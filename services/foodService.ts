import { Food, getRandomFoods, FOODS, REGION_MAP, getFoodsByMoodAndRegion, filterFoodsByPreferences } from '../constants/foods';
import { storageService, UserPreferences } from './storageService';

export interface FoodSuggestion {
    foods: Food[];
    mood: string;
    message: string;
    isRegional: boolean;
    regionName?: string;
}

const MOOD_MESSAGES: Record<string, string[]> = {
    happy: [
        'suggestion_msg_happy_0',
        'suggestion_msg_happy_1',
        'suggestion_msg_happy_2',
    ],
    sad: [
        'suggestion_msg_sad_0',
        'suggestion_msg_sad_1',
        'suggestion_msg_sad_2',
    ],
    energetic: [
        'suggestion_msg_energetic_0',
        'suggestion_msg_energetic_1',
        'suggestion_msg_energetic_2',
    ],
    tired: [
        'suggestion_msg_tired_0',
        'suggestion_msg_tired_1',
        'suggestion_msg_tired_2',
    ],
    stressed: [
        'suggestion_msg_stressed_0',
        'suggestion_msg_stressed_1',
        'suggestion_msg_stressed_2',
    ],
    relaxed: [
        'suggestion_msg_relaxed_0',
        'suggestion_msg_relaxed_1',
        'suggestion_msg_relaxed_2',
    ],
};

const REGIONAL_MESSAGES: Record<string, string> = {
    marmara: 'suggestion_msg_marmara',
    ege: 'suggestion_msg_ege',
    akdeniz: 'suggestion_msg_akdeniz',
    icanadolu: 'suggestion_msg_icanadolu',
    karadeniz: 'suggestion_msg_karadeniz',
    doguanadolu: 'suggestion_msg_doguanadolu',
    guneydogu: 'suggestion_msg_guneydogu',
};

const getRegionName = (regionCode: string): string => {
    return `region_${regionCode}`;
};

const API_URL = 'https://food-suggestion-api.ugurer.workers.dev/api/foods';

class FoodService {
    private cachedFoods: Food[] | null = null;

    async getFoods(region?: string): Promise<Food[]> {
        // If we want a specific region, don't use cache if cache is global
        if (!region && this.cachedFoods) return this.cachedFoods;

        const prefs = await storageService.getPreferences();
        const lang = prefs.language === 'auto' ? 'tr' : prefs.language;

        try {
            const url = region ? `${API_URL}?region=${region}` : API_URL;
            const response = await fetch(url);
            const data = await response.json();
            if (data.foods) {
                // Map API field names to frontend Food interface if necessary
                const foods = data.foods.map((f: any) => ({
                    ...f,
                    name_tr: f.name_tr,
                    name_en: f.name_en,
                    name: (lang === 'tr' ? f.name_tr : f.name_en) || f.name_tr,
                    description: (lang === 'tr' ? f.description_tr : f.description_en) || f.description_tr,
                }));

                if (!region) this.cachedFoods = foods;
                return foods;
            }
        } catch (error) {
            console.error('Failed to fetch foods from API:', error);
        }

        // Fallback to local data
        return region ? FOODS.filter(f => f.regions?.includes(region)) : FOODS;
    }

    async getRegionalHighlights(city?: string): Promise<{ foods: Food[], isRegional: boolean }> {
        const region = city ? REGION_MAP[city] : undefined;

        if (region) {
            const regionalFoods = await this.getFoods(region);
            if (regionalFoods.length > 0) {
                return {
                    foods: this.shuffle(regionalFoods).slice(0, 5),
                    isRegional: true
                };
            }
        }

        // Fallback: Show globally popular/random foods if no regional data or no city
        const allFoods = await this.getFoods();
        return {
            foods: this.shuffle(allFoods).slice(0, 5),
            isRegional: false
        };
    }

    async getWeatherHighlights(temperature: number, condition: string): Promise<Food[]> {
        const allFoods = await this.getFoods();
        let filtered: Food[] = [];

        // Mapping conditions to food moods/cuisines/types
        if (condition === 'hot' || temperature > 28) {
            // Cold/Refreshing foods
            filtered = allFoods.filter(f =>
                f.moods.includes('relaxed') ||
                (f.cuisine && ['japanese', 'modern', 'snack', 'healthy'].includes(f.cuisine)) ||
                f.name_en?.toLowerCase().includes('ice cream') ||
                f.name_en?.toLowerCase().includes('salad') ||
                f.name_en?.toLowerCase().includes('juice') ||
                f.name.toLowerCase().includes('dondurma')
            );
        } else if (condition === 'cold' || temperature < 15 || condition === 'rainy' || condition === 'snowy') {
            // Warm/Hearty foods
            filtered = allFoods.filter(f =>
                f.moods.includes('tired') ||
                f.name_en?.toLowerCase().includes('soup') ||
                f.name_en?.toLowerCase().includes('stew') ||
                f.name_en?.toLowerCase().includes('kebab') ||
                f.name_en?.toLowerCase().includes('pide') ||
                f.name_en?.toLowerCase().includes('tea') ||
                f.name.toLowerCase().includes('corba') ||
                f.name.toLowerCase().includes('sıcak')
            );
        } else {
            // Neutral/Clear weather - balanced mix
            filtered = allFoods.filter(f => f.moods.includes('happy') || f.moods.includes('energetic'));
        }

        return this.shuffle(filtered).slice(0, 5);
    }

    async getFoodById(foodId: string): Promise<Food | null> {
        const allFoods = await this.getFoods();
        return allFoods.find(f => f.id === foodId) || null;
    }

    private shuffle<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    async getSuggestions(moodId: string, city?: string, count: number = 4, cuisine?: string): Promise<FoodSuggestion> {
        const foodsData = await this.getFoods();
        const prefs = await storageService.getPreferences();
        const history = await storageService.getHistory();
        const recentlySeenIds = history.slice(0, 10).map(h => h.food.id);

        // Ruh haline ve bölgeye göre filtreleme
        const region = city ? REGION_MAP[city] : undefined;
        let moodFoods = foodsData.filter(food => food.moods.includes(moodId));

        // Mutfak tercihine göre filtrele
        const targetCuisine = cuisine || prefs.preferredCuisine;
        if (targetCuisine) {
            const filteredByCuisine = moodFoods.filter(f => f.cuisine === targetCuisine);
            if (filteredByCuisine.length > 0) {
                moodFoods = filteredByCuisine;
            }
        }

        // Diyet tercihlerine göre filtrele
        let filtered = filterFoodsByPreferences(moodFoods, {
            isVegetarian: prefs.isVegetarian,
            isVegan: prefs.isVegan,
            isGlutenFree: prefs.isGlutenFree,
        });

        // Repitition avoidance: recently seen items last
        const rareFoods = filtered.filter(f => !recentlySeenIds.includes(f.id));
        const repeatedFoods = filtered.filter(f => recentlySeenIds.includes(f.id));

        // Bölgesel önceliklendirme (rare olanlar içinden)
        const regionalFoods = region
            ? rareFoods.filter(food => food.regions?.includes(region))
            : [];
        const otherFoods = region
            ? rareFoods.filter(food => !food.regions?.includes(region))
            : rareFoods;

        const shuffledRegional = this.shuffle(regionalFoods);
        const shuffledOther = this.shuffle([...otherFoods, ...repeatedFoods]);

        const regionalCount = Math.min(2, shuffledRegional.length);
        const otherCount = count - regionalCount;

        const resultFoods = [
            ...shuffledRegional.slice(0, regionalCount),
            ...shuffledOther.slice(0, otherCount),
        ];

        // Final shuffle of the selection
        const finalSelection = this.shuffle(resultFoods);

        const hasRegionalFoods = finalSelection.some(f => f.regions && f.regions.length > 0);

        let message: string;
        if (region && hasRegionalFoods) {
            message = REGIONAL_MESSAGES[region] || MOOD_MESSAGES[moodId][0];
        } else {
            const messages = MOOD_MESSAGES[moodId] || MOOD_MESSAGES.happy;
            message = messages[Math.floor(Math.random() * messages.length)];
        }

        return {
            foods: finalSelection,
            mood: moodId,
            message,
            isRegional: !!region && hasRegionalFoods,
            regionName: region ? getRegionName(region) : undefined,
        };
    }

    async getNewSuggestions(moodId: string, excludeIds: string[], city?: string, count: number = 4, cuisine?: string): Promise<FoodSuggestion> {
        const foodsData = await this.getFoods();
        const prefs = await storageService.getPreferences();

        const region = city ? REGION_MAP[city] : undefined;
        let allMoodFoods = foodsData.filter(food => food.moods.includes(moodId));

        // Diyet tercihlerine göre filtrele
        allMoodFoods = filterFoodsByPreferences(allMoodFoods, {
            isVegetarian: prefs.isVegetarian,
            isVegan: prefs.isVegan,
            isGlutenFree: prefs.isGlutenFree,
        });

        // Mutfak tercihine göre filtrele
        const targetCuisine = cuisine || prefs.preferredCuisine;
        if (targetCuisine) {
            const filteredByCuisine = allMoodFoods.filter(f => f.cuisine === targetCuisine);
            if (filteredByCuisine.length >= count) {
                allMoodFoods = filteredByCuisine;
            }
        }

        // Daha önce gösterilmemiş yemekleri filtrele
        let availableFoods = allMoodFoods.filter(food => !excludeIds.includes(food.id));

        if (availableFoods.length < count) {
            availableFoods = allMoodFoods;
        }

        const regionalFoods = region
            ? availableFoods.filter(food => food.regions?.includes(region))
            : [];
        const otherFoods = region
            ? availableFoods.filter(food => !food.regions?.includes(region))
            : availableFoods;

        const shuffledRegional = this.shuffle(regionalFoods);
        const shuffledOther = this.shuffle(otherFoods);

        const regionalCount = Math.min(2, shuffledRegional.length);
        const otherCount = count - regionalCount;

        const resultFoods = this.shuffle([
            ...shuffledRegional.slice(0, regionalCount),
            ...shuffledOther.slice(0, otherCount),
        ]);

        const hasRegionalFoods = resultFoods.some(f => f.regions && f.regions.length > 0);

        let message: string;
        if (region && hasRegionalFoods) {
            message = REGIONAL_MESSAGES[region] || MOOD_MESSAGES[moodId][0];
        } else {
            const messages = MOOD_MESSAGES[moodId] || MOOD_MESSAGES.happy;
            message = messages[Math.floor(Math.random() * messages.length)];
        }

        return {
            foods: resultFoods,
            mood: moodId,
            message,
            isRegional: !!region && hasRegionalFoods,
            regionName: region ? getRegionName(region) : undefined,
        };
    }

    async getAllFoodsForMood(moodId: string, city?: string): Promise<Food[]> {
        const foodsData = await this.getFoods();
        return foodsData.filter(f => f.moods.includes(moodId));
    }
}

export const foodService = new FoodService();
