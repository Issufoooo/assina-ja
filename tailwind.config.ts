import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── Premium Color System ─────────────────────────────────────────────
      colors: {
        // Core palette
        navy:       '#00033D',
        blue:       '#0033FF',
        violet:     '#977DFF',
        fog:        '#EAEDF8',
        obsidian:   '#030812',

        // Semantic surfaces
        background: '#F4F5FB',
        surface: {
          DEFAULT: '#FFFFFF',
          raised:  '#F8F9FE',
          glass:   'rgba(255,255,255,0.72)',
          dark:    'rgba(0,3,61,0.04)',
        },
        border: {
          DEFAULT: 'rgba(0,51,255,0.10)',
          subtle:  'rgba(0,3,61,0.06)',
          strong:  'rgba(0,51,255,0.20)',
        },

        // Brand primaries
        primary: {
          DEFAULT: '#0033FF',
          deep:    '#0028CC',
          light:   '#3366FF',
          dim:     'rgba(0,51,255,0.08)',
          ring:    'rgba(0,51,255,0.20)',
          glow:    'rgba(0,51,255,0.15)',
        },
        accent: {
          DEFAULT: '#977DFF',
          light:   '#B09AFF',
          dim:     'rgba(151,125,255,0.10)',
          glow:    'rgba(151,125,255,0.20)',
        },

        // Status
        success: {
          DEFAULT: '#00C48C',
          dim:     'rgba(0,196,140,0.10)',
          bright:  'rgba(0,196,140,0.18)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dim:     'rgba(245,158,11,0.10)',
        },
        danger: {
          DEFAULT: '#EF4444',
          dim:     'rgba(239,68,68,0.10)',
        },

        // Text scale
        ink: {
          primary:   '#030812',
          secondary: '#4B5275',
          muted:     '#9198B5',
          ghost:     '#C8CCDE',
        },
      },

      // ─── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-sora)',           'sans-serif'],
        body:    ['var(--font-dm-sans)',         'sans-serif'],
        mono:    ['var(--font-jetbrains-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        xs:    ['13px', { lineHeight: '18px' }],
        sm:    ['14px', { lineHeight: '20px' }],
        base:  ['15px', { lineHeight: '22px' }],
        md:    ['17px', { lineHeight: '26px' }],
        lg:    ['20px', { lineHeight: '28px' }],
        xl:    ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        '2xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em' }],
        '3xl': ['38px', { lineHeight: '46px', letterSpacing: '-0.025em' }],
      },

      // ─── Spacing ──────────────────────────────────────────────────────────
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
      },

      // ─── Radii ────────────────────────────────────────────────────────────
      borderRadius: {
        sm:    '8px',
        md:    '12px',
        lg:    '16px',
        xl:    '20px',
        '2xl': '24px',
        '3xl': '32px',
      },

      // ─── Shadows (premium layered) ────────────────────────────────────────
      boxShadow: {
        // Card elevation system
        'xs':    '0 1px 2px rgba(0,3,61,0.04), 0 0 0 1px rgba(0,51,255,0.06)',
        'sm':    '0 2px 8px rgba(0,3,61,0.06), 0 0 0 1px rgba(0,51,255,0.08)',
        'md':    '0 4px 16px rgba(0,3,61,0.08), 0 0 0 1px rgba(0,51,255,0.08)',
        'lg':    '0 8px 32px rgba(0,3,61,0.10), 0 0 0 1px rgba(0,51,255,0.06)',
        'xl':    '0 16px 48px rgba(0,3,61,0.12), 0 0 0 1px rgba(0,51,255,0.06)',
        '2xl':   '0 24px 64px rgba(0,3,61,0.16)',
        // Floating card
        'float': '0 8px 40px rgba(0,3,61,0.10), 0 2px 8px rgba(0,3,61,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset',
        // Glow effects
        'glow-blue':   '0 0 0 3px rgba(0,51,255,0.15), 0 4px 16px rgba(0,51,255,0.15)',
        'glow-violet': '0 0 0 3px rgba(151,125,255,0.20), 0 4px 16px rgba(151,125,255,0.15)',
        'glow-success':'0 0 0 3px rgba(0,196,140,0.20), 0 4px 16px rgba(0,196,140,0.10)',
        'glow-danger': '0 0 0 3px rgba(239,68,68,0.20)',
        // Input focus
        'input':       '0 0 0 3px rgba(0,51,255,0.12), 0 1px 4px rgba(0,3,61,0.06)',
        'input-error': '0 0 0 3px rgba(239,68,68,0.15)',
        // Button
        'btn-primary': '0 2px 8px rgba(0,51,255,0.25), 0 1px 2px rgba(0,3,61,0.10)',
        'btn-hover':   '0 4px 16px rgba(0,51,255,0.35), 0 2px 4px rgba(0,3,61,0.10)',
        // Inset (inner shadows for glass)
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.80)',
        'inner-subtle':'inset 0 1px 0 rgba(255,255,255,0.40)',
      },

      // ─── Gradients ────────────────────────────────────────────────────────
      backgroundImage: {
        // Primary action gradient
        'gradient-primary':   'linear-gradient(135deg, #0033FF 0%, #977DFF 100%)',
        'gradient-primary-r': 'linear-gradient(135deg, #0028CC 0%, #7B5FE8 100%)',
        'gradient-violet':    'linear-gradient(135deg, #977DFF 0%, #0033FF 100%)',

        // Surface gradients
        'gradient-surface':   'linear-gradient(160deg, #FFFFFF 0%, #F4F5FB 100%)',
        'gradient-card':      'linear-gradient(160deg, #FFFFFF 0%, #F8F9FE 100%)',
        'gradient-fog':       'linear-gradient(180deg, #EAEDF8 0%, #F4F5FB 100%)',

        // Glow radials
        'glow-blue-radial':   'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,51,255,0.12) 0%, transparent 100%)',
        'glow-violet-radial': 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(151,125,255,0.10) 0%, transparent 100%)',

        // Shimmer skeleton
        'shimmer-gradient':   'linear-gradient(90deg, #F4F5FB 25%, #EAEDF8 50%, #F4F5FB 75%)',

        // Background pattern
        'dot-pattern': "radial-gradient(circle, rgba(0,51,255,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        'dot-pattern': '24px 24px',
      },

      // ─── Backdrop ─────────────────────────────────────────────────────────
      backdropBlur: {
        xs:  '4px',
        sm:  '8px',
        md:  '16px',
        lg:  '24px',
        xl:  '40px',
      },

      // ─── Animations ───────────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-6px)' },
          '40%':     { transform: 'translateX(6px)' },
          '60%':     { transform: 'translateX(-4px)' },
          '80%':     { transform: 'translateX(4px)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.5' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        shimmer:      'shimmer 2s linear infinite',
        'fade-up':    'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        shake:        'shake 0.38s ease-in-out',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        'spin-slow':  'spin-slow 2s linear infinite',
        float:        'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
