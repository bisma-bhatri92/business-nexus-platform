import { Message, User } from '@shared/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message & { sender: User };
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const formattedTime = new Date(message.timestamp || new Date()).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className={cn(
      "flex items-start",
      isOwn ? "justify-end" : "justify-start"
    )}>
      {!isOwn && (
        <Avatar className="w-6 h-6">
          <AvatarImage src={message.sender.avatar || undefined} />
          <AvatarFallback>
            {message.sender.firstName[0]}{message.sender.lastName[0]}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "max-w-xs rounded-lg px-3 py-2",
        isOwn 
          ? "mr-2 bg-primary text-white" 
          : "ml-2 bg-gray-100 text-gray-900"
      )}>
        <p className="text-sm">{message.content}</p>
        <p className={cn(
          "text-xs mt-1",
          isOwn ? "text-blue-100" : "text-gray-500"
        )}>
          {formattedTime}
        </p>
      </div>
      {isOwn && (
        <Avatar className="w-6 h-6">
          <AvatarImage src={message.sender.avatar || undefined} />
          <AvatarFallback>
            {message.sender.firstName[0]}{message.sender.lastName[0]}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
