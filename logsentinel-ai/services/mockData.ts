import { LogEntry, LogCategory, ForensicArtifact, ArtifactType } from '../types';

export const generateMockData = (): LogEntry[] => {
  const apps = [
    { name: 'VS Code', category: LogCategory.DEVELOPMENT },
    { name: 'Google Chrome', category: LogCategory.UNCATEGORIZED },
    { name: 'Slack', category: LogCategory.COMMUNICATION },
    { name: 'Spotify', category: LogCategory.ENTERTAINMENT },
    { name: 'Zoom', category: LogCategory.COMMUNICATION },
    { name: 'Figma', category: LogCategory.PRODUCTIVITY },
    { name: 'Terminal', category: LogCategory.DEVELOPMENT },
    { name: 'System Settings', category: LogCategory.SYSTEM },
    { name: 'Discord', category: LogCategory.COMMUNICATION },
    { name: 'Steam', category: LogCategory.ENTERTAINMENT },
  ];

  const logs: LogEntry[] = [];
  const now = new Date();
  
  // Generate logs for the last 7 days
  for (let i = 0; i < 7; i++) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    
    // 20-40 entries per day
    const entriesCount = Math.floor(Math.random() * 20) + 20;
    
    // Start at 9 AM
    let currentTime = new Date(day);
    currentTime.setHours(9, 0, 0, 0);

    for (let j = 0; j < entriesCount; j++) {
      const app = apps[Math.floor(Math.random() * apps.length)];
      const duration = Math.floor(Math.random() * 1800) + 60; // 1 min to 30 mins
      
      // Advance time
      currentTime = new Date(currentTime.getTime() + duration * 1000 + Math.random() * 60000);

      // Determine category refinement for Chrome
      let category = app.category;
      let title = `Main Window - ${app.name}`;
      
      if (app.name === 'Google Chrome') {
        const rand = Math.random();
        if (rand > 0.7) {
          title = 'Netflix - Watch TV Shows Online';
          category = LogCategory.ENTERTAINMENT;
        } else if (rand > 0.4) {
          title = 'GitHub - Pull Request #402';
          category = LogCategory.DEVELOPMENT;
        } else {
          title = 'Google Search - React Hooks';
          category = LogCategory.PRODUCTIVITY;
        }
      } else if (app.name === 'VS Code') {
        title = `index.tsx - Project Alpha`;
      }

      logs.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: currentTime.toISOString(),
        application: app.name,
        windowTitle: title,
        durationSeconds: duration,
        category: category
      });
    }
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generateForensicArtifacts = (): ForensicArtifact[] => {
  const artifacts: ForensicArtifact[] = [];
  const now = new Date();

  // 1. USB History
  const usbDevices = [
    { name: 'Samsung T7 Shield', serial: 'S5T7NS0R123456', risk: 'LOW' },
    { name: 'Sandisk Cruzer Blade', serial: '4C530001290812111023', risk: 'MEDIUM' },
    { name: 'Unknown Mass Storage', serial: 'Generic-123901', risk: 'HIGH' }
  ];

  usbDevices.forEach(device => {
    // Random connection time in last 30 days
    const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    artifacts.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: date.toISOString(),
      type: ArtifactType.USB_DEVICE,
      name: device.name,
      path: `USBSTOR\\Disk&Ven_${device.name.split(' ')[0]}&Prod_Storage\\${device.serial}`,
      action: 'Device Connected',
      riskLevel: device.risk as 'LOW' | 'MEDIUM' | 'HIGH'
    });
  });

  // 2. Recent Docs
  const docs = [
    { name: 'Q4_Financial_Report.xlsx', path: 'C:\\Users\\Admin\\Documents\\Finance', risk: 'MEDIUM' },
    { name: 'Project_Alpha_Secrets.docx', path: 'C:\\Users\\Admin\\Desktop\\Private', risk: 'HIGH' },
    { name: 'Resume_2025.pdf', path: 'C:\\Users\\Admin\\Downloads', risk: 'LOW' },
    { name: 'passwords.txt', path: 'D:\\Backups', risk: 'HIGH' },
    { name: 'Meeting_Notes.txt', path: 'C:\\Users\\Admin\\Desktop', risk: 'LOW' }
  ];

  docs.forEach(doc => {
    const date = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    artifacts.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: date.toISOString(),
      type: ArtifactType.RECENT_DOC,
      name: doc.name,
      path: doc.path,
      action: 'File Accessed (LNK)',
      riskLevel: doc.risk as 'LOW' | 'MEDIUM' | 'HIGH'
    });
  });

  // 3. Shellbags (Folder Access)
  const folders = [
    { name: 'My Pictures', path: 'C:\\Users\\Admin\\Pictures', risk: 'LOW' },
    { name: 'Hidden_Project', path: 'E:\\Hidden_Project', risk: 'HIGH' },
    { name: 'System32', path: 'C:\\Windows\\System32', risk: 'MEDIUM' },
    { name: 'Downloads', path: 'C:\\Users\\Admin\\Downloads', risk: 'LOW' }
  ];

  folders.forEach(folder => {
    const date = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    artifacts.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: date.toISOString(),
      type: ArtifactType.SHELLBAG,
      name: folder.name,
      path: folder.path,
      action: 'Folder Explored',
      riskLevel: folder.risk as 'LOW' | 'MEDIUM' | 'HIGH'
    });
  });

  return artifacts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};