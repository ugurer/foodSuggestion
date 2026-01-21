import { API_CONFIG } from '../constants/apiConfig';
import { rateLimitService } from './rateLimitService';

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
    isConfigured(): boolean {
        return true; // Always configured when using backend proxy
    }

    async initialize(): Promise<boolean> {
        return true;
    }

    async searchNearbyRestaurants(
        foodName: string,
        latitude: number,
        longitude: number,
        radius: number = 2000
    ): Promise<NearbyRestaurant[]> {
        // Check rate limit
        const rateCheck = await rateLimitService.checkPlacesLimit(API_CONFIG.limits.placesSearches);
        if (!rateCheck.allowed) {
            console.log('Places rate limit exceeded');
            return [];
        }

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.placesSearch}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `${foodName} restaurant`,
                    latitude,
                    longitude,
                    radius,
                }),
            });

            if (!response.ok) {
                console.error('Backend error:', response.status);
                return [];
            }

            const data = await response.json();

            if (data.error) {
                console.error('Places API error:', data.error);
                return [];
            }

            return this.transformPlaces(data.places || [], latitude, longitude);
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
        // Check rate limit
        const rateCheck = await rateLimitService.checkPlacesLimit(API_CONFIG.limits.placesSearches);
        if (!rateCheck.allowed) {
            console.log('Places rate limit exceeded');
            return [];
        }

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.placesNearby}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude, longitude, radius }),
            });

            if (!response.ok) {
                console.error('Backend error:', response.status);
                return [];
            }

            const data = await response.json();

            if (data.error) {
                console.error('Places API error:', data.error);
                return [];
            }

            return this.transformPlaces(data.places || [], latitude, longitude);
        } catch (error) {
            console.error('Search nearby error:', error);
            return [];
        }
    }

    private transformPlaces(places: any[], userLat: number, userLon: number): NearbyRestaurant[] {
        return places.map((place: any) => ({
            id: place.id,
            name: place.displayName?.text || '',
            address: place.formattedAddress || '',
            rating: place.rating,
            userRatingsTotal: place.userRatingCount,
            priceLevel: this.mapPriceLevel(place.priceLevel),
            isOpen: place.currentOpeningHours?.openNow,
            photoUrl: place.photoUrl || undefined,
            types: place.types || [],
            distance: place.location
                ? this.calculateDistance(userLat, userLon, place.location.latitude, place.location.longitude)
                : '',
            reviews: (place.reviews || []).slice(0, 2).map((r: any) => ({
                name: r.authorAttribution?.displayName || 'Anonim',
                relativePublishTimeDescription: r.relativePublishTimeDescription || '',
                rating: r.rating,
                text: r.text?.text || '',
                authorPhotoUri: r.authorAttribution?.photoUri,
            })),
        }));
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
