import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type LogType = 'info' | 'success' | 'alert';
export interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: LogType;
}

export type AppState = 'IDLE' | 'ATTACKING';

interface AppContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  appState: AppState;
  setAppState: (state: AppState) => void;
  isGhost: boolean;
  setIsGhost: (ghost: boolean) => void;
  logs: LogEntry[];
  addLog: (msg: string, type?: LogType) => void;
  clearLogs: () => void;
  metrics: {
    jsd: string;
    latency: string;
    integrity: string;
  };
  setMetrics: (metrics: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [isGhost, setIsGhost] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState({
    jsd: '0.002',
    latency: '42ms',
    integrity: 'NOMINAL',
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const addLog = useCallback((msg: string, type: LogType = 'info') => {
    const time = new Date().toISOString().split('T')[1].substring(0, 11);
    setLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(7), time, message: msg, type },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        appState,
        setAppState,
        isGhost,
        setIsGhost,
        logs,
        addLog,
        clearLogs,
        metrics,
        setMetrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
