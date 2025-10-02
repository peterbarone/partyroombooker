"use client";

/* eslint-disable react/no-unescaped-entities */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PartyPopper, 
  Cake, 
  Sparkles, 
  Calendar,
  Clock,
  Users,
  Pizza,
  Gift,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart
} from 'lucide-react';
import { PartyCelebration } from './ConfettiAnimation';
import ResponsiveBackground from './ResponsiveBackground';

interface BookingData {
  childName: string;
  childAge: number;
  childGender: 'boy' | 'girl' | 'neutral';
  partyDate: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  selectedRoom: string;
  guestCount: number;
  foodDrinks: string[];
  addOns: string[];
  specialNotes: string;
  parentInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

interface FamilyFunBookingWizardProps {
  tenant: string;
}

const STEPS = [
  'greeting',
  'child-name',
  'child-age', 
  'child-gender',
  'party-date',
  'time-slot',
  'room-choice',
  'guest-count',
  'food-drinks',
  'add-ons',
  'special-notes',
  'parent-info',
  'payment',
  'confirmation'
];

const FOOD_OPTIONS = [
  { id: 'pizza', label: '🍕 Pizza', emoji: '🍕' },
  { id: 'hotdogs', label: '🌭 Hot Dogs', emoji: '🌭' },
  { id: 'snacks', label: '🍿 Snacks', emoji: '🍿' },
  { id: 'juice', label: '🧃 Juice Boxes', emoji: '🧃' },
  { id: 'water', label: '💧 Bottled Water', emoji: '💧' },
  { id: 'cake', label: '🎂 Cake', emoji: '🎂' },
];

const ADDON_OPTIONS = [
  { id: 'balloons', label: '🎈 Balloons', emoji: '🎈', price: 25 },
  { id: 'favors', label: '🎁 Party Favors', emoji: '🎁', price: 35 },
  { id: 'character', label: '🤡 Character Visit', emoji: '🤡', price: 150 },
  { id: 'glow', label: '✨ Glow Accessories', emoji: '✨', price: 45 },
  { id: 'extra-time', label: '⏰ Extra Playtime', emoji: '⏰', price: 75 },
];

const ROOM_OPTIONS = [
  { 
    id: 'glow', 
    name: 'Glow Room', 
    emoji: '🌟',
    description: 'Blacklight fun with glow-in-the-dark activities!',
    image: '/rooms/glow-room.jpg'
  },
  { 
    id: 'bounce', 
    name: 'Bounce Room', 
    emoji: '🏀',
    description: 'Bounce houses and jumping fun!',
    image: '/rooms/bounce-room.jpg'
  },
  { 
    id: 'arcade', 
    name: 'Arcade Room', 
    emoji: '🎮',
    description: 'Video games and classic arcade fun!',
    image: '/rooms/arcade-room.jpg'
  },
];

export default function FamilyFunBookingWizard({ tenant }: FamilyFunBookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    childName: '',
    childAge: 5,
    childGender: 'neutral',
    partyDate: '',
    timeSlot: 'afternoon',
    selectedRoom: '',
    guestCount: 8,
    foodDrinks: [],
    addOns: [],
    specialNotes: '',
    parentInfo: {
      name: '',
      phone: '',
      email: '',
    },
  });

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const FloatingEmoji = ({ emoji, delay = 0 }: { emoji: string; delay?: number }) => (
    <motion.div
      className="absolute text-5xl md:text-6xl pointer-events-none opacity-20"
      initial={{ opacity: 0, y: 100, rotate: 0 }}
      animate={{ 
        opacity: [0, 0.3, 0.3, 0], 
        y: [-100, -200, -300, -400],
        rotate: [0, 180, 360, 540],
        x: [0, 50, -50, 0]
      }}
      transition={{ 
        duration: 8, 
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 5,
        ease: "easeInOut"
      }}
      style={{
        left: `${10 + Math.random() * 80}%`,
        top: `${80 + Math.random() * 20}%`,
      }}
    >
      {emoji}
    </motion.div>
  );

  const ProgressBar = () => (
    <div className="w-full bg-white/20 rounded-full h-3 mb-6">
      <motion.div 
        className="bg-fun-gradient h-3 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );

  const renderStep = () => {
    const stepName = STEPS[currentStep];

    switch (stepName) {
      case 'greeting':
        return (
          <StepContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 min-h-[600px]">
              {/* Right side on desktop, but show first on mobile (order classes) */}
              <div className="order-1 md:order-2 text-left space-y-6 bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="text-6xl">🎊</div>
                  <div className="text-6xl md:text-7xl font-black text-pink-600 leading-none tracking-tight">
                    WOOHOO!
                  </div>
                </motion.div>
                
                <motion.h1 
                  className="text-3xl md:text-5xl font-black text-brown-dark leading-tight"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  YOU'RE READY TO PLAN
                  <br />
                  <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                    AN AMAZING PARTY!
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl font-bold text-brown-dark leading-relaxed"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  LET'S MAKE THIS A DAY
                  <br />
                  TO REMEMBER. FIRST
                  <br />
                  THINGS FIRST...
                </motion.p>

                <motion.button
                  onClick={nextStep}
                  className="mt-8 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xl md:text-2xl font-black px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  🚀 LET'S START THE FUN! 🚀
                </motion.button>
              </div>
              
              {/* Left side - Let the background show through (placed after on mobile)
                  so the form appears on top on narrow screens */}
              <div className="order-2 md:order-1 relative flex items-center justify-center">
                {/* We'll let the beautiful party scene from the background show here */}
                <div className="text-center opacity-30">
                  <div className="text-8xl">🎉</div>
                </div>
              </div>
            </div>
          </StepContainer>
        );

      case 'child-name':
        return (
          <StepContainer>
            <div className="text-center">
              <motion.div className="flex justify-center gap-4 mb-8">
                <Sparkles className="text-party-yellow w-16 h-16 animate-pulse-party" />
                <Cake className="text-party-pink w-16 h-16 animate-bounce-fun" />
                <PartyPopper className="text-party-blue w-16 h-16 animate-wiggle" />
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-bold-display text-brown-dark mb-6 text-shadow-soft">
                WHO'S THE LUCKY KID
                <br />
                <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                  WE'RE CELEBRATING?
                </span>
              </h2>
              
              <div className="text-8xl mb-8">🥳</div>
              
              <div className="max-w-md mx-auto">
                <label className="block text-brown-dark font-bold mb-4 text-left text-lg">
                  BIRTHDAY STAR'S NAME
                </label>
                <input
                  type="text"
                  value={bookingData.childName}
                  onChange={(e) => updateBookingData({ childName: e.target.value })}
                  placeholder="Enter the birthday child's name"
                  className="w-full px-8 py-5 rounded-3xl border-4 border-pink-300 focus:border-pink-500 focus:outline-none text-xl font-bold bg-white shadow-lg focus:shadow-xl transition-all text-center"
                  autoFocus
                />
              </div>
            </div>
          </StepContainer>
        );

      case 'child-age':
        return (
          <StepContainer>
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold-display text-brown-dark mb-6 text-shadow-soft">
                AWESOME! AND HOW OLD
                <br />
                WILL{' '}
                <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                  {bookingData.childName.toUpperCase()}
                </span>
                <br />
                BE TURNING?
              </h2>
              
              <div className="text-8xl mb-8">🎂</div>
              
              <div className="flex justify-center items-center gap-6">
                <button
                  onClick={() => updateBookingData({ childAge: Math.max(1, bookingData.childAge - 1) })}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white text-3xl font-bold hover:scale-110 transition-transform shadow-lg"
                >
                  -
                </button>
                
                <motion.div 
                  className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-2xl"
                  key={bookingData.childAge}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                >
                  <span className="text-5xl font-bold-display">{bookingData.childAge}</span>
                </motion.div>
                
                <button
                  onClick={() => updateBookingData({ childAge: Math.min(18, bookingData.childAge + 1) })}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white text-3xl font-bold hover:scale-110 transition-transform shadow-lg"
                >
                  +
                </button>
              </div>
              
              <p className="text-xl font-bold text-brown-dark mt-6">
                {bookingData.childAge} YEARS OLD!
              </p>
            </div>
          </StepContainer>
        );

      case 'child-gender':
        return (
          <StepContainer>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-party text-brown-700 mb-4">
                Exciting! Is {bookingData.childName} a boy, a girl, or should we keep it neutral?
              </h2>
              
              <div className="flex justify-center gap-4 mt-8">
                {[
                  { value: 'boy', emoji: '👦', label: 'Boy', color: 'from-blue-400 to-blue-600' },
                  { value: 'girl', emoji: '👧', label: 'Girl', color: 'from-pink-400 to-pink-600' },
                  { value: 'neutral', emoji: '🎈', label: 'Neutral', color: 'from-purple-400 to-purple-600' }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => updateBookingData({ childGender: option.value as any })}
                    className={`p-6 rounded-3xl border-4 transition-all ${
                      bookingData.childGender === option.value 
                        ? 'border-party-yellow bg-white shadow-xl scale-105' 
                        : 'border-transparent bg-white/80 hover:scale-105'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-6xl mb-3">{option.emoji}</div>
                    <div className="font-party text-xl text-brown-700">{option.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </StepContainer>
        );

      case 'party-date':
        return (
          <StepContainer>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-party text-brown-700 mb-4">
                Great! Now, when's the big celebration happening?
              </h2>
              
              <div className="text-6xl mb-6">📅</div>
              
              <div className="max-w-md mx-auto">
                <label className="block text-brown-600 font-semibold mb-3 text-left">
                  Select Party Date
                </label>
                <input
                  type="date"
                  value={bookingData.partyDate}
                  onChange={(e) => updateBookingData({ partyDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-party-pink/30 focus:border-party-pink focus:outline-none text-lg font-medium bg-white/90 backdrop-blur-sm"
                />
              </div>
            </div>
          </StepContainer>
        );

      case 'time-slot':
        return (
          <StepContainer>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-party text-brown-700 mb-4">
                We've got some cool time slots. Which works best for your crew?
              </h2>
              
              <div className="flex justify-center gap-6 mt-8">
                {[
                  { value: 'morning', emoji: '🌅', label: 'Morning', time: '10:00 AM - 12:00 PM' },
                  { value: 'afternoon', emoji: '☀️', label: 'Afternoon', time: '2:00 PM - 4:00 PM' },
                  { value: 'evening', emoji: '🌙', label: 'Evening', time: '6:00 PM - 8:00 PM' }
                ].map((slot) => (
                  <motion.button
                    key={slot.value}
                    onClick={() => updateBookingData({ timeSlot: slot.value as any })}
                    className={`p-6 rounded-3xl border-4 transition-all ${
                      bookingData.timeSlot === slot.value 
                        ? 'border-party-yellow bg-white shadow-xl scale-105' 
                        : 'border-transparent bg-white/80 hover:scale-105'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-5xl mb-3">{slot.emoji}</div>
                    <div className="font-party text-xl text-brown-700 mb-1">{slot.label}</div>
                    <div className="text-sm text-brown-600 font-playful">{slot.time}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </StepContainer>
        );

      case 'guest-count':
        return (
          <StepContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 min-h-[300px]">
              {/* Form/content column: show first on mobile, right on desktop */}
              <div className="order-1 md:order-2 text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-party text-brown-700">
                  How many awesome friends is {bookingData.childName} inviting to the party?
                </h2>

                <div className="text-6xl">👥</div>

                <div className="flex justify-center items-center gap-6">
                  <button
                    onClick={() => updateBookingData({ guestCount: Math.max(1, bookingData.guestCount - 1) })}
                    className="w-16 h-16 rounded-full bg-party-gradient text-white text-3xl font-bold hover:scale-110 transition-transform"
                  >
                    -
                  </button>

                  <motion.div
                    className="w-32 h-32 rounded-full bg-celebration-gradient flex flex-col items-center justify-center text-white"
                    key={bookingData.guestCount}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                  >
                    <div className="text-4xl font-party">{bookingData.guestCount}</div>
                    <div className="text-sm font-playful">kids</div>
                  </motion.div>

                  <button
                    onClick={() => updateBookingData({ guestCount: bookingData.guestCount + 1 })}
                    className="w-16 h-16 rounded-full bg-party-gradient text-white text-3xl font-bold hover:scale-110 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Decorative/visual column: show after on mobile, left on desktop */}
              <div className="order-2 md:order-1 flex items-center justify-center opacity-30">
                <div className="text-9xl">👯‍♂️</div>
              </div>
            </div>
          </StepContainer>
        );

      case 'food-drinks':
        return (
          <StepContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-8">
              {/* Form content: selections - appears first on mobile, right on desktop */}
              <div className="order-1 md:order-2 text-center">
                <h2 className="text-3xl md:text-4xl font-party text-brown-700 mb-4">
                  🍕 Hungry guests are happy guests! Want to add some food or drinks?
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 max-w-2xl mx-auto">
                  {FOOD_OPTIONS.map((food) => (
                    <motion.button
                      key={food.id}
                      onClick={() => {
                        const isSelected = bookingData.foodDrinks.includes(food.id);
                        const newSelection = isSelected 
                          ? bookingData.foodDrinks.filter(id => id !== food.id)
                          : [...bookingData.foodDrinks, food.id];
                        updateBookingData({ foodDrinks: newSelection });
                      }}
                      className={`p-4 rounded-2xl border-4 transition-all ${
                        bookingData.foodDrinks.includes(food.id)
                          ? 'border-party-yellow bg-party-yellow/20 shadow-lg scale-105' 
                          : 'border-gray-200 bg-white/80 hover:scale-105'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-4xl mb-2">{food.emoji}</div>
                      <div className="font-playful text-sm text-brown-700">{food.label.replace(food.emoji + ' ', '')}</div>
                    </motion.button>
                  ))}
                </div>

                <p className="text-brown-600 font-playful mt-6">Select all that apply - we'll handle the rest!</p>
              </div>

              {/* Decorative visual column: appears after on mobile, left on desktop */}
              <div className="order-2 md:order-1 flex items-center justify-center opacity-30">
                <div className="text-9xl">🍽️</div>
              </div>
            </div>
          </StepContainer>
        );

      case 'add-ons':
        return (
          <StepContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-8">
              {/* Form column: selections - first on mobile, right on desktop */}
              <div className="order-1 md:order-2 text-center">
                <h2 className="text-3xl md:text-4xl font-party text-brown-700 mb-4">
                  Want to make this party epic? Choose some extra fun!
                </h2>

                <div className="grid md:grid-cols-1 gap-6 mt-4 max-w-3xl mx-auto">
                  {ADDON_OPTIONS.map((addon) => (
                    <motion.button
                      key={addon.id}
                      onClick={() => {
                        const isSelected = bookingData.addOns.includes(addon.id);
                        const newSelection = isSelected 
                          ? bookingData.addOns.filter(id => id !== addon.id)
                          : [...bookingData.addOns, addon.id];
                        updateBookingData({ addOns: newSelection });
                      }}
                      className={`p-6 rounded-3xl border-4 transition-all ${
                        bookingData.addOns.includes(addon.id)
                          ? 'border-party-yellow bg-party-yellow/20 shadow-xl scale-105' 
                          : 'border-gray-200 bg-white/80 hover:scale-105'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-5xl mb-3">{addon.emoji}</div>
                      <div className="font-party text-xl text-brown-700 mb-2">
                        {addon.label.replace(addon.emoji + ' ', '')}
                      </div>
                      <div className="font-playful text-party-pink font-bold">+${addon.price}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Visual column: appears after on mobile, left on desktop */}
              <div className="order-2 md:order-1 flex items-center justify-center opacity-30">
                <div className="text-9xl">🎁</div>
              </div>
            </div>
          </StepContainer>
        );

      case 'special-notes':
        return (
          <StepContainer>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-party text-brown-700 mb-4">
                Any special requests or important info we should know about {bookingData.childName}'s big day?
              </h2>
              
              <div className="text-6xl mb-6">💭</div>
              
              <div className="max-w-2xl mx-auto">
                <textarea
                  value={bookingData.specialNotes}
                  onChange={(e) => updateBookingData({ specialNotes: e.target.value })}
                  placeholder="Tell us about allergies, special decorations, theme requests, or anything else that would make this party perfect!"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-party-pink/30 focus:border-party-pink focus:outline-none text-lg font-medium bg-white/90 backdrop-blur-sm h-32 resize-none"
                />
                <p className="text-brown-600 font-playful mt-3 text-sm">
                  Don't worry if you can't think of anything - you can always call us later! 📞
                </p>
              </div>
            </div>
          </StepContainer>
        );

      case 'parent-info':
        return (
          <StepContainer>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-party text-brown-700 mb-4">
                Almost done! We just need your info so we can lock this in.
              </h2>
              
              <div className="text-6xl mb-6">📝</div>
              
              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-brown-600 font-semibold mb-2 text-left">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={bookingData.parentInfo.name}
                    onChange={(e) => updateBookingData({ 
                      parentInfo: { ...bookingData.parentInfo, name: e.target.value }
                    })}
                    placeholder="Enter your full name"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-party-pink/30 focus:border-party-pink focus:outline-none text-lg font-medium bg-white/90 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-brown-600 font-semibold mb-2 text-left">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={bookingData.parentInfo.phone}
                    onChange={(e) => updateBookingData({ 
                      parentInfo: { ...bookingData.parentInfo, phone: e.target.value }
                    })}
                    placeholder="(555) 123-4567"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-party-pink/30 focus:border-party-pink focus:outline-none text-lg font-medium bg-white/90 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-brown-600 font-semibold mb-2 text-left">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={bookingData.parentInfo.email}
                    onChange={(e) => updateBookingData({ 
                      parentInfo: { ...bookingData.parentInfo, email: e.target.value }
                    })}
                    placeholder="your@email.com"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-party-pink/30 focus:border-party-pink focus:outline-none text-lg font-medium bg-white/90 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </StepContainer>
        );

      case 'payment':
        return (
          <StepContainer>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-party text-brown-700 mb-4">
                🎟️ To secure your spot, we just need the deposit. Ready to check out?
              </h2>
              
              <div className="bg-white/90 rounded-3xl p-8 max-w-2xl mx-auto mb-8">
                <h3 className="font-party text-2xl text-brown-700 mb-6">Party Summary 🎉</h3>
                
                <div className="text-left space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="font-playful">Birthday Star:</span>
                    <span className="font-bold">{bookingData.childName} (turning {bookingData.childAge}!)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-playful">Date & Time:</span>
                    <span className="font-bold">{bookingData.partyDate} • {bookingData.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-playful">Room:</span>
                    <span className="font-bold">{ROOM_OPTIONS.find(r => r.id === bookingData.selectedRoom)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-playful">Guest Count:</span>
                    <span className="font-bold">{bookingData.guestCount} kids</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between text-xl font-party text-brown-700">
                    <span>Deposit Required:</span>
                    <span className="text-party-pink">$149.99</span>
                  </div>
                  <p className="text-sm text-brown-600 font-playful mt-2">
                    Remaining balance due on party day
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={() => {
                  setShowCelebration(true);
                  setTimeout(() => nextStep(), 500);
                }}
                className="btn-party text-xl px-12 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Secure My Party Spot! 🚀
              </motion.button>
            </div>
          </StepContainer>
        );

      case 'confirmation':
        return (
          <StepContainer>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-party text-brown-700 mb-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Woohoo! 🎊
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl font-playful text-brown-600 mb-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                The party is officially booked! We'll send the details to your email. 
                Can't wait to celebrate with you and {bookingData.childName}!
              </motion.p>
              
              <motion.div
                className="bg-white/90 rounded-3xl p-6 max-w-md mx-auto mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="font-party text-xl text-brown-700 mb-4">🎂 Party Details</h3>
                <div className="text-left space-y-2 font-playful text-brown-600">
                  <div>📅 {bookingData.partyDate}</div>
                  <div>⏰ {bookingData.timeSlot}</div>
                  <div>🏠 {ROOM_OPTIONS.find(r => r.id === bookingData.selectedRoom)?.name}</div>
                  <div>👥 {bookingData.guestCount} guests</div>
                </div>
              </motion.div>
              
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <button className="btn-celebration">
                  📧 View Email Confirmation
                </button>
                <div>
                  <button 
                    onClick={() => {
                      setCurrentStep(0);
                      setBookingData({
                        childName: '',
                        childAge: 5,
                        childGender: 'neutral',
                        partyDate: '',
                        timeSlot: 'afternoon',
                        selectedRoom: '',
                        guestCount: 8,
                        foodDrinks: [],
                        addOns: [],
                        specialNotes: '',
                        parentInfo: { name: '', phone: '', email: '' },
                      });
                    }}
                    className="btn-fun"
                  >
                    🎪 Book Another Party
                  </button>
                </div>
              </motion.div>
            </div>
          </StepContainer>
        );

      default:
        return <div>Step under construction</div>;
    }
  };

  const StepContainer = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ResponsiveBackground className="absolute inset-0 -z-10" overlay={
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-pink-500/30 to-pink-600/20"></div>
      } />
      {/* Party Celebration */}
      <PartyCelebration 
        trigger={showCelebration} 
        onComplete={() => setShowCelebration(false)}
      />
      
      {/* Subtle floating elements that complement the background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Just a few subtle sparkles to add movement */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute text-2xl opacity-20"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen p-6">
        {/* Header with Progress */}
        {currentStep > 0 && (
          <div className="w-full max-w-4xl mx-auto mb-8">
            <ProgressBar />
            <div className="text-center text-white font-playful font-bold text-lg drop-shadow-lg">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-7xl">
            {currentStep === 0 ? (
              // Special layout for greeting page - no background card to show the party scene
              <div className="min-h-[80vh] flex items-center">
                {renderStep()}
              </div>
            ) : (
              // Standard layout for other steps with semi-transparent background
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                {renderStep()}
              </div>
            )}
            
            {/* Navigation Buttons */}
            {currentStep > 0 && (
              <div className="flex justify-between mt-8">
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/90 text-gray-700 font-semibold hover:bg-white transition-colors backdrop-blur-sm border border-white/30"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
                
                {currentStep < STEPS.length - 1 && (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}