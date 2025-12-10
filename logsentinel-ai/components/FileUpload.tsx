import React, { useRef, useState } from 'react';
import { UploadCloud, Play, FileJson, AlertCircle, ScanSearch, Download, Terminal } from 'lucide-react';
import { LogEntry, LogCategory, ForensicArtifact } from '../types';

interface FileUploadProps {
  onUpload: (logs: LogEntry[], artifacts?: ForensicArtifact[]) => void;
  onLoadDemo: () => void;
  onStartForensicScan: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, onLoadDemo, onStartForensicScan }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const parseJSON = (content: string) => {
    try {
      const data = JSON.parse(content);
      
      // Case 1: Standard Array of Logs
      if (Array.isArray(data)) {
        const valid = data.every(item => item.timestamp && item.application);
        if (valid) {
          const mappedLogs: LogEntry[] = data.map((item: any) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            timestamp: item.timestamp,
            application: item.application || 'Unknown',
            windowTitle: item.windowTitle || item.title || 'Unknown',
            durationSeconds: item.durationSeconds || item.duration || 60,
            category: item.category || LogCategory.UNCATEGORIZED
          }));
          onUpload(mappedLogs);
        } else {
          setError("Invalid JSON format. Expected array of log objects.");
        }
      } 
      // Case 2: Full Forensic Export Object { logs: [], artifacts: [] }
      else if (data.logs || data.artifacts) {
        const mappedLogs: LogEntry[] = (data.logs || []).map((item: any) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          timestamp: item.timestamp,
          application: item.application || 'Unknown',
          windowTitle: item.windowTitle || item.title || 'Unknown',
          durationSeconds: item.durationSeconds || item.duration || 60,
          category: item.category || LogCategory.UNCATEGORIZED
        }));

        const mappedArtifacts: ForensicArtifact[] = (data.artifacts || []).map((item: any) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          timestamp: item.timestamp,
          type: item.type,
          name: item.name,
          path: item.path,
          action: item.action,
          riskLevel: item.riskLevel || 'UNKNOWN'
        }));

        onUpload(mappedLogs, mappedArtifacts);
      } else {
        setError("Unknown JSON format. Expected array of logs or forensic export object.");
      }
    } catch (e) {
      setError("Failed to parse JSON file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseJSON(content);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        parseJSON(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadScript = () => {
    const scriptContent = `
# LogSentinel AI - Forensic Collector Script
# Run this in PowerShell to generate 'forensics_data.json'
# Then upload the JSON file to the web app.

$ErrorActionPreference = "SilentlyContinue"
Write-Host "Starting Forensic Collection..." -ForegroundColor Cyan

$data = @{
    logs = @()
    artifacts = @()
}

# 1. Collect Recent Documents (Simulated via Recent Folder)
Write-Host "[-] Scanning Recent Documents..."
$recentPath = "$env:APPDATA\\Microsoft\\Windows\\Recent"
if (Test-Path $recentPath) {
    $recentFiles = Get-ChildItem $recentPath -File | Select-Object -First 50
    foreach ($item in $recentFiles) {
        $data.artifacts += @{
            id = [Guid]::NewGuid().ToString()
            timestamp = $item.LastAccessTime.ToString("o")
            type = "RECENT_DOC"
            name = $item.Name
            path = $item.FullName
            action = "File Accessed (LNK)"
            riskLevel = "UNKNOWN"
        }
    }
}

# 2. Collect USB History (via PnpDevice)
Write-Host "[-] Scanning USB Devices..."
$usbDevices = Get-PnpDevice -Class 'USB' -Status OK | Where-Object { $_.FriendlyName -notmatch 'Hub|Controller|Composite' }
foreach ($dev in $usbDevices) {
    $data.artifacts += @{
        id = [Guid]::NewGuid().ToString()
        timestamp = (Get-Date).ToString("o") # PnpDevice doesn't easily give last connect time without complex registry parsing
        type = "USB_DEVICE"
        name = $dev.FriendlyName
        path = $dev.InstanceId
        action = "Device Present"
        riskLevel = "UNKNOWN"
    }
}

# 3. Collect Shellbags (Simulated via Explorer Recent Process Logs - Simplified)
Write-Host "[-] Scanning User Activity..."
# This is a placeholder for complex shellbag parsing which requires binary reading
# We will check common user folders for recent activity instead
$commonPaths = @("Desktop", "Downloads", "Documents", "Pictures")
foreach ($folder in $commonPaths) {
    $path = "$env:USERPROFILE\\$folder"
    if (Test-Path $path) {
        $item = Get-Item $path
        $data.artifacts += @{
            id = [Guid]::NewGuid().ToString()
            timestamp = $item.LastAccessTime.ToString("o")
            type = "SHELLBAG"
            name = $folder
            path = $path
            action = "Folder Access/Mod"
            riskLevel = "LOW"
        }
    }
}

$outFile = "forensics_data.json"
$data | ConvertTo-Json -Depth 4 | Out-File $outFile -Encoding utf8
Write-Host "[+] Collection Complete! Upload '$outFile' to LogSentinel." -ForegroundColor Green
Start-Sleep -Seconds 2
`;
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collect_data.ps1';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 w-full shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative
            ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-cyan-400">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Upload Data</h3>
          <p className="text-slate-400 mb-4">Drag & drop <code>log_export.json</code> or <code>forensics_data.json</code></p>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            <FileJson className="w-3 h-3" />
            <span>Accepts Logs & Artifacts</span>
          </div>
          {error && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-red-400 bg-red-950/90 px-4 py-2 rounded-lg border border-red-900/50 backdrop-blur-md">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Analyze Real PC Data */}
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <Terminal className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Analyze Actual PC Data</h3>
            </div>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              Browser security prevents direct access to USB history or Registry. To analyze this PC:
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleDownloadScript}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                1. Download Collector Script
              </button>
              <div className="text-center text-[10px] text-slate-500 my-1">Then run it and upload result</div>
            </div>
          </div>

          {/* Simulation & Demo */}
          <div className="space-y-3">
             <button 
              onClick={onStartForensicScan}
              className="w-full group relative inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-200 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-500 hover:to-blue-500"
            >
              <ScanSearch className="w-5 h-5 mr-2" />
              Simulate Forensic Scan
            </button>

            <button 
              onClick={onLoadDemo}
              className="w-full inline-flex items-center justify-center px-6 py-3 font-medium text-slate-400 transition-all duration-200 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Load Standard Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};