import { useAppContext } from '../AppContext';

export const Header = () => {
  const { isDarkMode, toggleTheme, appState } = useAppContext();

  return (
    <header className="h-12 bg-surface-dark text-gray-300 flex items-center justify-between px-4 shrink-0 border-b border-ui-border">
      <div className="flex items-center gap-4">
        <div className="font-mono font-bold tracking-widest text-xs flex items-center gap-2 text-white">
          <div className="w-2 h-2 bg-ui-accent rounded-none"></div>
          AEGIS-GHOST <span className="text-gray-500 font-normal">// WORKSPACE</span>
        </div>
        <div className="h-4 w-px bg-gray-700"></div>
        <div className="font-mono text-xs text-gray-400">TARGET: HTTP/REST [127.0.0.1:8000]</div>
      </div>
      <div className="flex items-center gap-4 font-mono text-xs">
        <span className="text-gray-400">
          STATE: <span className={appState === 'ATTACKING' ? 'text-ui-alert animate-pulse' : 'text-ui-ok'}>{appState}</span>
        </span>
        <span className="text-gray-400 hidden sm:inline">
          AUTH: <span className="text-white">DESC_AUDIT_0X9</span>
        </span>
        <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
        <button
          onClick={toggleTheme}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
            isDarkMode ? 'text-ui-accent bg-gray-800' : 'hover:text-white hover:bg-gray-800'
          }`}
        >
          <span>{isDarkMode ? '[ LIGHT_MODE ]' : '[ DARK_MODE ]'}</span>
        </button>
      </div>
    </header>
  );
};
