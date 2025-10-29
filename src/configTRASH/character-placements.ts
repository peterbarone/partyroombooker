// Centralized character placement config (no tenant variants)
// Asset convention: store per-scene images under public/assets/{scene}/
// Use existing filenames for now; you can rename assets later and only change this map.

export type CharacterKey = 'wizzy' | 'ruffs';

export type Placement = {
  src: string;
  anchor: 'left' | 'right';
  preset?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  bottom?: string;
  offset?: string;
  scale?: number;
  translateX?: string;
  translateY?: string;
  origin?: string;
};

export type StepKey =
  | 'greeting'
  | 'child-name'
  | 'child-age'
  | 'party-date'
  | 'time-slot'
  | 'room-choice'
  | 'package-choice'
  | 'guest-count'
  | 'parent-info'
  | 'special-notes'
  | 'payment'
  | 'confirmation';

export const CharacterPlacements: Partial<Record<StepKey, Partial<Record<CharacterKey, Placement>>>> = {
  // Greeting step
  'greeting': {
    wizzy: {
      src: '/assets/greeting/wizzygreeting.png',
      anchor: 'left',
      preset: 'lg',
      bottom: '6.5rem',
      offset: '6%',
      scale: 2.5,
    },
    ruffs: {
      src: '/assets/greeting/ruffsgreeting.png',
      anchor: 'right',
      preset: 'lg',
      bottom: '7.5rem',
      offset: '6%',
      scale: 1.65,
    },
  },

  // Child name step
  'child-name': {
    wizzy: {
      src: '/assets/child-name/wizzyWho.png',
      anchor: 'left',
      preset: 'lg',
      bottom: '7.5rem',
      offset: '6%',
      scale: 2.5,
    },
    ruffs: {
      src: '/assets/child-name/ruffsWho.png',
      anchor: 'right',
      preset: 'lg',
      bottom: '5rem',
      offset: '6%',
      scale: 1.65,
    },
  },

  // Child age step
  'child-age': {
    wizzy: {
      src: '/assets/child-age/wizzyAge.png',
      anchor: 'left',
      preset: 'lg',
      bottom: '7.5rem',
      offset: '6%',
      scale: 2.5,
    },
    ruffs: {
      src: '/assets/child-age/ruffsage.png',
      anchor: 'right',
      preset: 'lg',
      bottom: '5rem',
      offset: '6%',
      scale: 1.65,
    },
  },
};
