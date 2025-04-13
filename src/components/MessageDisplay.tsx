import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Edit2, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface MessageDisplayProps {
  content: string;
  isUser: boolean;
  isTyping?: boolean;
  onEdit?: (newContent: string) => void;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({
  content,
  isUser,
  isTyping = false,
  onEdit,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [originalHeight, setOriginalHeight] = useState(0);
  const messageRef = useRef<HTMLDivElement>(null);
  const cleanContent = content.replace(/\*/g, '');
  const paragraphs = cleanContent
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  useEffect(() => {
    if (messageRef.current && !isEditing) {
      setOriginalHeight(messageRef.current.offsetHeight);
    }
  }, [isEditing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    toast.success('Copied to clipboard');
  };

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanContent);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedContent);
    }
    setIsEditing(false);
  };

  const formatParagraph = (text: string) => {
    // Check if it's a code block
    if (text.startsWith('```') && text.endsWith('```')) {
      const code = text.slice(3, -3).trim();
      return (
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto my-2">
          <code>{code}</code>
        </pre>
      );
    }

    // Check if it's a bullet point
    if (text.startsWith('- ') || text.startsWith('* ')) {
      return <li className="ml-4 mb-1 leading-relaxed font-semibold">{text.slice(2)}</li>;
    }

    // Check if it's a numbered list item
    if (/^\d+\.\s/.test(text)) {
      return <li className="ml-4 mb-1 leading-relaxed list-decimal font-semibold">{text.replace(/^\d+\.\s/, '')}</li>;
    }

    // Check if it's a heading
    const trimmedText = text.trim();
    if (trimmedText.startsWith('# ')) {
      return (
        <h3 className={cn(
          "text-2xl font-bold my-4 tracking-tight",
          isUser ? "text-white" : "text-black dark:text-white"
        )}>
          {trimmedText.substring(2)}
        </h3>
      );
    }

    // Check if it's a subheading
    if (trimmedText.startsWith('## ')) {
      return (
        <h4 className={cn(
          "text-xl font-semibold my-3 tracking-tight",
          isUser ? "text-white" : "text-black dark:text-white"
        )}>
          {trimmedText.substring(3)}
        </h4>
      );
    }

    // Regular paragraph
    return <p className={cn(
      "mb-4 last:mb-0 leading-7 text-base",
      isUser ? "text-white" : "text-black dark:text-white"
    )}>{text}</p>;
  };

  if (isEditing) {
    return (
      <div 
        className={cn(
          "max-w-[80%] rounded-lg p-4 relative",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary"
        )}
        style={{ minHeight: originalHeight }}
      >
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-[800px]  min-h-[inherit] p-2 rounded-md bg-background text-foreground resize-y"
          autoFocus
          style={{ height: 'auto', minHeight: 'calc(100% - 40px)' }}
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSaveEdit}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={messageRef}
      className={cn(
        "max-w-[80%] rounded-lg p-4 relative group",
        isUser
          ? "bg-primary text-primary-foreground"
          : isTyping
            ? "bg-secondary animate-pulse"
            : "bg-secondary"
      )}
    >
      <div className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        !isUser && !isTyping && "pt-6"
      )}>
        <ul className="list-none space-y-1">
          {paragraphs.map((paragraph, index) => (
            <React.Fragment key={index}>
              {formatParagraph(paragraph)}
            </React.Fragment>
          ))}
        </ul>
      </div>

      {!isUser && !isTyping && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTextToSpeech}
            className="h-8 w-8"
          >
            <Volume2 className={cn("h-4 w-4", isSpeaking && "text-primary")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}; 