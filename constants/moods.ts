import { Colors } from './colors';

export interface Mood {
    id: string;
    label: string;
    emoji: string;
    color: string;
    description: string;
}

export const MOODS: Mood[] = [
    {
        id: 'happy',
        label: 'Mutlu',
        emoji: '😊',
        color: Colors.moods.happy,
        description: 'Harika hissediyorum!',
    },
    {
        id: 'sad',
        label: 'Üzgün',
        emoji: '😢',
        color: Colors.moods.sad,
        description: 'Biraz moral bozuk...',
    },
    {
        id: 'energetic',
        label: 'Enerjik',
        emoji: '⚡',
        color: Colors.moods.energetic,
        description: 'Enerji doluyum!',
    },
    {
        id: 'tired',
        label: 'Yorgun',
        emoji: '😴',
        color: Colors.moods.tired,
        description: 'Biraz dinlenmeliyim...',
    },
    {
        id: 'stressed',
        label: 'Stresli',
        emoji: '😤',
        color: Colors.moods.stressed,
        description: 'Çok yoğun bir gün!',
    },
    {
        id: 'relaxed',
        label: 'Rahat',
        emoji: '😌',
        color: Colors.moods.relaxed,
        description: 'Huzur içindeyim.',
    },
];

export const getMoodById = (id: string): Mood | undefined => {
    return MOODS.find(mood => mood.id === id);
};
