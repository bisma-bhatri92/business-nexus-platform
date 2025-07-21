import { User, Profile } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Handshake } from 'lucide-react';
import { Link } from 'wouter';

interface UserCardProps {
  user: User & { profile?: Profile };
  onConnect: (userId: number) => void;
  showConnectButton?: boolean;
}

export function UserCard({ user, onConnect, showConnectButton = true }: UserCardProps) {
  const { profile } = user;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-gray-500">{profile?.company}</p>
            <div className="flex items-center mt-1">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Verified
              </Badge>
            </div>
          </div>
        </div>
        
        {user.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{user.bio}</p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          {user.location && (
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {user.location}
            </span>
          )}
          {profile?.employees && (
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {profile.employees} employees
            </span>
          )}
        </div>
        
        <div className="flex space-x-3">
          {showConnectButton && (
            <Button 
              onClick={() => onConnect(user.id)}
              className="flex-1 bg-primary text-white hover:bg-secondary transition-colors"
            >
              <Handshake className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/profile/${user.id}`}>
              View Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
