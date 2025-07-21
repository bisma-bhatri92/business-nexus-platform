import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ChatMessage } from '@/components/ui/chat-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function Chat() {
  const params = useParams();
  const otherUserId = parseInt(params.userId as string);
  const { user, token } = useAuth();
  const { sendMessage, on, off } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: otherUser } = useQuery({
    queryKey: ['/api/profile', otherUserId],
    enabled: !!token && !!otherUserId,
  });

  const { data: initialMessages } = useQuery({
    queryKey: ['/api/chat', otherUserId],
    enabled: !!token && !!otherUserId,
  });

  useEffect(() => {
    if (initialMessages && Array.isArray(initialMessages)) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.message.senderId === otherUserId || data.message.receiverId === otherUserId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    const handleMessageSent = (data: any) => {
      setMessages(prev => [...prev, data.message]);
    };

    on('new_message', handleNewMessage);
    on('message_sent', handleMessageSent);

    return () => {
      off('new_message', handleNewMessage);
      off('message_sent', handleMessageSent);
    };
  }, [otherUserId, on, off]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && otherUserId) {
      sendMessage(otherUserId, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!otherUser) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
              <p className="text-gray-600">The requested user could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          {/* Chat Header */}
          <CardHeader className="flex flex-row items-center space-y-0 pb-4 border-b">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser?.avatar || undefined} />
              <AvatarFallback>
                {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <CardTitle className="text-lg">
                {otherUser?.firstName} {otherUser?.lastName}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {otherUser?.profile?.company || otherUser?.role}
              </p>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === user?.id}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-primary text-white hover:bg-secondary transition-colors"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
