import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { UserCard } from '@/components/ui/user-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Handshake, TrendingUp, Bell, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function InvestorDashboard() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const { data: entrepreneurs, isLoading } = useQuery({
    queryKey: ['/api/entrepreneurs'],
    enabled: !!token,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    enabled: !!token,
    queryFn: () => ({
      connections: 24,
      deals: 7,
      portfolio: '$2.4M',
      requests: 12,
    }),
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (receiverId: number) => {
      return await apiRequest('POST', '/api/requests', {
        receiverId,
        message: 'I\'m interested in learning more about your startup and potential investment opportunities.',
      });
    },
    onSuccess: () => {
      toast({
        title: "Connection request sent!",
        description: "The entrepreneur will be notified of your interest.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to send request",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const handleConnect = (userId: number) => {
    sendRequestMutation.mutate(userId);
  };

  const filteredEntrepreneurs = entrepreneurs?.filter((entrepreneur: any) => {
    const matchesSearch = searchTerm === '' || 
      entrepreneur.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrepreneur.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrepreneur.profile?.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = industryFilter === '' || entrepreneur.profile?.industry === industryFilter;
    const matchesStage = stageFilter === '' || entrepreneur.profile?.stage === stageFilter;
    
    return matchesSearch && matchesIndustry && matchesStage;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investor Dashboard</h1>
          <p className="text-gray-600">Discover promising entrepreneurs and startups</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Connections</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.connections || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Handshake className="h-6 w-6 text-accent" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.deals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.portfolio || '$0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">New Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.requests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search entrepreneurs, startups, industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-3">
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="sustainability">Sustainability</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Funding Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Stages</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button className="px-6 bg-primary text-white hover:bg-secondary transition-colors">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entrepreneur Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="ml-4">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex space-x-3">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntrepreneurs?.map((entrepreneur: any) => (
              <UserCard
                key={entrepreneur.id}
                user={entrepreneur}
                onConnect={handleConnect}
                showConnectButton={entrepreneur.id !== user?.id}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredEntrepreneurs?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No entrepreneurs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
