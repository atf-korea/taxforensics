import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart2, 
  FileText, 
  BrainCircuit, 
  UploadCloud, 
  LogOut,
  LayoutDashboard,
  ScanSearch,
  Loader2
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AIAnalysis } from './components/AIAnalysis';
import { LogViewer } from './components/LogViewer';
import { FileUpload } from './components/FileUpload';
import { ForensicsView } from './components/ForensicsView';
import { LogEntry, AppView, ForensicArtifact } from './types';
import { generateMockData, generateForensicArtifacts } from './services/mockData';

const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [artifacts, setArtifacts] = useState<ForensicArtifact[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  // Load demo data handler
  const handleLoadDemo = () => {
    const mockLogs = generateMockData();
    setLogs(mockLogs);
    setArtifacts([]); // Clear forensics if loading standard demo
    setCurrentView(AppView.DASHBOARD);
  };

  const handleFileUpload = (uploadedLogs: LogEntry[], uploadedArtifacts: ForensicArtifact[] = []) => {
    setLogs(uploadedLogs);
    setArtifacts(uploadedArtifacts);
    
    // If we have artifacts (Real data scan), go to Forensics view, otherwise Dashboard
    if (uploadedArtifacts.length > 0) {
      setCurrentView(AppView.FORENSICS);
    } else {
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleStartForensicScan = () => {
    setIsScanning(true);
    setScanStep(0);

    // Simulate scanning steps
    const steps = [
      () => setScanStep(1), // Analyzing Logs
      () => setScanStep(2), // Scanning Shellbags
      () => setScanStep(3), // Parsing USB History
      () => setScanStep(4), // Extracting Recent Docs
      () => {
        const mockLogs = generateMockData();
        const mockArtifacts = generateForensicArtifacts();
        setLogs(mockLogs);
        setArtifacts(mockArtifacts);
        setIsScanning(false);
        setCurrentView(AppView.FORENSICS);
      }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        steps[currentStep]();
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);
  };

  const handleReset = () => {
    setLogs([]);
    setArtifacts([]);
    setCurrentView(AppView.UPLOAD);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.UPLOAD:
        return <FileUpload onUpload={handleFileUpload} onLoadDemo={handleLoadDemo} onStartForensicScan={handleStartForensicScan} />;
      case AppView.DASHBOARD:
        return <Dashboard logs={logs} />;
      case AppView.ANALYSIS:
        return <AIAnalysis logs={logs} artifacts={artifacts} />;
      case AppView.LOGS:
        return <LogViewer logs={logs} />;
      case AppView.FORENSICS:
        return <ForensicsView artifacts={artifacts} />;
      default:
        return <Dashboard logs={logs} />;
    }
  };

  // If no logs, force upload view (unless it's the very first render)
  useEffect(() => {
    if (logs.length === 0 && currentView !== AppView.UPLOAD) {
      setCurrentView(AppView.UPLOAD);
    }
  }, [logs, currentView]);

  if (isScanning) {
    const scanMessages = [
      "Initializing Forensic Engine...",
      "Analyzing System Event Logs...",
      "Parsing Registry Shellbags for Folder Access...",
      "Reconstructing USB Device History...",
      "Scanning Recent Documents (LNK files)...",
      "Finalizing Report..."
    ];

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
            <Activity className="absolute inset-0 m-auto w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Forensic Scan in Progress</h2>
            <p className="text-cyan-400 font-mono text-sm h-6">
              {scanMessages[scanStep] || "Processing..."}
            </p>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-cyan-500 h-full transition-all duration-500 ease-out" 
              style={{ width: `${(scanStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === AppView.UPLOAD && logs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="w-12 h-12 text-cyan-400" />
              <h1 className="text-4xl font-bold text-white tracking-tight">LogSentinel AI</h1>
            </div>
            <p className="text-slate-400 text-lg">
              Advanced PC Usage Analytics & Forensic Insights powered by Gemini
            </p>
          </header>
          <FileUpload onUpload={handleFileUpload} onLoadDemo={handleLoadDemo} onStartForensicScan={handleStartForensicScan} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 font-bold text-xl text-cyan-400">
              <Activity className="w-6 h-6" />
              <span>LogSentinel</span>
            </div>
          ) : (
            <Activity className="w-8 h-8 text-cyan-400 mx-auto" />
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-500 hover:text-white lg:hidden"
          >
            •
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavButton 
            active={currentView === AppView.DASHBOARD} 
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            icon={<LayoutDashboard />}
            label="Dashboard"
            isOpen={isSidebarOpen}
          />
          {artifacts.length > 0 && (
            <NavButton 
              active={currentView === AppView.FORENSICS} 
              onClick={() => setCurrentView(AppView.FORENSICS)}
              icon={<ScanSearch className="text-red-400" />}
              label="Forensics"
              isOpen={isSidebarOpen}
              extraClass="text-red-400 hover:text-red-300"
            />
          )}
          <NavButton 
            active={currentView === AppView.ANALYSIS} 
            onClick={() => setCurrentView(AppView.ANALYSIS)}
            icon={<BrainCircuit />}
            label="AI Analysis"
            isOpen={isSidebarOpen}
          />
          <NavButton 
            active={currentView === AppView.LOGS} 
            onClick={() => setCurrentView(AppView.LOGS)}
            icon={<FileText />}
            label="Raw Logs"
            isOpen={isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleReset}
            className={`flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-950/30 transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Close Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950 relative">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 flex items-center px-8 justify-between">
          <h2 className="text-xl font-semibold text-white">
            {currentView === AppView.DASHBOARD && 'Overview Dashboard'}
            {currentView === AppView.FORENSICS && 'Digital Forensics Report'}
            {currentView === AppView.ANALYSIS && 'AI Insights & Forensics'}
            {currentView === AppView.LOGS && 'Raw Data Inspector'}
          </h2>
          <div className="text-sm text-slate-400">
            {logs.length > 0 ? `${logs.length.toLocaleString()} events loaded` : 'Ready'}
          </div>
        </header>
        <div className="p-6 max-w-7xl mx-auto">
          {currentView === AppView.ANALYSIS ? (
             <AIAnalysis logs={logs} artifacts={artifacts} /> 
          ) : (
             renderContent()
          )}
        </div>
      </main>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  extraClass?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, isOpen, extraClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5' 
        : `text-slate-400 hover:text-white hover:bg-slate-800 ${extraClass}`
    } ${!isOpen && 'justify-center'}`}
  >
    <span className="w-5 h-5">{icon}</span>
    {isOpen && <span className="font-medium">{label}</span>}
  </button>
);

export default App;