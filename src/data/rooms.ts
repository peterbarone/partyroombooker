import { Package, Room, Addon } from '@/types';

// Sample tenant data for The Family Fun Factory
export const samplePackages: Package[] = [
  {
    id: '1',
    tenant_id: 'thefamilyfunfactory',
    name: 'Basic Birthday Bash',
    description: 'Perfect for smaller celebrations with all the essentials',
    base_price: 150,
    base_kids: 8,
    extra_kid_price: 10,
    duration_minutes: 120,
    includes_json: {
      includes: ['Party host', 'Basic decorations', 'Paper goods', 'Setup & cleanup'],
      restrictions: ['No outside food', 'No alcohol']
    },
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    tenant_id: 'thefamilyfunfactory',
    name: 'Deluxe Party Package',
    description: 'Enhanced experience with premium amenities and activities',
    base_price: 250,
    base_kids: 12,
    extra_kid_price: 15,
    duration_minutes: 150,
    includes_json: {
      includes: ['Dedicated party host', 'Premium decorations', 'Activity stations', 'Photo props', 'Party favors', 'Setup & cleanup'],
      restrictions: ['No outside food except cake', 'No alcohol']
    },
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '3',
    tenant_id: 'thefamilyfunfactory',
    name: 'Ultimate Celebration',
    description: 'The complete party experience with all premium features',
    base_price: 400,
    base_kids: 16,
    extra_kid_price: 20,
    duration_minutes: 180,
    includes_json: {
      includes: ['Premium party host', 'Custom decorations', 'Multiple activity stations', 'Professional photos', 'Party favors', 'Goodie bags', 'Pizza & drinks', 'Setup & cleanup'],
      restrictions: ['No alcohol']
    },
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const sampleRooms: Room[] = [
  {
    id: '1',
    tenant_id: 'thefamilyfunfactory',
    name: 'Rainbow Room',
    description: 'Bright and colorful space perfect for younger children',
    max_kids: 15,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    tenant_id: 'thefamilyfunfactory',
    name: 'Adventure Zone',
    description: 'Action-packed room with climbing and obstacle features',
    max_kids: 20,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '3',
    tenant_id: 'thefamilyfunfactory',
    name: 'Princess Palace',
    description: 'Elegant themed room for royal celebrations',
    max_kids: 12,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '4',
    tenant_id: 'thefamilyfunfactory',
    name: 'Sports Arena',
    description: 'Perfect for active parties and sports-themed celebrations',
    max_kids: 25,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const sampleAddons: Addon[] = [
  {
    id: '1',
    tenant_id: 'thefamilyfunfactory',
    name: 'Extra Pizza',
    description: 'Additional large pizza',
    unit: 'per pizza',
    price: 18,
    taxable: true,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    tenant_id: 'thefamilyfunfactory',
    name: 'Face Painting',
    description: 'Professional face painter for 1 hour',
    unit: 'per hour',
    price: 75,
    taxable: true,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '3',
    tenant_id: 'thefamilyfunfactory',
    name: 'Balloon Artist',
    description: 'Balloon twisting artist for entertainment',
    unit: 'per hour',
    price: 85,
    taxable: true,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '4',
    tenant_id: 'thefamilyfunfactory',
    name: 'Extra Goodie Bag',
    description: 'Additional party favor bag',
    unit: 'per bag',
    price: 8,
    taxable: true,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Package-Room mappings (which packages can use which rooms)
export const packageRoomMappings = [
  // Basic Birthday Bash - smaller rooms
  { package_id: '1', room_id: '1' }, // Rainbow Room
  { package_id: '1', room_id: '3' }, // Princess Palace
  
  // Deluxe Party Package - medium rooms
  { package_id: '2', room_id: '1' }, // Rainbow Room
  { package_id: '2', room_id: '2' }, // Adventure Zone
  { package_id: '2', room_id: '3' }, // Princess Palace
  
  // Ultimate Celebration - all rooms
  { package_id: '3', room_id: '1' }, // Rainbow Room
  { package_id: '3', room_id: '2' }, // Adventure Zone
  { package_id: '3', room_id: '3' }, // Princess Palace
  { package_id: '3', room_id: '4' }, // Sports Arena
];