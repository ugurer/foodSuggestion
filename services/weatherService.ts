export interface WeatherData {
    temperature: number;
    condition: string;
    description: string;
    icon: string;
}

class WeatherService {
    private lastFetch: number = 0;
    private cachedWeather: WeatherData | null = null;
    private CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

    async getWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
        const now = Date.now();
        if (this.cachedWeather && (now - this.lastFetch < this.CACHE_DURATION)) {
            return this.cachedWeather;
        }

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&timezone=auto&forecast_days=1`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.current) {
                const temp = data.current.temperature_2m;
                const code = data.current.weather_code;

                const condition = this.mapWeatherCode(code, temp);
                this.cachedWeather = {
                    temperature: Math.round(temp),
                    ...condition
                };
                this.lastFetch = now;
                return this.cachedWeather;
            }
        } catch (error) {
            console.error('Failed to fetch weather:', error);
        }

        return null;
    }

    private mapWeatherCode(code: number, temp: number): { condition: string, description: string, icon: string } {
        // WMO Weather interpretation codes (WW)
        // https://open-meteo.com/en/docs
        if (code >= 95) return { condition: 'stormy', description: 'weather_stormy', icon: 'thunderstorm' };
        if (code >= 71) return { condition: 'snowy', description: 'weather_snowy', icon: 'snow' };
        if (code >= 51) return { condition: 'rainy', description: 'weather_rainy', icon: 'rainy' };
        if (code >= 45) return { condition: 'foggy', description: 'weather_foggy', icon: 'cloud' };
        if (code >= 1) return { condition: 'cloudy', description: 'weather_cloudy', icon: 'cloudy' };

        // Temperature based if clear
        if (temp >= 28) return { condition: 'hot', description: 'weather_hot', icon: 'sunny' };
        if (temp <= 10) return { condition: 'cold', description: 'weather_cold', icon: 'thermometer' };

        return { condition: 'clear', description: 'weather_clear', icon: 'sunny' };
    }
}

export const weatherService = new WeatherService();
