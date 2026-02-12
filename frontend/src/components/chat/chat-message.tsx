
import { DirectMessage } from '@/types/chat';
import { Check, CheckCheck, Download, FileIcon, FileText } from 'lucide-react';
import React from 'react';

type ChatMessageProps = {
  message: DirectMessage;
  isOwn: boolean;
  showTail?: boolean;
  onImageClick?: (url: string) => void;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn, showTail = true, onImageClick }) => {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  function isImage(url: string) {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(url);
  }

  function getFileName(url: string) {
    return url.split('/').pop() || 'File';
  }

  function getFileIcon(url: string, className = "h-5 w-5") {
    if (/\.pdf$/i.test(url)) return <FileText className={`${className} text-red-500`} />;
    if (/\.(doc|docx)$/i.test(url)) return <FileText className={`${className} text-blue-500`} />;
    if (/\.(txt|md)$/i.test(url)) return <FileText className={`${className} text-stone-500`} />;
    return <FileIcon className={`${className} text-primary`} />;
  }

  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`relative max-w-[80%] md:max-w-[60%] px-3 py-2 text-sm shadow-sm
        ${isOwn ? 'bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg rounded-br-lg' : 'bg-muted text-foreground rounded-r-lg rounded-tl-lg rounded-bl-lg'}
        ${showTail && isOwn ? 'rounded-tr-none' : ''}
        ${showTail && !isOwn ? 'rounded-tl-none' : ''}
        `}
      >
        
        {/* Tail SVG */}
        {showTail && isOwn && (
             <svg viewBox="0 0 8 13" height="13" width="8" className="absolute -right-[8px] top-0 fill-primary">
                 <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
             </svg>
        )}
         {showTail && !isOwn && (
             <svg viewBox="0 0 8 13" height="13" width="8" className="absolute -left-[8px] top-0 fill-muted scale-x-[-1]">
                 <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
             </svg>
        )}

        {/* Attachment Content */}
        {message.imageUrl && (
          <div className="mb-2">
            {isImage(message.imageUrl) ? (
               <div 
                 className="overflow-hidden rounded-md cursor-pointer transition-opacity hover:opacity-90"
                 onClick={() => onImageClick?.(message.imageUrl!)}
               >
                 <img src={message.imageUrl} alt="Attachment" className="h-auto w-full object-cover" />
               </div>
            ) : (
                <a 
                  href={message.imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-lg p-2 border border-border/10 bg-black/5 hover:bg-black/10 transition-colors ${isOwn ? 'text-primary-foreground' : 'text-foreground'}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/20">
                    {getFileIcon(message.imageUrl, "h-5 w-5")}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="truncate text-xs font-medium opacity-90">{getFileName(message.imageUrl)}</p>
                    <p className="text-[10px] opacity-70">Click to download</p>
                  </div>
                  <Download className="h-4 w-4 opacity-70" />
                </a>
            )}
          </div>
        )}

        {/* Text Content */}
        {message.body && (
           <div className={`whitespace-pre-wrap break-words pr-2 leading-relaxed ${!message.imageUrl ? '-mt-1' : ''}`}>
               {message.body}
               <span className="inline-block w-12 h-0"></span> 
           </div>
        )}

        {/* Metadata (Time + Ticks) */}
        <div className={`float-right -mt-1 flex items-center gap-1 text-[10px] ml-1 h-3 select-none ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          <span>{formatTime(message.createdAt)}</span>
          
          {isOwn && (
            <span>
              {message.status === 'sent' && <Check size={14} strokeWidth={1.5} />}
              {message.status === 'delivered' && <CheckCheck size={14} strokeWidth={1.5} />}
              {message.status === 'read' && <CheckCheck size={14} strokeWidth={1.5} className="text-blue-300" />} 
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
