import { useEffect, useState } from 'react';
import { socketManager } from '@/lib/socket';
import { useAuth } from '@/hooks/use-auth';

export function useSocket() {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketManager.connect(token);
      
      const handleAuthSuccess = () => setIsConnected(true);
      const handleAuthError = () => setIsConnected(false);
      
      socketManager.on('auth_success', handleAuthSuccess);
      socketManager.on('auth_error', handleAuthError);

      return () => {
        socketManager.off('auth_success', handleAuthSuccess);
        socketManager.off('auth_error', handleAuthError);
      };
    } else {
      socketManager.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, token]);

  return {
    isConnected,
    sendMessage: socketManager.sendMessage.bind(socketManager),
    on: socketManager.on.bind(socketManager),
    off: socketManager.off.bind(socketManager),
  };
}
