import React, { useState } from 'react';
import { ForensicArtifact, ArtifactType } from '../types';
import { Usb, FileText, FolderOpen, AlertTriangle, Search, ShieldAlert } from 'lucide-react';

interface ForensicsViewProps {
  artifacts: ForensicArtifact[];
}

export const ForensicsView: React.FC<ForensicsViewProps> = ({ artifacts }) => {
  const [activeTab, setActiveTab] = useState<ArtifactType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArtifacts = artifacts.filter(item => {
    const matchesTab = activeTab === 'ALL' || item.type === activeTab;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.path.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getIcon = (type: ArtifactType) => {
    switch (type) {
      case ArtifactType.USB_DEVICE: return <Usb className="w-4 h-4" />;
      case ArtifactType.RECENT_DOC: return <FileText className="w-4 h-4" />;
      case ArtifactType.SHELLBAG: return <FolderOpen className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">USB Connections</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {artifacts.filter(a => a.type === ArtifactType.USB_DEVICE).length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center">
            <Usb className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Recent Files Accessed</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {artifacts.filter(a => a.type === ArtifactType.RECENT_DOC).length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">High Risk Items</p>
            <h3 className="text-2xl font-bold text-red-500 mt-1">
              {artifacts.filter(a => a.riskLevel === 'HIGH').length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[500px] flex flex-col">
        {/* Controls */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/20">
          <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
            {(['ALL', ArtifactType.USB_DEVICE, ArtifactType.RECENT_DOC, ArtifactType.SHELLBAG] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All Artifacts' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search artifacts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Artifact Name</th>
                <th className="px-6 py-4">Details / Path</th>
                <th className="px-6 py-4 text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredArtifacts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      {getIcon(item.type)}
                      <span className="capitalize">{item.type.toLowerCase().replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={item.path}>
                    {item.path}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(item.riskLevel)}`}>
                      {item.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredArtifacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No artifacts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};