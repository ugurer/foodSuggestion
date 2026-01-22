/**
 * Premium Color Palette
 * Modern, professional design inspired by high-end food apps
 */

// Premium color palette - warm and inviting
export const Colors = {
    // Primary - Rich Amber/Orange tones
    primary: '#E67E22',
    primaryLight: '#F39C12',
    primaryDark: '#D35400',

    // Secondary - Deep Teal for contrast
    secondary: '#16A085',
    secondaryLight: '#1ABC9C',
    secondaryDark: '#0E6655',

    // Accent - Warm coral
    accent: '#E74C3C',
    accentLight: '#EC7063',

    // Backgrounds - Warm neutrals
    background: '#1A1A2E',
    backgroundLight: '#16213E',
    surface: '#0F3460',
    surfaceLight: '#1F4287',

    // Glass effect
    glass: 'rgba(31, 66, 135, 0.6)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassLight: 'rgba(255, 255, 255, 0.03)',

    // Text
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    textMuted: 'rgba(255, 255, 255, 0.45)',
    textDark: '#1A1A2E',

    // Semantic colors
    success: '#27AE60',
    successLight: '#2ECC71',
    warning: '#F1C40F',
    warningLight: '#F4D03F',
    error: '#E74C3C',
    errorLight: '#EC7063',
    info: '#3498DB',
    infoLight: '#5DADE2',

    // Gradients
    gradients: {
        primary: ['#E67E22', '#F39C12'],
        secondary: ['#16A085', '#1ABC9C'],
        sunset: ['#E67E22', '#E74C3C'],
        ocean: ['#16A085', '#3498DB'],
        night: ['#1A1A2E', '#16213E', '#0F3460'],
        card: ['rgba(31, 66, 135, 0.8)', 'rgba(15, 52, 96, 0.6)'],
        button: ['#E67E22', '#D35400'],
        buttonSecondary: ['#16A085', '#0E6655'],
        info: ['#3498DB', '#2980B9'],
    },

    // Mood colors - more refined
    moods: {
        happy: '#F1C40F',
        sad: '#5DADE2',
        energetic: '#E74C3C',
        tired: '#9B59B6',
        stressed: '#1ABC9C',
        relaxed: '#27AE60',
    },

    // Shadow
    shadow: {
        color: '#000000',
        offset: { width: 0, height: 4 },
        opacity: 0.3,
        radius: 12,
    },

    // Border radius
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    },
};

// Typography
export const Typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 22,
        xxxl: 28,
        display: 36,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

// Spacing
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
};

export default Colors;
