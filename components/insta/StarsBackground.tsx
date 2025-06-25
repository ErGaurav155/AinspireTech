'use client';

import { useEffect } from 'react';

export default function StarsBackground() {
  useEffect(() => {
    const createStarParticles = () => {
      const starsContainer = document.getElementById('stars-container');
      if (!starsContainer) return;
      
      starsContainer.innerHTML = '';
      const numberOfStars = 150;
      
      for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'absolute rounded-full star';
        
        // Random size
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random color - use theme colors
        const colors = ['#00F0FF', '#B026FF', '#FF2E9F', '#FFFFFF'];
        star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random opacity
        star.style.opacity = `${Math.random() * 0.8 + 0.2}`;
        
        // Animation delay
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        starsContainer.appendChild(star);
      }
    };

    createStarParticles();
  }, []);

  return (
    <div
      id="stars-container"
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}