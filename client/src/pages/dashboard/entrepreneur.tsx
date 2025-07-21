import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CollaborationRequestComponent } from '@/components/ui/collaboration-request';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Search, Calendar, TrendingUp, DollarSign, Users as UsersIcon, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function EntrepreneurDashboard() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/requests'],
    enabled: !!token,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/entrepreneur-stats'],
    enabled: !!token,
    queryFn: () => ({
      valuation: '$5.2M',
      funding: '$1.8M',
      revenue: '$125K',
      teamSize: '15 members',
    }),
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: string }) => {
      return await apiRequest('PATCH', `/api/requests/${requestId}`, { status });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === 'accepted' ? "Request accepted!" : "Request declined",
        description: status === 'accepted' 
          ? "You can now start communicating with this investor." 
          : "The request has been declined.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update request",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const handleAccept = (requestId: number) => {
    updateRequestMutation.mutate({ requestId, status: 'accepted' });
  };

  const handleReject = (requestId: number) => {
    updateRequestMutation.mutate({ requestId, status: 'rejected' });
  };

  const handleMessage = (userId: number) => {
    setLocation(`/chat/${userId}`);
  };

  const pendingRequests = (requests || []).filter((req: any) => req.status === 'pending' && req.receiverId === user?.id);
  const acceptedRequests = (requests || []).filter((req: any) => req.status === 'accepted');

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Entrepreneur Dashboard</h1>
          <p className="text-gray-600">Manage your startup and connect with investors</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Update Your Pitch</h3>
              <p className="text-blue-100 text-sm mb-4">Keep your startup description current</p>
              <Button 
                onClick={() => setLocation(`/profile/${user?.id}`)}
                className="bg-white text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Browse Investors</h3>
              <p className="text-green-100 text-sm mb-4">Find the right funding partners</p>
              <Button 
                onClick={() => setLocation('/discover')}
                className="bg-white text-green-600 hover:bg-green-50 transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Discover
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Schedule Meetings</h3>
              <p className="text-purple-100 text-sm mb-4">Connect with interested investors</p>
              <Button className="bg-white text-purple-600 hover:bg-purple-50 transition-colors">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Collaboration Requests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Collaboration Requests</CardTitle>
            <p className="text-gray-600 text-sm">Manage incoming investor connections</p>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingRequests.length === 0 && acceptedRequests.length === 0 ? (
                  <div className="p-12 text-center">
                    <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No collaboration requests yet</h3>
                    <p className="text-gray-600">When investors are interested in your startup, their requests will appear here.</p>
                  </div>
                ) : (
                  <>
                    {pendingRequests.map((request: any) => (
                      <CollaborationRequestComponent
                        key={request.id}
                        request={request}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        currentUserId={user?.id || 0}
                      />
                    ))}
                    {acceptedRequests.map((request: any) => (
                      <CollaborationRequestComponent
                        key={request.id}
                        request={request}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onMessage={handleMessage}
                        currentUserId={user?.id || 0}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Startup Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Startup Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Company Valuation</span>
                <span className="font-semibold text-gray-900">{stats?.valuation || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Funding Raised</span>
                <span className="font-semibold text-gray-900">{stats?.funding || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="font-semibold text-gray-900">{stats?.revenue || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Team Size</span>
                <span className="font-semibold text-gray-900">{stats?.teamSize || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New investor connection</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Profile viewed 12 times</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Pitch deck updated</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
