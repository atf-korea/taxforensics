import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { LogEntry, LogCategory } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof LogEntry>('timestamp');
  const [sortDesc, setSortDesc] = useState(true);

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Set(logs.map(l => l.category));
    return ['All', ...Array.from(cats)];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.application.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.windowTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || log.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [logs, searchTerm, categoryFilter, sortField, sortDesc]);

  const handleSort = (field: keyof LogEntry) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const SortIcon = ({ field }: { field: keyof LogEntry }) => {
    if (sortField !== field) return null;
    return sortDesc ? <ArrowDown className="w-4 h-4 inline ml-1" /> : <ArrowUp className="w-4 h-4 inline ml-1" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      {/* Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search application or window title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg py-2 pl-2 pr-8 text-sm focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-950/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
        <div 
          className="col-span-2 cursor-pointer hover:text-white transition-colors"
          onClick={() => handleSort('timestamp')}
        >
          Time <SortIcon field="timestamp" />
        </div>
        <div 
          className="col-span-2 cursor-pointer hover:text-white transition-colors"
          onClick={() => handleSort('application')}
        >
          Application <SortIcon field="application" />
        </div>
        <div 
          className="col-span-4 cursor-pointer hover:text-white transition-colors"
          onClick={() => handleSort('windowTitle')}
        >
          Window Title <SortIcon field="windowTitle" />
        </div>
        <div 
          className="col-span-2 cursor-pointer hover:text-white transition-colors"
          onClick={() => handleSort('category')}
        >
          Category <SortIcon field="category" />
        </div>
        <div 
          className="col-span-2 text-right cursor-pointer hover:text-white transition-colors"
          onClick={() => handleSort('durationSeconds')}
        >
          Duration <SortIcon field="durationSeconds" />
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <Search className="w-8 h-8 mb-2 opacity-50" />
             <p>No matching logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors text-sm items-center"
            >
              <div className="col-span-2 text-slate-400 font-mono text-xs">
                {new Date(log.timestamp).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="col-span-2 text-white font-medium truncate" title={log.application}>
                {log.application}
              </div>
              <div className="col-span-4 text-slate-300 truncate" title={log.windowTitle}>
                {log.windowTitle}
              </div>
              <div className="col-span-2">
                <CategoryBadge category={log.category} />
              </div>
              <div className="col-span-2 text-right text-slate-400 font-mono">
                {Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 text-center">
        Showing {filteredLogs.length} of {logs.length} events
      </div>
    </div>
  );
};

const CategoryBadge: React.FC<{ category: LogCategory }> = ({ category }) => {
  let colorClass = 'bg-slate-800 text-slate-300 border-slate-700';
  
  switch (category) {
    case LogCategory.PRODUCTIVITY:
      colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      break;
    case LogCategory.DEVELOPMENT:
      colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      break;
    case LogCategory.ENTERTAINMENT:
      colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      break;
    case LogCategory.COMMUNICATION:
      colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      break;
     case LogCategory.SYSTEM:
      colorClass = 'bg-slate-700/50 text-slate-300 border-slate-600';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${colorClass}`}>
      {category}
    </span>
  );
};