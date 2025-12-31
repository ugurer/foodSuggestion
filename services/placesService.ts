import AsyncStorage from '@react-native-async-storage/async-storage';

const PLACES_API_KEY_STORAGE = '@suggest_food_places_api_key';

export interface Review {
    name: string;
    relativePublishTimeDescription: string;
    rating: number;
    text: string;
    authorPhotoUri?: string;
}

export interface NearbyRestaurant {
    id: string;
    name: string;
    address: string;
    rating?: number;
    userRatingsTotal?: number;
    priceLevel?: string;
    isOpen?: boolean;
    distance?: string;
    photoUrl?: string;
    types: string[];
    reviews?: Review[];
}

class PlacesService {
    private apiKey: string = '';

    async initialize(): Promise<boolean> {
        try {
            const key = await AsyncStorage.getItem(PLACES_API_KEY_STORAGE);
            if (key && key.length > 0) {
                this.apiKey = key;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Places init error:', error);
            return false;
        }
    }

    async setApiKey(key: string): Promise<boolean> {
        try {
            await AsyncStorage.setItem(PLACES_API_KEY_STORAGE, key);
            this.apiKey = key;
            return true;
        } catch (error) {
            console.error('Set Places API key error:', error);
            return false;
        }
    }

    async getApiKey(): Promise<string> {
        try {
            const key = await AsyncStorage.getItem(PLACES_API_KEY_STORAGE);
            return key || '';
        } catch {
            return '';
        }
    }

    isConfigured(): boolean {
        return this.apiKey.length > 0;
    }

    async searchNearbyRestaurants(
        foodName: string,
        latitude: number,
        longitude: number,
        radius: number = 2000
    ): Promise<NearbyRestaurant[]> {
        if (!this.apiKey) {
            await this.initialize();
            if (!this.apiKey) return [];
        }

        try {
            // Places API (New) - Text Search
            const url = 'https://places.googleapis.com/v1/places:searchText';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.photos,places.types,places.location,places.reviews',
                },
                body: JSON.stringify({
                    textQuery: `${foodName} restaurant`,
                    locationBias: {
                        circle: {
                            center: { latitude, longitude },
                            radius: radius,
                        },
                    },
                    languageCode: 'tr',
                    maxResultCount: 5,
                }),
            });

            const data = await response.json();

            if (data.error) {
                console.error('Places API error:', data.error);
                return [];
            }

            const restaurants: NearbyRestaurant[] = (data.places || []).map((place: any) => ({
                id: place.id,
                name: place.displayName?.text || '',
                address: place.formattedAddress || '',
                rating: place.rating,
                userRatingsTotal: place.userRatingCount,
                priceLevel: this.mapPriceLevel(place.priceLevel),
                isOpen: place.currentOpeningHours?.openNow,
                photoUrl: place.photos?.[0]?.name
                    ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&key=${this.apiKey}`
                    : undefined,
                types: place.types || [],
                distance: place.location
                    ? this.calculateDistance(latitude, longitude, place.location.latitude, place.location.longitude)
                    : '',
                reviews: (place.reviews || []).slice(0, 2).map((r: any) => ({
                    name: r.authorAttribution?.displayName || 'Anonim',
                    relativePublishTimeDescription: r.relativePublishTimeDescription || '',
                    rating: r.rating,
                    text: r.text?.text || '',
                    authorPhotoUri: r.authorAttribution?.photoUri,
                })),
            }));

            return restaurants;
        } catch (error) {
            console.error('Search restaurants error:', error);
            return [];
        }
    }

    async searchNearbyByType(
        latitude: number,
        longitude: number,
        radius: number = 1500
    ): Promise<NearbyRestaurant[]> {
        if (!this.apiKey) {
            await this.initialize();
            if (!this.apiKey) return [];
        }

        try {
            // Places API (New) - Nearby Search
            const url = 'https://places.googleapis.com/v1/places:searchNearby';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.photos,places.types,places.location,places.reviews',
                },
                body: JSON.stringify({
                    includedTypes: ['restaurant'],
                    locationRestriction: {
                        circle: {
                            center: { latitude, longitude },
                            radius: radius,
                        },
                    },
                    languageCode: 'tr',
                    maxResultCount: 8,
                }),
            });

            const data = await response.json();

            if (data.error) {
                console.error('Places API error:', data.error);
                return [];
            }

            const restaurants: NearbyRestaurant[] = (data.places || []).map((place: any) => ({
                id: place.id,
                name: place.displayName?.text || '',
                address: place.formattedAddress || '',
                rating: place.rating,
                userRatingsTotal: place.userRatingCount,
                priceLevel: this.mapPriceLevel(place.priceLevel),
                isOpen: place.currentOpeningHours?.openNow,
                photoUrl: place.photos?.[0]?.name
                    ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&key=${this.apiKey}`
                    : undefined,
                types: place.types || [],
                distance: place.location
                    ? this.calculateDistance(latitude, longitude, place.location.latitude, place.location.longitude)
                    : '',
                reviews: (place.reviews || []).slice(0, 2).map((r: any) => ({
                    name: r.authorAttribution?.displayName || 'Anonim',
                    relativePublishTimeDescription: r.relativePublishTimeDescription || '',
                    rating: r.rating,
                    text: r.text?.text || '',
                    authorPhotoUri: r.authorAttribution?.photoUri,
                })),
            }));

            return restaurants;
        } catch (error) {
            console.error('Search nearby error:', error);
            return [];
        }
    }

    private mapPriceLevel(level?: string): string {
        const priceMap: Record<string, string> = {
            'PRICE_LEVEL_FREE': '',
            'PRICE_LEVEL_INEXPENSIVE': '₺',
            'PRICE_LEVEL_MODERATE': '₺₺',
            'PRICE_LEVEL_EXPENSIVE': '₺₺₺',
            'PRICE_LEVEL_VERY_EXPENSIVE': '₺₺₺₺',
        };
        return level ? priceMap[level] || '' : '';
    }

    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2?: number,
        lon2?: number
    ): string {
        if (!lat2 || !lon2) return '';

        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance < 1) {
            return `${Math.round(distance * 1000)} m`;
        }
        return `${distance.toFixed(1)} km`;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    getPriceLevelText(level?: string): string {
        return level || '';
    }
}

export const placesService = new PlacesService();
