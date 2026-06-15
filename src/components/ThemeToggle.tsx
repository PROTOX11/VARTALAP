import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget.getBoundingClientRect();
    // Calculate button center as % of viewport — used by CSS clip-path origin
    const xPct = ((btn.left + btn.width / 2) / window.innerWidth * 100).toFixed(1) + '%';
    const yPct = ((btn.top + btn.height / 2) / window.innerHeight * 100).toFixed(1) + '%';
    document.documentElement.style.setProperty('--vt-origin-x', xPct);
    document.documentElement.style.setProperty('--vt-origin-y', yPct);

    // Use View Transitions API if available (Chrome 111+, Edge 111+, Safari 18+)
    if (!('startViewTransition' in document)) {
      toggleTheme();
      return;
    }

    // Manually apply the class change synchronously inside the transition callback
    // so the browser can capture "before" and "after" snapshots correctly.
    const newDark = !isDark;
    (document as Document & { startViewTransition: (cb: () => void) => void })
      .startViewTransition(() => {
        // Update DOM immediately (sync) — browser snapshots this as the "new" state
        if (newDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        // Update React state — useEffect will see DOM already updated and be a no-op
        toggleTheme();
      });
  };

  return (
    <>
      <style>{`
        .vt-toggle-track {
          position: relative;
          width: 52px;
          height: 28px;
          border-radius: 999px;
          border: none;
          outline: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.35s cubic-bezier(0.4,0,0.2,1) !important;
          flex-shrink: 0;
        }
        .vt-toggle-track:focus-visible {
          box-shadow: 0 0 0 3px var(--ring, #7c3aed);
        }
        .vt-toggle-track:hover .vt-thumb {
          box-shadow: 0 2px 10px rgba(0,0,0,0.28);
        }
        .vt-thumb {
          position: absolute;
          top: 3px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
            background 0.35s ease,
            box-shadow 0.25s ease !important;
          box-shadow: 0 1px 5px rgba(0,0,0,0.22);
          will-change: transform;
        }
        .vt-thumb.is-dark {
          transform: translateX(27px);
          background: oklch(0.15 0.05 285);
          box-shadow: 0 1px 8px oklch(0.46 0.22 285 / 0.50);
        }
        .vt-thumb.is-light {
          transform: translateX(3px);
          background: #fff;
        }
        @keyframes icon-pop {
          0%   { transform: scale(0.5) rotate(-25deg); opacity: 0; }
          60%  { transform: scale(1.18) rotate(6deg); }
          100% { transform: scale(1)   rotate(0deg); opacity: 1; }
        }
        .vt-icon { animation: icon-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <button
        onClick={handleClick}
        className="vt-toggle-track"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, oklch(0.25 0.08 285), oklch(0.35 0.18 285))'
            : 'linear-gradient(135deg, oklch(0.78 0.10 285), oklch(0.68 0.18 285))',
        }}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className={`vt-thumb ${isDark ? 'is-dark' : 'is-light'}`}>
          {isDark
            ? <Moon key="moon" size={12} className="vt-icon" style={{ color: 'oklch(0.75 0.18 285)' }} />
            : <Sun  key="sun"  size={12} className="vt-icon" style={{ color: '#f59e0b' }} />
          }
        </span>
      </button>
    </>
  );
};

export default ThemeToggle;