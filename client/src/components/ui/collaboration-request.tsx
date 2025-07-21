import { CollaborationRequest, User } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface CollaborationRequestProps {
  request: CollaborationRequest & { sender: User; receiver: User };
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
  onMessage?: (userId: number) => void;
  currentUserId: number;
}

export function CollaborationRequestComponent({ 
  request, 
  onAccept, 
  onReject, 
  onMessage,
  currentUserId 
}: CollaborationRequestProps) {
  const isReceiver = request.receiverId === currentUserId;
  const otherUser = isReceiver ? request.sender : request.receiver;
  
  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="w-12 h-12">
              <AvatarImage src={otherUser.avatar || undefined} />
              <AvatarFallback>
                {otherUser.firstName[0]}{otherUser.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              <p className="text-sm text-gray-500">{otherUser.role}</p>
              {request.message && (
                <p className="text-sm text-gray-600 mt-1">{request.message}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            {getStatusBadge()}
            <div className="flex space-x-2 mt-2">
              {request.status === 'pending' && isReceiver && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onAccept(request.id)}
                    className="bg-accent text-white hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(request.id)}
                  >
                    Decline
                  </Button>
                </>
              )}
              {request.status === 'accepted' && onMessage && (
                <Button
                  size="sm"
                  onClick={() => onMessage(otherUser.id)}
                  className="bg-primary text-white hover:bg-secondary transition-colors"
                >
                  Message
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
