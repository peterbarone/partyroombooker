// Fun sound effects for the party booking experience
export const playSound = (soundType: 'click' | 'success' | 'celebration' | 'step') => {
  // We'll use the Web Audio API to create simple sound effects
  if (typeof window === 'undefined') return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const sounds = {
    click: () => {
      // Happy click sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    },
    
    success: () => {
      // Success chime
      const frequencies = [523.25, 659.25, 783.99]; // C, E, G
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
      });
    },
    
    celebration: () => {
      // Party celebration sound
      for (let i = 0; i < 8; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequency = 400 + Math.random() * 800;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + i * 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 2, audioContext.currentTime + i * 0.1 + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
        
        oscillator.start(audioContext.currentTime + i * 0.1);
        oscillator.stop(audioContext.currentTime + i * 0.1 + 0.2);
      }
    },
    
    step: () => {
      // Step completion sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    }
  };
  
  try {
    sounds[soundType]();
  } catch (error) {
    console.log('Sound effects not available');
  }
};

// Hook for using sounds in React components
export const useFunSounds = () => {
  const playClickSound = () => playSound('click');
  const playSuccessSound = () => playSound('success');
  const playCelebrationSound = () => playSound('celebration');
  const playStepSound = () => playSound('step');
  
  return {
    playClickSound,
    playSuccessSound,
    playCelebrationSound,
    playStepSound,
  };
};