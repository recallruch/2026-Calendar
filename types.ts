
export type MarkerType = 'text' | 'icon';

export interface Marker {
  type: MarkerType;
  value: string;
}

export interface Sticker {
  id: string;
  icon: string;
  x: number;
  y: number;
  scale: number;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  blackPoint: number;
  whitePoint: number;
}

export interface PhotoSlot {
  imageUrl: string | null;
  zoom: number;
  offsetX: number;
  offsetY: number;
  filters: ImageFilters;
  maskOverride?: 'none' | 'torn-1' | 'torn-2' | 'torn-3' | 'torn-4' | 'circle';
}

export type LayoutType = 'single' | 'grid-2' | 'grid-3' | 'grid-4' | 'masonry-3' | 'masonry-4';

export interface MonthSettings {
  slots: PhotoSlot[];
  layoutType: LayoutType;
  bgColor: string;
  markers: Record<number, Marker>;
  maskType: 'none' | 'circle' | 'rounded' | 'squircle' | 'torn-1';
  stickers: Sticker[];
}

export type CalendarData = MonthSettings[];

export interface FontOption {
  name: string;
  family: string;
}
