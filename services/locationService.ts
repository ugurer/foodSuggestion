import * as Location from 'expo-location';

export interface LocationData {
    latitude: number;
    longitude: number;
    city?: string;
    district?: string;
    country?: string;
    fullAddress?: string;
}

export interface LocationError {
    code: string;
    message: string;
}

class LocationService {
    async requestPermission(): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Konum izni hatası:', error);
            return false;
        }
    }

    async checkPermission(): Promise<boolean> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Konum izni kontrol hatası:', error);
            return false;
        }
    }

    async getCurrentLocation(): Promise<LocationData | null> {
        try {
            const hasPermission = await this.checkPermission();

            if (!hasPermission) {
                const granted = await this.requestPermission();
                if (!granted) {
                    return null;
                }
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = location.coords;

            // Reverse geocoding ile adres bilgisi al
            const addressInfo = await this.reverseGeocode(latitude, longitude);

            return {
                latitude,
                longitude,
                ...addressInfo,
            };
        } catch (error) {
            console.error('Konum alma hatası:', error);
            return null;
        }
    }

    async reverseGeocode(latitude: number, longitude: number): Promise<Partial<LocationData>> {
        try {
            const addresses = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (addresses && addresses.length > 0) {
                const address = addresses[0];

                return {
                    city: address.city || address.region || 'Bilinmeyen Şehir',
                    district: address.district || address.subregion || '',
                    country: address.country || 'Türkiye',
                    fullAddress: this.formatAddress(address),
                };
            }

            return {
                city: 'Bilinmeyen Konum',
                district: '',
                country: '',
                fullAddress: 'Konum bilgisi alınamadı',
            };
        } catch (error) {
            console.error('Adres çözümleme hatası:', error);
            return {
                city: 'Bilinmeyen Konum',
                district: '',
                country: '',
                fullAddress: 'Konum bilgisi alınamadı',
            };
        }
    }

    private formatAddress(address: Location.LocationGeocodedAddress): string {
        const parts = [
            address.street,
            address.district,
            address.city,
            address.region,
            address.country,
        ].filter(Boolean);

        return parts.join(', ') || 'Konum bilgisi alınamadı';
    }
}

export const locationService = new LocationService();
