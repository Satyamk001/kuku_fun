import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 p-3 bg-muted rounded-2xl w-fit mb-2 shadow-sm rounded-tl-none">
      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
    </div>
  );
};

export default TypingIndicator;
