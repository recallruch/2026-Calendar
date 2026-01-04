
import { FontOption, MonthSettings, PhotoSlot, ImageFilters } from './types';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const FONT_OPTIONS: FontOption[] = [
  { name: 'Swiss Grunge (Inter)', family: "'Inter', sans-serif" },
  { name: 'Brutalist (Oswald)', family: "'Oswald', sans-serif" },
  { name: 'Experimental (Bebas Neue)', family: "'Bebas Neue', cursive" },
  { name: 'Typewriter (Special Elite)', family: "'Special Elite', cursive" },
  { name: 'Aggressive (Permanent Marker)', family: "'Permanent Marker', cursive" },
  { name: 'Modern Editorial (Playfair Display)', family: "'Playfair Display', serif" },
  { name: 'High Fashion (Abril Fatface)', family: "'Abril Fatface', serif" },
  { name: 'Retro (Righteous)', family: "'Righteous', cursive" },
  { name: 'Classical (Cinzel)', family: "'Cinzel', serif" },
  { name: 'Script (Dancing Script)', family: "'Dancing Script', cursive" }
];

export const DESIGN_COLORS = [
  '#FFFFFF', // White
  '#E11D48', // Heineken Red
  '#F97316', // Tribune Orange
  '#06B6D4', // Cyan Punch
  '#FDE047', // Yellow
  '#000000', // Black
  '#4ADE80', // Green
  '#8B5CF6', // Purple
];

const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  blackPoint: 0,
  whitePoint: 0,
};

const createSlot = (): PhotoSlot => ({
  imageUrl: null,
  zoom: 100,
  offsetX: 0,
  offsetY: 0,
  filters: { ...DEFAULT_FILTERS }
});

export const INITIAL_MONTH_SETTINGS: MonthSettings = {
  slots: Array(4).fill(null).map(createSlot),
  layoutType: 'single',
  bgColor: '#FFFFFF',
  markers: {},
  maskType: 'torn-1',
  stickers: []
};

export const MARKER_ICONS = [
  { id: 'cake', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 2a1 1 0 0 1 1 1v1h-2V9a1 1 0 0 1 1-1zm5 5a1 1 0 0 1 1 1v7H6v-7a1 1 0 0 1 1-1h10zM12 11a1 1 0 0 0-1-1v1h2v-1a1 1 0 0 0-1-1z"/></svg>' },
  { id: 'star', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' }
];
