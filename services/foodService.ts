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
        'Mutluluğunuzu kutlayacak lezzetler! 🎉',
        'Keyfinize keyif katacak öneriler! 🌟',
        'Harika hissettiğinizde harika yemekler! ✨',
    ],
    sad: [
        'Sizi sarmalayacak comfort food\'lar 🤗',
        'Moralinizi yükseltecek lezzetler 💝',
        'İçinizi ısıtacak öneriler 🌈',
    ],
    energetic: [
        'Enerjinizi koruyacak sağlıklı seçenekler! 💪',
        'Dinamik ruh halinize uygun lezzetler! ⚡',
        'Performansınızı destekleyecek yemekler! 🏃',
    ],
    tired: [
        'Sizi canlandıracak öneriler ☕',
        'Enerji deponuzu dolduracak yemekler 🔋',
        'Yorgunluğunuzu atacak lezzetler 🌟',
    ],
    stressed: [
        'Rahatlamanıza yardımcı olacak seçenekler 🧘',
        'Stresi azaltacak lezzetler 🌿',
        'Zihninizi dinlendirecek öneriler 🍃',
    ],
    relaxed: [
        'Keyfinize keyif katacak gurme seçenekler 🍷',
        'Huzurlu anlarınız için özel öneriler 🌺',
        'Rahatlamaya devam edecek lezzetler ☀️',
    ],
};

const REGIONAL_MESSAGES: Record<string, string> = {
    marmara: 'Marmara\'nın eşsiz lezzetleri sizin için! 🌊',
    ege: 'Ege\'nin sağlıklı Akdeniz mutfağı 🫒',
    akdeniz: 'Akdeniz\'in baharatlı lezzetleri 🌶️',
    icanadolu: 'İç Anadolu\'nun geleneksel tatları 🏔️',
    karadeniz: 'Karadeniz\'in zengin mutfağı 🐟',
    doguanadolu: 'Doğu\'nun otantik lezzetleri 🏔️',
    guneydogu: 'Güneydoğu\'nun efsane mutfağı 🍖',
};

const getRegionName = (regionCode: string): string => {
    const names: Record<string, string> = {
        marmara: 'Marmara',
        ege: 'Ege',
        akdeniz: 'Akdeniz',
        icanadolu: 'İç Anadolu',
        karadeniz: 'Karadeniz',
        doguanadolu: 'Doğu Anadolu',
        guneydogu: 'Güneydoğu Anadolu',
    };
    return names[regionCode] || regionCode;
};

class FoodService {
    async getSuggestions(moodId: string, city?: string, count: number = 4): Promise<FoodSuggestion> {
        // Kullanıcı tercihlerini al
        const prefs = await storageService.getPreferences();

        // Ruh haline ve bölgeye göre yemekleri al
        let foods = getRandomFoods(moodId, count * 2, city);

        // Diyet tercihlerine göre filtrele
        foods = filterFoodsByPreferences(foods, {
            isVegetarian: prefs.isVegetarian,
            isVegan: prefs.isVegan,
            isGlutenFree: prefs.isGlutenFree,
        });

        // Sayıyı sınırla
        foods = foods.slice(0, count);

        const region = city ? REGION_MAP[city] : undefined;
        const hasRegionalFoods = foods.some(f => f.regions && f.regions.length > 0);

        let message: string;
        if (region && hasRegionalFoods) {
            message = REGIONAL_MESSAGES[region] || MOOD_MESSAGES[moodId][0];
        } else {
            const messages = MOOD_MESSAGES[moodId] || MOOD_MESSAGES.happy;
            message = messages[Math.floor(Math.random() * messages.length)];
        }

        return {
            foods,
            mood: moodId,
            message,
            isRegional: !!region && hasRegionalFoods,
            regionName: region ? getRegionName(region) : undefined,
        };
    }

    async getNewSuggestions(moodId: string, excludeIds: string[], city?: string, count: number = 4): Promise<FoodSuggestion> {
        const prefs = await storageService.getPreferences();

        let allMoodFoods = getFoodsByMoodAndRegion(moodId, city);

        // Diyet tercihlerine göre filtrele
        allMoodFoods = filterFoodsByPreferences(allMoodFoods, {
            isVegetarian: prefs.isVegetarian,
            isVegan: prefs.isVegan,
            isGlutenFree: prefs.isGlutenFree,
        });

        // Daha önce gösterilmemiş yemekleri filtrele
        let availableFoods = allMoodFoods.filter(food => !excludeIds.includes(food.id));

        if (availableFoods.length < count) {
            availableFoods = allMoodFoods;
        }

        const region = city ? REGION_MAP[city] : undefined;
        const regionalFoods = region
            ? availableFoods.filter(food => food.regions?.includes(region))
            : [];
        const otherFoods = region
            ? availableFoods.filter(food => !food.regions?.includes(region))
            : availableFoods;

        const shuffledRegional = [...regionalFoods].sort(() => Math.random() - 0.5);
        const shuffledOther = [...otherFoods].sort(() => Math.random() - 0.5);

        const regionalCount = Math.min(2, shuffledRegional.length);
        const otherCount = count - regionalCount;

        const foods = [
            ...shuffledRegional.slice(0, regionalCount),
            ...shuffledOther.slice(0, otherCount),
        ].sort(() => Math.random() - 0.5);

        const hasRegionalFoods = foods.some(f => f.regions && f.regions.length > 0);

        let message: string;
        if (region && hasRegionalFoods) {
            message = REGIONAL_MESSAGES[region] || MOOD_MESSAGES[moodId][0];
        } else {
            const messages = MOOD_MESSAGES[moodId] || MOOD_MESSAGES.happy;
            message = messages[Math.floor(Math.random() * messages.length)];
        }

        return {
            foods,
            mood: moodId,
            message,
            isRegional: !!region && hasRegionalFoods,
            regionName: region ? getRegionName(region) : undefined,
        };
    }

    getAllFoodsForMood(moodId: string, city?: string): Food[] {
        return getFoodsByMoodAndRegion(moodId, city);
    }
}

export const foodService = new FoodService();
