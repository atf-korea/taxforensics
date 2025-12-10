import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Clock, CheckCircle, AlertTriangle, Coffee } from 'lucide-react';
import { LogEntry, LogCategory } from '../types';

interface DashboardProps {
  logs: LogEntry[];
}

const COLORS = ['#22d3ee', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#94a3b8'];

export const Dashboard: React.FC<DashboardProps> = ({ logs }) => {

  const stats = useMemo(() => {
    if (!logs.length) return null;

    const totalDuration = logs.reduce((acc, log) => acc + log.durationSeconds, 0);
    const totalHours = (totalDuration / 3600).toFixed(1);

    // Group by App
    const appMap = new Map<string, number>();
    logs.forEach(log => {
      appMap.set(log.application, (appMap.get(log.application) || 0) + log.durationSeconds);
    });

    const topApps = Array.from(appMap.entries())
      .map(([name, duration]) => ({ name, duration: Math.round(duration / 60) })) // minutes
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    // Group by Category
    const catMap = new Map<string, number>();
    logs.forEach(log => {
      catMap.set(log.category, (catMap.get(log.category) || 0) + log.durationSeconds);
    });

    const categoryData = Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Activity over time (Daily)
    const dateMap = new Map<string, number>();
    logs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + log.durationSeconds);
    });

    // Sort dates
    const activityData = Array.from(dateMap.entries())
      .map(([date, seconds]) => ({ date, hours: parseFloat((seconds / 3600).toFixed(1)) }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Productivity Score (Arbitrary logic for demo)
    const prodSeconds = catMap.get(LogCategory.PRODUCTIVITY) || 0;
    const devSeconds = catMap.get(LogCategory.DEVELOPMENT) || 0;
    const productivityScore = Math.min(100, Math.round(((prodSeconds + devSeconds) / totalDuration) * 100));

    return {
      totalHours,
      topApps,
      categoryData,
      activityData,
      productivityScore
    };
  }, [logs]);

  if (!stats) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 text-cyan-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Total Tracked Time</p>
          <h3 className="text-3xl font-bold text-white mt-2">{stats.totalHours} <span className="text-lg text-slate-500 font-normal">hrs</span></h3>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Productivity Score</p>
          <h3 className="text-3xl font-bold text-white mt-2">{stats.productivityScore}%</h3>
          <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${stats.productivityScore}%`}}></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coffee className="w-24 h-24 text-yellow-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Top Application</p>
          <h3 className="text-2xl font-bold text-white mt-2 truncate">{stats.topApps[0]?.name || 'N/A'}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Used for {Math.floor(stats.topApps[0]?.duration / 60)} hrs {stats.topApps[0]?.duration % 60} mins
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-24 h-24 text-pink-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Unique Apps</p>
          <h3 className="text-3xl font-bold text-white mt-2">{stats.categoryData.length > 0 ? logs.reduce((acc, curr) => acc.add(curr.application), new Set()).size : 0}</h3>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Trend */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Daily Activity Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickMargin={10} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis stroke="#94a3b8" fontSize={12} unit="h" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#22d3ee" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Dist */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Time Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => `${(value / 3600).toFixed(1)} hrs`}
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {stats.categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Apps Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Most Used Applications (Minutes)</h3>
        <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topApps} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="duration" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};