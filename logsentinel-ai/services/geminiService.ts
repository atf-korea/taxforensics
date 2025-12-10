import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LogEntry, ForensicArtifact } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to summarize data to avoid token limits for large datasets
const summarizeLogsForContext = (logs: LogEntry[], artifacts: ForensicArtifact[] = []): string => {
  // Take top 50 most recent logs detailed
  const recentLogs = logs.slice(0, 30).map(l => 
    `[${l.timestamp.split('T')[1].split('.')[0]}] App: ${l.application} | Title: ${l.windowTitle} | Dur: ${Math.round(l.durationSeconds / 60)}m`
  ).join('\n');

  // Calculate aggregation for the rest
  const appStats: Record<string, number> = {};
  logs.forEach(l => {
    appStats[l.application] = (appStats[l.application] || 0) + l.durationSeconds;
  });

  const summaryStats = Object.entries(appStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, dur]) => `${name}: ${(dur / 3600).toFixed(1)} hours`)
    .join(', ');

  // Summarize Forensic Artifacts
  const usbArtifacts = artifacts.filter(a => a.type === 'USB_DEVICE').map(a => `- ${a.name} (Serial: ${a.path}) connected at ${a.timestamp}`).join('\n');
  const recentDocs = artifacts.filter(a => a.type === 'RECENT_DOC' && a.riskLevel === 'HIGH').map(a => `- HIGH RISK FILE: ${a.name} in ${a.path}`).join('\n');

  return `
Data Summary:
Top Apps by Duration: ${summaryStats}

Forensic Highlights:
USB Connections:
${usbArtifacts || 'None detected.'}

Sensitive File Access (Recent Docs):
${recentDocs || 'No high risk files detected.'}

Recent Detailed Activity Log (Last 30 events):
${recentLogs}
  `;
};

export const analyzeLogsWithGemini = async (
  logs: LogEntry[], 
  artifacts: ForensicArtifact[],
  userPrompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_API_KEY.");
  }

  const contextData = summarizeLogsForContext(logs, artifacts);

  const systemInstruction = `
    You are an expert Digital Forensics and Productivity Analyst. 
    You are analyzing a user's PC usage history logs and forensic artifacts (USB history, Shellbags, Recent Docs).
    
    Your goal is to provide insights on:
    1. Productivity trends (Deep work vs Distraction).
    2. Data Exfiltration Risks: Look for USB usage combined with sensitive file access.
    3. Anomalies: Strange app usage or access to system folders via Shellbags.
    4. Provide a "Threat Score" estimate (0-100) based on the artifacts.

    Be professional, concise, and helpful. Use Markdown for formatting.
    Do not invent data. Base your analysis only on the provided summary.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context Data:\n${contextData}\n\nUser Question: ${userPrompt}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with AI service. Please check your API key or try again.";
  }
};