import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget.getBoundingClientRect();
    const xPct = ((btn.left + btn.width / 2) / window.innerWidth * 100).toFixed(1) + '%';
    const yPct = ((btn.top + btn.height / 2) / window.innerHeight * 100).toFixed(1) + '%';
    document.documentElement.style.setProperty('--vt-origin-x', xPct);
    document.documentElement.style.setProperty('--vt-origin-y', yPct);

    if (!('startViewTransition' in document)) {
      toggleTheme();
      return;
    }

    const newDark = !isDark;
    (document as Document & { startViewTransition: (cb: () => void) => void })
      .startViewTransition(() => {
        if (newDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        toggleTheme();
      });
  };

  return (
    <>
      <style>{`
        .circle-theme-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50% !important;
          outline: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          flex-shrink: 0;
        }
        .circle-theme-btn:hover {
          transform: scale(1.08);
        }
        .circle-theme-btn:active {
          transform: scale(0.92);
        }
        .circle-theme-btn:focus-visible {
          box-shadow: 0 0 0 3px var(--ring, #7c3aed);
        }
        @keyframes themeSpin {
          0% { transform: rotate(-90deg) scale(0.6); opacity: 0; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        .theme-icon-animated {
          animation: themeSpin 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <button
        onClick={handleClick}
        className="circle-theme-btn bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Moon key="moon" size={22} className="theme-icon-animated" />
        ) : (
          <Sun key="sun" size={22} className="theme-icon-animated" />
        )}
      </button>
    </>
  );
};

export default ThemeToggle;