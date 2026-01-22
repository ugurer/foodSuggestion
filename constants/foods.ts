export interface Food {
    id: string;
    name: string;
    description: string;
    name_tr?: string;
    name_en?: string;
    emoji: string;
    category: string;
    cuisine?: string; // Mutfak türü (Türk, İtalyan, Japon, vb.)
    moods: string[];
    regions?: string[];
    // Diyet bilgileri
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
}

// Türkiye bölgeleri ve şehirleri eşleştirmesi
export const REGION_MAP: Record<string, string> = {
    // Marmara Bölgesi
    'İstanbul': 'marmara',
    'Bursa': 'marmara',
    'Kocaeli': 'marmara',
    'Sakarya': 'marmara',
    'Edirne': 'marmara',
    'Tekirdağ': 'marmara',
    'Çanakkale': 'marmara',
    'Balıkesir': 'marmara',
    // Ege Bölgesi
    'İzmir': 'ege',
    'Aydın': 'ege',
    'Muğla': 'ege',
    'Denizli': 'ege',
    'Manisa': 'ege',
    'Afyon': 'ege',
    'Afyonkarahisar': 'ege',
    // Akdeniz Bölgesi
    'Antalya': 'akdeniz',
    'Adana': 'akdeniz',
    'Mersin': 'akdeniz',
    'Hatay': 'akdeniz',
    'Gaziantep': 'guneydogu',
    'Kahramanmaraş': 'akdeniz',
    // İç Anadolu Bölgesi
    'Ankara': 'icanadolu',
    'Konya': 'icanadolu',
    'Eskişehir': 'icanadolu',
    'Kayseri': 'icanadolu',
    'Sivas': 'icanadolu',
    'Nevşehir': 'icanadolu',
    // Karadeniz Bölgesi
    'Trabzon': 'karadeniz',
    'Samsun': 'karadeniz',
    'Rize': 'karadeniz',
    'Ordu': 'karadeniz',
    'Giresun': 'karadeniz',
    'Artvin': 'karadeniz',
    // Doğu Anadolu Bölgesi
    'Erzurum': 'doguanadolu',
    'Van': 'doguanadolu',
    'Malatya': 'doguanadolu',
    'Elazığ': 'doguanadolu',
    'Kars': 'doguanadolu',
    // Güneydoğu Anadolu Bölgesi
    'Diyarbakır': 'guneydogu',
    'Şanlıurfa': 'guneydogu',
    'Mardin': 'guneydogu',
};

export const FOODS: Food[] = [
    // Genel yemekler - Vejetaryen
    {
        id: 'pizza_veg',
        name: 'Sebzeli Pizza',
        description: 'Bol sebzeli, sağlıklı İtalyan pizzası',
        emoji: '🍕',
        category: 'Fast Food',
        cuisine: 'italian',
        moods: ['happy', 'energetic', 'relaxed'],
        isVegetarian: true,
        isGlutenFree: false,
    },
    {
        id: 'pasta',
        name: 'Makarna',
        description: 'Kremalı veya domatesli soslu nefis makarna',
        emoji: '🍝',
        category: 'Ana Yemek',
        cuisine: 'italian',
        moods: ['happy', 'sad', 'tired'],
        isVegetarian: true,
    },
    {
        id: 'sushi_veg',
        name: 'Sebze Sushi',
        description: 'Avokado ve sebzeli vejetaryen sushi',
        emoji: '🍣',
        category: 'Dünya Mutfağı',
        cuisine: 'japanese',
        moods: ['happy', 'relaxed'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'burger',
        name: 'Hamburger',
        description: 'Ev yapımı köfteli, özel soslu burger',
        emoji: '🍔',
        category: 'Fast Food',
        cuisine: 'american',
        moods: ['happy', 'energetic', 'stressed'],
    },
    {
        id: 'soup',
        name: 'Mercimek Çorbası',
        description: 'Geleneksel Türk mercimek çorbası',
        emoji: '🍲',
        category: 'Geleneksel',
        cuisine: 'turkish',
        moods: ['sad', 'tired', 'relaxed'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'kebab_antep',
        name: 'Antep Kebabı',
        description: 'Gaziantep\'in meşhur baharatlı kebabı',
        emoji: '🍖',
        category: 'Bölgesel',
        cuisine: 'turkish',
        moods: ['happy', 'relaxed', 'energetic'],
        regions: ['guneydogu'],
        isGlutenFree: true,
    },
    {
        id: 'kunefe',
        name: 'Künefe',
        description: 'Hatay\'ın peynirli, şerbetli tatlısı',
        emoji: '🍮',
        category: 'Bölgesel Tatlı',
        cuisine: 'turkish',
        moods: ['happy', 'sad', 'relaxed'],
        regions: ['akdeniz', 'guneydogu'],
        isVegetarian: true,
    },
    {
        id: 'chocolate',
        name: 'Çikolata',
        description: 'Sütlü veya bitter, mutluluk veren chıkolata',
        emoji: '🍫',
        category: 'Tatlı',
        cuisine: 'snack',
        moods: ['sad', 'stressed', 'happy'],
        isVegetarian: true,
        isGlutenFree: true,
    },
    {
        id: 'icecream',
        name: 'Dondurma',
        description: 'Çeşit çeşit lezzetlerde taze dondurma',
        emoji: '🍦',
        category: 'Tatlı',
        cuisine: 'world',
        moods: ['sad', 'happy', 'relaxed'],
        isVegetarian: true,
        isGlutenFree: true,
    },
    {
        id: 'salad',
        name: 'Yeşil Salata',
        description: 'Taze sebzelerle hazırlanmış sağlıklı salata',
        emoji: '🥗',
        category: 'Sağlıklı',
        cuisine: 'world',
        moods: ['energetic', 'relaxed'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'smoothie',
        name: 'Smoothie',
        description: 'Meyveli, vitaminli enerji içeceği',
        emoji: '🥤',
        category: 'İçecek',
        cuisine: 'world',
        moods: ['energetic', 'happy'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'coffee',
        name: 'Kahve',
        description: 'Enerji veren sıcak veya soğuk kahve',
        emoji: '☕',
        category: 'İçecek',
        cuisine: 'world',
        moods: ['tired', 'stressed'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'tea',
        name: 'Bitki Çayı',
        description: 'Papatya veya nane çayı ile rahatlayın',
        emoji: '🍵',
        category: 'İçecek',
        cuisine: 'world',
        moods: ['stressed', 'relaxed', 'tired'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'nuts',
        name: 'Kuruyemiş',
        description: 'Ceviz, badem, fındık karışımı',
        emoji: '🥜',
        category: 'Atıştırmalık',
        cuisine: 'turkish',
        moods: ['stressed', 'tired', 'energetic'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'falafel',
        name: 'Falafel',
        description: 'Nohutlu, baharatlı vegan köfte',
        emoji: '🧆',
        category: 'Dünya Mutfağı',
        cuisine: 'middle_eastern',
        moods: ['happy', 'energetic'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'hummus',
        name: 'Humus',
        description: 'Tahin ve nohutlu sağlıklı meze',
        emoji: '🥙',
        category: 'Meze',
        cuisine: 'middle_eastern',
        moods: ['relaxed', 'energetic'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'taco',
        name: 'Taco',
        description: 'Meksika usulü acılı etli veya sebzeli taco',
        emoji: '🌮',
        category: 'Dünya Mutfağı',
        cuisine: 'mexican',
        moods: ['happy', 'energetic'],
        isGlutenFree: true,
    },
    {
        id: 'ramen',
        name: 'Ramen',
        description: 'Zengin aromalı, noodle dolu Japon çorbası',
        emoji: '🍜',
        category: 'Dünya Mutfağı',
        cuisine: 'japanese',
        moods: ['happy', 'tired', 'sad'],
    },
    {
        id: 'butter_chicken',
        name: 'Butter Chicken',
        description: 'Baharatlı ve kremalı Hint tavuk yemeği',
        emoji: '🥘',
        category: 'Dünya Mutfağı',
        cuisine: 'indian',
        moods: ['happy', 'relaxed'],
        isGlutenFree: true,
    },

    // BÖLGESEL YEMEKLER

    // Güneydoğu Anadolu
    {
        id: 'baklava_antep',
        name: 'Antep Baklavası',
        description: 'Fıstıklı, şerbetli gerçek Antep baklavası',
        emoji: '🥮',
        category: 'Bölgesel Tatlı',
        cuisine: 'Türk',
        moods: ['happy', 'sad', 'relaxed'],
        regions: ['guneydogu'],
        isVegetarian: true,
    },
    {
        id: 'lahmacun_urfa',
        name: 'Urfa Lahmacunu',
        description: 'İnce hamurlu, acılı Urfa lahmacunu',
        emoji: '🫓',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'energetic', 'tired'],
        regions: ['guneydogu'],
    },
    {
        id: 'cig_kofte',
        name: 'Çiğ Köfte',
        description: 'Acılı, baharatlı vejetaryen çiğ köfte',
        emoji: '🥙',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['energetic', 'happy'],
        regions: ['guneydogu'],
        isVegetarian: true,
        isVegan: true,
    },
    {
        id: 'katmer',
        name: 'Katmer',
        description: 'Kaymak ve fıstıklı Gaziantep katmeri',
        emoji: '🥞',
        category: 'Bölgesel Tatlı',
        cuisine: 'Türk',
        moods: ['happy', 'relaxed'],
        regions: ['guneydogu'],
        isVegetarian: true,
    },

    // Karadeniz Bölgesi
    {
        id: 'kuymak',
        name: 'Kuymak (Muhlama)',
        description: 'Karadeniz\'in meşhur peynirli mısır unu yemeği',
        emoji: '🧀',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['sad', 'tired', 'relaxed'],
        regions: ['karadeniz'],
        isVegetarian: true,
        isGlutenFree: true,
    },
    {
        id: 'hamsi',
        name: 'Hamsi Tava',
        description: 'Karadeniz\'in vazgeçilmez taze hamsi',
        emoji: '🐟',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'energetic'],
        regions: ['karadeniz'],
        isGlutenFree: true,
    },
    {
        id: 'pide_karadeniz',
        name: 'Karadeniz Pidesi',
        description: 'Tereyağlı, yumurtalı Trabzon pidesi',
        emoji: '🥖',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'tired', 'relaxed'],
        regions: ['karadeniz'],
        isVegetarian: true,
    },
    {
        id: 'laz_boregi',
        name: 'Laz Böreği',
        description: 'Tatlı muhallebili Karadeniz böreği',
        emoji: '🥧',
        category: 'Bölgesel Tatlı',
        cuisine: 'Türk',
        moods: ['happy', 'sad', 'relaxed'],
        regions: ['karadeniz'],
        isVegetarian: true,
    },

    // Ege Bölgesi
    {
        id: 'zeytinyagli',
        name: 'Zeytinyağlılar',
        description: 'Ege\'nin sağlıklı zeytinyağlı yemekleri',
        emoji: '🫒',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['relaxed', 'energetic', 'happy'],
        regions: ['ege'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'boyoz',
        name: 'Boyoz',
        description: 'İzmir\'in meşhur kahvaltı lezzeti',
        emoji: '🥐',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'tired'],
        regions: ['ege'],
        isVegetarian: true,
    },
    {
        id: 'kumru',
        name: 'Kumru',
        description: 'İzmir\'in özel sandviçi sucuk ve kaşarlı',
        emoji: '🥪',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'energetic'],
        regions: ['ege'],
    },
    {
        id: 'lokma',
        name: 'İzmir Lokması',
        description: 'Şerbetli, çıtır çıtır İzmir lokması',
        emoji: '🍩',
        category: 'Bölgesel Tatlı',
        cuisine: 'Türk',
        moods: ['happy', 'sad'],
        regions: ['ege'],
        isVegetarian: true,
    },

    // Akdeniz Bölgesi
    {
        id: 'adana_kebab',
        name: 'Adana Kebabı',
        description: 'Acılı, el yapımı gerçek Adana kebabı',
        emoji: '🍢',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'energetic', 'stressed'],
        regions: ['akdeniz'],
        isGlutenFree: true,
    },
    {
        id: 'salgam',
        name: 'Şalgam',
        description: 'Adana\'nın vazgeçilmez içeceği',
        emoji: '🧃',
        category: 'Bölgesel İçecek',
        cuisine: 'Türk',
        moods: ['energetic', 'happy'],
        regions: ['akdeniz'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'tantuni',
        name: 'Tantuni',
        description: 'Mersin\'in meşhur et dürümü',
        emoji: '🌯',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'energetic', 'tired'],
        regions: ['akdeniz'],
    },

    // İç Anadolu Bölgesi
    {
        id: 'manti_kayseri',
        name: 'Kayseri Mantısı',
        description: 'Yoğurtlu, salçalı küçük mantılar',
        emoji: '🥟',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['sad', 'relaxed', 'happy'],
        regions: ['icanadolu'],
        isVegetarian: true,
    },
    {
        id: 'etli_ekmek',
        name: 'Konya Etli Ekmek',
        description: 'Uzun, ince Konya etli ekmeği',
        emoji: '🥖',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'tired', 'energetic'],
        regions: ['icanadolu'],
    },
    {
        id: 'pastirma',
        name: 'Pastırma',
        description: 'Kayseri\'nin dünyaca ünlü pastırması',
        emoji: '🥩',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'energetic'],
        regions: ['icanadolu'],
        isGlutenFree: true,
    },
    {
        id: 'ankara_tava',
        name: 'Ankara Tava',
        description: 'Ankara\'nın geleneksel et yemeği',
        emoji: '🍳',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'tired', 'relaxed'],
        regions: ['icanadolu'],
        isGlutenFree: true,
    },

    // Marmara Bölgesi
    {
        id: 'iskender',
        name: 'İskender Kebab',
        description: 'Bursa\'nın meşhur tereyağlı iskenderi',
        emoji: '🍖',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'relaxed', 'tired'],
        regions: ['marmara'],
    },
    {
        id: 'inegol_kofte',
        name: 'İnegöl Köfte',
        description: 'Bursa İnegöl\'ün özel köftesi',
        emoji: '🍖',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'energetic'],
        regions: ['marmara'],
        isGlutenFree: true,
    },
    {
        id: 'kestane_sekeri',
        name: 'Kestane Şekeri',
        description: 'Bursa\'nın tatlı kestane şekeri',
        emoji: '🌰',
        category: 'Bölgesel Tatlı',
        cuisine: 'Türk',
        moods: ['happy', 'sad', 'relaxed'],
        regions: ['marmara'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
    {
        id: 'balik_ekmek',
        name: 'Balık Ekmek',
        description: 'İstanbul Eminönü\'nün simgesi',
        emoji: '🐟',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'relaxed'],
        regions: ['marmara'],
    },
    {
        id: 'kokorec',
        name: 'Kokoreç',
        description: 'İstanbul sokak lezzeti',
        emoji: '🌯',
        category: 'Sokak Lezzeti',
        cuisine: 'Türk',
        moods: ['happy', 'energetic', 'tired'],
        regions: ['marmara'],
        isGlutenFree: true,
    },

    // Doğu Anadolu Bölgesi
    {
        id: 'cag_kebabi',
        name: 'Cağ Kebabı',
        description: 'Erzurum\'un yatay döner kebabı',
        emoji: '🍖',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'energetic'],
        regions: ['doguanadolu'],
        isGlutenFree: true,
    },
    {
        id: 'kars_gravyer',
        name: 'Kars Gravyeri ile Kahvaltı',
        description: 'Kars\'ın ünlü gravyer peyniri',
        emoji: '🧀',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['happy', 'relaxed'],
        regions: ['doguanadolu'],
        isVegetarian: true,
        isGlutenFree: true,
    },
    {
        id: 'kadayif_dolmasi',
        name: 'Kadayıf Dolması',
        description: 'Malatya\'nın cevizli tatlısı',
        emoji: '🥮',
        category: 'Bölgesel Tatlı',
        cuisine: 'Türk',
        moods: ['happy', 'sad', 'relaxed'],
        regions: ['doguanadolu'],
        isVegetarian: true,
    },
    {
        id: 'kuru_kayisi',
        name: 'Malatya Kayısısı',
        description: 'Dünyaca ünlü Malatya kuru kayısısı',
        emoji: '🍑',
        category: 'Bölgesel',
        cuisine: 'Türk',
        moods: ['energetic', 'happy', 'tired'],
        regions: ['doguanadolu'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
    },
];

// Mutfak listesini dinamik olarak çekmek için
export const CUISINES = [...new Set(FOODS.map(f => f.cuisine).filter(Boolean))] as string[];

export const getFoodsByMood = (moodId: string): Food[] => {
    return FOODS.filter(food => food.moods.includes(moodId));
};

export const getFoodsByMoodAndRegion = (moodId: string, city?: string): Food[] => {
    const region = city ? REGION_MAP[city] : undefined;
    const moodFoods = FOODS.filter(food => food.moods.includes(moodId));

    if (!region) {
        return moodFoods;
    }

    const regionalFoods = moodFoods.filter(food => food.regions?.includes(region));
    const otherFoods = moodFoods.filter(food => !food.regions?.includes(region));

    return [...regionalFoods, ...otherFoods];
};

export const filterFoodsByPreferences = (
    foods: Food[],
    preferences: { isVegetarian?: boolean; isVegan?: boolean; isGlutenFree?: boolean }
): Food[] => {
    return foods.filter(food => {
        if (preferences.isVegan && !food.isVegan) return false;
        if (preferences.isVegetarian && !food.isVegetarian) return false;
        if (preferences.isGlutenFree && !food.isGlutenFree) return false;
        return true;
    });
};

export const getRandomFoods = (moodId: string, count: number = 3, city?: string): Food[] => {
    const moodFoods = getFoodsByMoodAndRegion(moodId, city);
    const region = city ? REGION_MAP[city] : undefined;
    const regionalFoods = region
        ? moodFoods.filter(food => food.regions?.includes(region))
        : [];
    const otherFoods = region
        ? moodFoods.filter(food => !food.regions?.includes(region))
        : moodFoods;

    const shuffledRegional = [...regionalFoods].sort(() => Math.random() - 0.5);
    const shuffledOther = [...otherFoods].sort(() => Math.random() - 0.5);

    const regionalCount = Math.min(2, shuffledRegional.length);
    const otherCount = count - regionalCount;

    const result = [
        ...shuffledRegional.slice(0, regionalCount),
        ...shuffledOther.slice(0, otherCount),
    ];

    return result.sort(() => Math.random() - 0.5);
};
