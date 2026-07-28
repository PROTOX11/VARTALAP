import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Find the scrollable container (usually .overflow-y-auto or window)
    const findScrollContainer = () => {
      return document.querySelector('.overflow-y-auto') || window;
    };

    const handleScroll = (e?: Event) => {
      let scrollTop = 0;
      if (e?.target && e.target !== document) {
        scrollTop = (e.target as HTMLElement).scrollTop;
      } else {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
      }

      // Show button when scrolled down > 250px
      if (scrollTop > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const scrollContainer = findScrollContainer();
    
    // Attach listener to both container and window
    if (scrollContainer && scrollContainer !== window) {
      (scrollContainer as HTMLElement).addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      if (scrollContainer && scrollContainer !== window) {
        (scrollContainer as HTMLElement).removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-20 right-5 md:bottom-8 md:right-8 z-40 p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg shadow-purple-600/40 hover:from-purple-700 hover:to-indigo-700 hover:scale-110 active:scale-95 transition-all duration-300 animate-slide-fade-in flex items-center justify-center border border-white/20"
      title="Scroll to Top"
    >
      <ArrowUp size={20} className="stroke-[2.5]" />
    </button>
  );
};

export default ScrollToTopButton;
