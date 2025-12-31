import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { storageService } from './storageService';
import { FOODS } from '../constants/foods';

// Bildirim ayarları
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class NotificationService {
    async requestPermission(): Promise<boolean> {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            return finalStatus === 'granted';
        } catch (error) {
            console.error('Notification permission error:', error);
            return false;
        }
    }

    async scheduleDailyNotification(hour: number = 12, minute: number = 0): Promise<void> {
        try {
            // Önce mevcut bildirimleri iptal et
            await Notifications.cancelAllScheduledNotificationsAsync();

            // Rastgele bir yemek seç
            const randomFood = FOODS[Math.floor(Math.random() * FOODS.length)];

            // Günlük bildirim planla
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🍽️ Günün Yemek Önerisi',
                    body: `${randomFood.emoji} ${randomFood.name} - ${randomFood.description}`,
                    data: { foodId: randomFood.id },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour,
                    minute,
                },
            });

            console.log('Daily notification scheduled for', hour, minute);
        } catch (error) {
            console.error('Schedule notification error:', error);
        }
    }

    async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Cancel notifications error:', error);
        }
    }

    async sendTestNotification(): Promise<void> {
        try {
            const randomFood = FOODS[Math.floor(Math.random() * FOODS.length)];

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🍽️ Test Bildirimi',
                    body: `${randomFood.emoji} ${randomFood.name} deneyin!`,
                    data: { foodId: randomFood.id },
                },
                trigger: null, // Hemen gönder
            });
        } catch (error) {
            console.error('Test notification error:', error);
        }
    }

    parseTime(timeString: string): { hour: number; minute: number } {
        const [hour, minute] = timeString.split(':').map(Number);
        return { hour: hour || 12, minute: minute || 0 };
    }

    async updateNotificationSchedule(): Promise<void> {
        const prefs = await storageService.getPreferences();

        if (prefs.notificationsEnabled) {
            const { hour, minute } = this.parseTime(prefs.notificationTime);
            await this.scheduleDailyNotification(hour, minute);
        } else {
            await this.cancelAllNotifications();
        }
    }
}

export const notificationService = new NotificationService();
