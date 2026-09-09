import { AppProvider } from './AppContext';
import { Header } from './components/Header';
import { TargetConfig } from './components/TargetConfig';
import { RedTeamAgent } from './components/RedTeamAgent';
import { RobustnessFingerprint } from './components/RobustnessFingerprint';
import { CausalAgent } from './components/CausalAgent';
import { TelemetryInspector } from './components/TelemetryInspector';
import { ExecutionLog } from './components/ExecutionLog';
import { DispatcherControls } from './components/DispatcherControls';

function AppContent() {
  return (
    <div className="flex flex-col font-sans text-sm transition-colors duration-300 h-screen w-screen bg-surface-base text-ui-text">
      <Header />
      
      <main className="flex-1 flex gap-[1px] p-[1px] overflow-hidden bg-ui-border">
        
        <section className="flex-[1.8] flex flex-col gap-[1px] overflow-hidden lg:flex-[2.2]">
          {/* TOP HALF */}
          <div className="flex-[1] flex flex-row gap-[1px] min-h-0">
            <TargetConfig />
            <RedTeamAgent />
          </div>

          {/* BOTTOM HALF */}
          <div className="flex-[1.2] flex flex-row gap-[1px] min-h-0">
            <RobustnessFingerprint />
            <CausalAgent />
          </div>
        </section>

        <section className="flex-1 flex flex-col gap-[1px] overflow-hidden min-w-[340px]">
          <TelemetryInspector />
          <ExecutionLog />
          <DispatcherControls />
        </section>

      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
