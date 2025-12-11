import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Key, Save } from 'lucide-react';
import { LogEntry, ForensicArtifact } from '../types';
import { analyzeLogsWithGemini } from '../services/geminiService';

interface AIAnalysisProps {
  logs: LogEntry[];
  artifacts?: ForensicArtifact[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ logs, artifacts = [] }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: '데이터 분석이 완료되었습니다. 생산성 추세, 이상 징후, 또는 USB 및 파일 접근 기록(포렌식 아티팩트)에 대해 질문해 주세요.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // API Key State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [tempKey, setTempKey] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(!apiKey);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', tempKey.trim());
      setApiKey(tempKey.trim());
      setIsEditingKey(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!apiKey) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'API Key가 설정되지 않았습니다. 상단의 "API Key 설정" 버튼을 눌러 키를 입력해주세요.',
        timestamp: new Date()
      }]);
      setIsEditingKey(true);
      return;
    }

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await analyzeLogsWithGemini(logs, artifacts, userMsg.content, apiKey);
      const aiMsg: Message = {
        role: 'ai',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다. API 키가 유효한지 확인해주세요.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Chat Header with API Key toggle */}
      <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Gemini 포렌식 어시스턴트</h3>
            <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditingKey(!isEditingKey)}
          className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
        >
          <Key className="w-3 h-3" />
          {apiKey ? 'API Key 변경' : 'API Key 설정'}
        </button>
      </div>

      {/* API Key Input Section */}
      {isEditingKey && (
        <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex flex-col md:flex-row gap-2 items-center animate-fade-in transition-all">
          <div className="relative flex-1 w-full">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="password" 
              placeholder="Enter Google Gemini API Key" 
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-600 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
          </div>
          <button 
            onClick={handleSaveKey}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors w-full md:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}
            `}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={`
              max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user' 
                ? 'bg-indigo-600/20 border border-indigo-500/20 text-indigo-100 rounded-tr-sm' 
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'}
            `}>
              {msg.content}
              <span className="text-[10px] text-slate-500 block mt-2 opacity-70">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
              <span className="text-sm text-slate-400">데이터를 분석 중입니다...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-800/30 border-t border-slate-700">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={apiKey ? "USB 기록, 파일 접근 내역 또는 특이사항에 대해 물어보세요..." : "분석을 시작하려면 API Key를 설정하세요."}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-4 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          AI 분석 결과는 부정확할 수 있습니다. 중요한 포렌식 증거는 원본 로그를 확인하세요.
        </p>
      </div>
    </div>
  );
};