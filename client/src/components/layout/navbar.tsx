import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated || !user) return null;

  const dashboardPath = user.role === 'investor' ? '/dashboard/investor' : '/dashboard/entrepreneur';

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href={dashboardPath}>
                <h1 className="text-2xl font-bold text-primary cursor-pointer">Business Nexus</h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href={dashboardPath}>
                  <a className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(dashboardPath) 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-primary'
                  }`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/discover">
                  <a className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/discover') 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-primary'
                  }`}>
                    Discover
                  </a>
                </Link>
                <Link href="/messages">
                  <a className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/messages') 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-primary'
                  }`}>
                    Messages
                  </a>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-700 font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.id}`}>
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
