
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import VirtualTryOn from './components/VirtualTryOn';
import StyleAdvisor from './components/StyleAdvisor';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('try-on');

  const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => {
    const isActive = activeTab === tabName;
    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm md:text-base font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-md ${
          isActive
            ? 'bg-amber-600 text-white shadow-md'
            : 'text-slate-300 hover:bg-slate-700'
        }`}
      >
        {label}
      </button>
    );
  };

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'try-on':
        return <VirtualTryOn />;
      case 'advisor':
        return <StyleAdvisor />;
      default:
        return <VirtualTryOn />;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <div className="w-full max-w-lg mx-auto mb-8">
          <div className="bg-slate-800 rounded-lg p-1 flex space-x-1">
            <TabButton tabName="try-on" label="Virtual Try-On" />
            <TabButton tabName="advisor" label="Style Advisor" />
          </div>
        </div>
        <div className="flex-grow flex flex-col">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} Zenthflow. AI-powered fashion exploration.</p>
      </footer>
    </div>
  );
};

export default App;
