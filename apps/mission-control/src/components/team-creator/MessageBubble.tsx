'use client';

import { User, Bot, AlertCircle } from 'lucide-react';
import type { TeamCreatorMessage } from './types';

interface Props {
  message: TeamCreatorMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = message.metadata?.error;

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className={`px-3 py-1.5 rounded-full text-xs ${
          isError 
            ? 'bg-red-500/20 text-red-400' 
            : 'bg-mc-bg-tertiary text-mc-text-secondary'
        }`}>
          {isError && <AlertCircle className="w-3 h-3 inline mr-1" />}
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-mc-accent/20 text-mc-accent' 
          : 'bg-purple-500/20 text-purple-400'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-mc-accent text-white rounded-tr-sm' 
            : 'bg-mc-bg-tertiary text-mc-text rounded-tl-sm'
        }`}>
          <MessageContent content={message.content} />
        </div>
        <div className={`text-xs text-mc-text-secondary mt-1 ${isUser ? 'mr-2' : 'ml-2'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\n\n|\n(?=[#|*\-\d]))/);
  
  return (
    <div className="space-y-2 text-sm leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith('## ')) {
          return <h3 key={i} className="font-semibold text-base mt-2">{part.slice(3)}</h3>;
        }
        if (part.startsWith('### ')) {
          return <h4 key={i} className="font-medium mt-1">{part.slice(4)}</h4>;
        }
        if (part.startsWith('| ')) {
          return <TableContent key={i} content={part} />;
        }
        if (part.match(/^\d+\.\s/)) {
          return <div key={i} className="pl-4">{part}</div>;
        }
        if (part.match(/^[-*]\s/)) {
          return <div key={i} className="pl-4">{part}</div>;
        }
        if (part.startsWith('```')) {
          const code = part.replace(/```\w*\n?/g, '');
          return (
            <pre key={i} className="bg-black/20 rounded p-2 text-xs overflow-x-auto">
              {code}
            </pre>
          );
        }
        return part.trim() ? <span key={i}>{part}</span> : null;
      })}
    </div>
  );
}

function TableContent({ content }: { content: string }) {
  const rows = content.split('\n').filter(r => r.startsWith('|'));
  if (rows.length < 2) return <span>{content}</span>;

  const headers = rows[0].split('|').filter(Boolean).map(h => h.trim());
  const dataRows = rows.slice(2).map(row => 
    row.split('|').filter(Boolean).map(c => c.trim())
  );

  return (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10">
            {headers.map((h, i) => (
              <th key={i} className="px-2 py-1 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => (
            <tr key={i} className="border-b border-white/5">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
