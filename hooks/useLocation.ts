import { useState, useEffect, useCallback } from 'react';
import { locationService, LocationData } from '../services/locationService';

interface UseLocationResult {
    location: LocationData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export const useLocation = (): UseLocationResult => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLocation = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const locationData = await locationService.getCurrentLocation();

            if (locationData) {
                setLocation(locationData);
            } else {
                setError('Konum alınamadı. Lütfen konum izinlerini kontrol edin.');
            }
        } catch (err) {
            setError('Konum alınırken bir hata oluştu.');
            console.error('Location error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    return {
        location,
        loading,
        error,
        refresh: fetchLocation,
    };
};
