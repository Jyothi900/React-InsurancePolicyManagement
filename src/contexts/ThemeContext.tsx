import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import type { ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'light';
  });

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const muiTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#0D1B2A', 
        light: '#1B263B', 
        dark: '#000000', 
      },
      secondary: {
        main: '#415A77', 
        light: '#778DA9', 
        dark: '#2C3E50', 
      },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#0D1B2A',
        paper: mode === 'light' ? '#FFFFFF' : '#1B263B',
      },
      text: {
        primary: mode === 'light' ? '#0D1B2A' : '#FFFFFF',
        secondary: mode === 'light' ? '#415A77' : '#E0E6ED',
      },
      success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
      },
      info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light' 
              ? '0 4px 20px rgba(13, 27, 42, 0.08)' 
              : '0 4px 20px rgba(0, 0, 0, 0.4)',
            border: mode === 'light' 
              ? '1px solid rgba(13, 27, 42, 0.08)' 
              : '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'light' 
              ? '0 8px 32px rgba(13, 27, 42, 0.12)' 
              : '0 8px 32px rgba(0, 0, 0, 0.5)',
            border: mode === 'light' 
              ? '1px solid rgba(13, 27, 42, 0.06)' 
              : '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};